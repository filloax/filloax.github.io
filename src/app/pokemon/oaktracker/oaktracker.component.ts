import { Component } from '@angular/core';
import { LocationArea, TrackerLocation } from './oaktracker.model';
import { HttpClient } from '@angular/common/http';
import { ViewComponent } from "./view/view.component";

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

  constructor(
    private http: HttpClient,
  ) {

  }

  ngOnInit() {
    console.log("oak tracker init!");
    this.retrieveLocations("main", x => this.locationsMain = x);
    this.retrieveLocations("postgame", x => this.locationsPostgame = x);
  }

  private retrieveLocations(set: string, setter: ((x: TrackerLocation[]) => void)) {
    this.http.get(`assets/data/oaktracker/bbvw2/${set}.json`).subscribe(r => {
      const locations: TrackerLocation[] = Object.keys(r).map(locKey => {
        const locationData = r[locKey];

        return new TrackerLocation(
          locKey,
          Object.entries(locationData).map(([key, value]) => LocationArea.parse(key, value)),
        );
      });
      console.log(locations);
      setter(locations);
    });
  }
}
