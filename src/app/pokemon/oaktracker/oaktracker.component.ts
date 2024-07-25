import { Component } from '@angular/core';
import { HiddenGrottoEncounterInfo, HiddenGrottos, LocationArea, LocationSubarea, TrackedPokemon, TrackerLocation } from './oaktracker.model';
import { HttpClient } from '@angular/common/http';
import { ViewComponent } from "./view/view.component";
import { StorageService } from '../../services/storage.service';
import { map, merge, Observable, tap, zip } from 'rxjs';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { Utils } from '../../shared/utils';

const CAUGHT_KEY = "oakTrackerCaught"

@Component({
  selector: 'app-oaktracker',
  standalone: true,
  imports: [
    ViewComponent,
    MatTab, MatTabGroup, MatButtonModule,
  ],
  templateUrl: './oaktracker.component.html',
  styleUrl: './oaktracker.component.scss'
})
export class OaktrackerComponent {
  locationsMain: TrackerLocation[];
  locationsPostgame: TrackerLocation[];
  caught: Record<string, TrackedPokemon> = {};
  loaded = false;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
  ) {

  }

  ngOnInit() {
    zip([
      this.retrieveLocations("main", x => this.locationsMain = x),
      this.retrieveLocations("postgame", x => this.locationsPostgame = x),
    ]).subscribe(_ => this.retrieveAndAddHiddenGrottos().subscribe(_ => {
      this.initCaught();
      this.loaded = true;
    }));

    document.querySelectorAll('.container').forEach(e => e.classList.add('fullwidth'));
  }

  ngOnDestroy() {
    document.querySelectorAll('.container').forEach(e => e.classList.remove('fullwidth'));
  }

  saveCaught(caught: Record<string, boolean>) {
    Object.entries(caught).forEach(([name, value]) => {
      this.caught[name] = {
        name: name,
        caught: value,
      }
    });
    this.storage.setItem(CAUGHT_KEY, this.caughtToJson(this.caught));
  }

  caughtToJson(caught: Record<string, TrackedPokemon>): string {
    return JSON.stringify(Object.values(caught)
        .filter(x => x.caught)
        .map(x => x.name)
      );
  }

  caughtFromJson(text: string): Record<string, TrackedPokemon> | null {
    const data: string[] = JSON.parse(text);
    if (!(data instanceof Array)) {
      console.warn("Cannot parse saved data!")
      return null;
    }
    return Object.fromEntries(data.map(name => [name, {
      name: name,
      caught: true,
    }]));
  }

  downloadCaught() {
    const data = Object.values(this.caught).filter(x => x.caught).map(x => x.name);
    console.log("Downloading:", this.caught);
    let dl = document.createElement('a');
    dl.download = 'tracker-data.json';
    dl.href = `data:application/json;charset=utf-8,${this.caughtToJson(this.caught)}`;
    dl.click();
  }

  uploadCaught(file: File) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const text = fileReader.result.toString();
      const data = this.caughtFromJson(text);
      if (data) {
        localStorage.setItem(CAUGHT_KEY, text);
        this.initCaught();
      }
    };
    fileReader.readAsText(file);
  }

  private initCaught() {
    const baseNames = new Set([
        ...this.locationsMain,
        ...this.locationsPostgame,
      ].flatMap(l => l.areas.flatMap(a => a.encounters
        ? a.encounters.flatMap(x => x.name)
        : a.subareas.flatMap(s => s.encounters.flatMap(x => x.name))
      )));

    const caughtJson = this.storage.getItem(CAUGHT_KEY);
    const caughtData = caughtJson ? this.caughtFromJson(caughtJson) : {};
    const loadedKeys = caughtData ? Object.keys(caughtData) : [];

    this.caught = {
      ...caughtData,
      ...Object.fromEntries([...baseNames]
          .filter(x => !loadedKeys.includes(x))
          .map(n => [n, {name: n, caught: false}])
        ),
    };
  }

  private retrieveLocations(set: string, setter: ((x: TrackerLocation[]) => void)): Observable<TrackerLocation[]> {
    return this.http.get(`assets/data/oaktracker/bbvw2/${set}.json`).pipe(
        map(r => Object.keys(r).map(locKey => {
          const locationData = r[locKey];

          return new TrackerLocation(
            locKey,
            Object.entries(locationData).map(([key, value]) => LocationArea.parse(key, value)),
          );
        })),
        tap(locations => {
          setter(locations);
        }),
      )
  }

  // Must have set locations before
  private retrieveAndAddHiddenGrottos(): Observable<void> {
    return this.http.get(`assets/data/oaktracker/bbvw2/hidden_grotto.json`).pipe(
      map(r => {
        const hgData = HiddenGrottos.parse(r);

        const mainKeys = this.locationsMain.map(x => x.name);
        const postgameKeys = this.locationsPostgame.map(x => x.name);
        const mainEntries: Record<number, [string, Record<string, HiddenGrottoEncounterInfo[]>][]> = {};
        const postgameEntries: Record<number, [string, Record<string, HiddenGrottoEncounterInfo[]>][]> = {};

        const addTo = (entries, i, entry) => {
          return Utils.computeIfAbsent(entries, i, () => []).push(entry);
        }

        Object.entries(hgData.grottos).forEach(([hgName, hgData]) => {
          const lowerHg = hgName.toLowerCase();
          const mainIndices = Utils.findIndices(mainKeys, key => Utils.sameWordsPrefix(lowerHg, key));
          const postgameIndices = Utils.findIndices(postgameKeys, key => Utils.sameWordsPrefix(lowerHg, key));
          if (mainIndices.length === 0 && postgameIndices.length === 0) {
            console.log(`Match not found for '${hgName}'!`);
            return;
          }
          mainIndices.forEach(i => addTo(mainEntries, i, [hgName, hgData]));
          postgameIndices.forEach(i => addTo(postgameEntries, i, [hgName, hgData]));
        });

        Object.entries(mainEntries).forEach(([i, entries]) => {
          const loc: TrackerLocation = this.locationsMain[i]
          loc.areas.push(...entries.map(([hgName, hgData]) => {
            const area = new LocationArea(`Grotto (${hgName})`, Object.entries(hgData).map(([grottoSub, grottoInfos]) => {
                const sub = new LocationSubarea();
                sub.name = grottoSub;
                sub.encounters = grottoInfos.map(x => ({
                    name: x.pokemon,
                    chancePct: 0,
                    levelRange: [0,0],
                    notes: x.forcedFirst ? "Forced first encounter" : null,
                  }));
                return sub;
              }), null);
            area.isGrotto = true;
            return area;
          }));
        });
      }),
    );
  }
}
