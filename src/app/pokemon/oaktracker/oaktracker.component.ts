import { Component } from '@angular/core';
import { LocationArea, TrackedPokemon, TrackerLocation } from './oaktracker.model';
import { HttpClient } from '@angular/common/http';
import { ViewComponent } from "./view/view.component";
import { StorageService } from '../../services/storage.service';
import { map, merge, Observable, tap, zip } from 'rxjs';

const CAUGHT_KEY = "oakTrackerCaught"

@Component({
  selector: 'app-oaktracker',
  standalone: true,
  imports: [ViewComponent],
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
  }

  saveCaught(caught: Record<string, boolean>) {
    this.caught = Object.assign(this.caught, caught);
    this.storage.setItem(CAUGHT_KEY, JSON.stringify(this.caught));
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
    const caughtData = caughtJson ? JSON.parse(caughtJson) : {};
    const loadedKeys = Object.keys(caughtData);

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
