import { Component } from '@angular/core';
import { LocationArea, TrackedPokemon, TrackerLocation } from './oaktracker.model';
import { HttpClient } from '@angular/common/http';
import { ViewComponent } from "./view/view.component";
import { StorageService } from '../../services/storage.service';
import { map, merge, Observable, tap, zip } from 'rxjs';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';

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

  constructor(
    private http: HttpClient,
    private storage: StorageService,
  ) {

  }

  ngOnInit() {
    console.log("oak tracker init!");
    zip([
      this.retrieveLocations("main", x => this.locationsMain = x),
      this.retrieveLocations("postgame", x => this.locationsPostgame = x),
    ]).subscribe(_ => this.initCaught());

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

    console.log("CAUGHT", this.caught);
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
          console.log(locations);
          setter(locations);
        }),
      )
  }
}
