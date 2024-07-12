import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  EncounterInfo,
  LocationArea,
  LocationSubarea,
  TrackerLocation,
} from '../oaktracker.model';
import {
  CommonModule,
  KeyValuePipe,
  NgClass,
  NgFor,
  NgIf,
} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-oakview',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, FormsModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
})
export class ViewComponent {
  @Input() locations: TrackerLocation[] = [];

  locationEntries: {
    location: TrackerLocation;
    rows: object[];
  }[];

  @Output() saveEncounters = new EventEmitter<any>();

  ngOnInit() {
    this.buildTable();
  }

  ngOnChanges(changes: any) {
    if (changes.locations) {
      this.buildTable();
    }
  }

  buildTable() {
    this.locationEntries = this.locations?.map((x) => {
      return {
        location: x,
        rows: [...this.iteratePokemon(x)],
      };
    });
    console.log("BUILT", this.locationEntries);
  }

  *iteratePokemon(trackerLocation: TrackerLocation): IterableIterator<{
    encounter: EncounterInfo;
    area: LocationArea;
    subarea: LocationSubarea | null;
    newArea: boolean;
    newSubarea: boolean;
  }> {
    for (const area of trackerLocation.areas) {
      if (area.encounters) {
        for (const [i, encounter] of area.encounters.entries()) {
          yield {
            encounter: encounter,
            area: area,
            subarea: null,
            newArea: i == 0,
            newSubarea: false,
          };
        }
      }
      else if (area.subareas) {
        for (const [i, subarea] of area.subareas.entries()) {
          for (const [j, encounter] of subarea.encounters.entries()) {
            yield {
              encounter: encounter,
              area: area,
              subarea: subarea,
              newArea: i == 0 && j == 0,
              newSubarea: j== 0,
            };
          }
        }
      }
    }
  }
}
