import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  EncounterInfo,
  LocationArea,
  LocationSubarea,
  TrackedPokemon,
  TrackerLocation,
} from '../oaktracker.model';
import {
  CommonModule,
  KeyValuePipe,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-oakview',
  standalone: true,
  imports: [
    CommonModule, KeyValuePipe, FormsModule,
    MatCheckbox
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
})
export class ViewComponent {
  @Input() locations: TrackerLocation[] = [];
  @Input() caught: Record<string, TrackedPokemon> = {};

  locationEntries: {
    location: TrackerLocation;
    rows: object[];
  }[];

  @Output() saveCaught = new EventEmitter<Record<string, boolean>>();

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
        rows: [...x.iteratePokemon()],
      };
    });
  }

  setCaught(name: string, value: boolean) {
    if (!this.caught[name]) return;

    this.caught[name].caught = value;

    this.saveCaught.emit({name: value})
  }

  caughtPct(where: TrackerLocation | LocationArea) {
    const total = (where instanceof TrackerLocation)
      ? (where.areas.reduce((a, b) => {
        return a + (b.encounters ? b.encounters.length : b.subareas.map(x => x.encounters.length).reduce((x, y) => x + y, 0));
      }, 0))
      : (where.encounters ? where.encounters.length : where.subareas.map(x => x.encounters.length).reduce((x, y) => x + y, 0));
    return this.caughtNum(where) / total;
  }

  caughtNum(where: TrackerLocation | LocationArea): number {
    if (where instanceof TrackerLocation) {
      return where.areas.map(this.caughtNum).reduce((x, y) => x + y, 0);
    } else {
      return where.encounters
        ? (where.encounters.filter(e => this.caught[e.name]?.caught).length)
        : (
          where.subareas.map(s => s.encounters.filter(e => this.caught[e.name]?.caught).length)
            .reduce((a, b) => a + b, 0)
        );
    }
  }
}
