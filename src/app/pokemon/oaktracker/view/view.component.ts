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
  PercentPipe,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-oakview',
  standalone: true,
  imports: [
    CommonModule, KeyValuePipe, FormsModule,
    PercentPipe,
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

  caughtPct(where: TrackerLocation | LocationArea | LocationSubarea) {
    return this.caughtNum(where) / where.numEncounters;
  }

  caughtNum(where: TrackerLocation | LocationArea | LocationSubarea): number {
    if (where instanceof TrackerLocation) {
      return where.areas.map(x => this.caughtNum(x)).reduce((x, y) => x + y, 0);
    } else if (where instanceof LocationArea) {
      return where.encounters
        ? (where.encounters.filter(e => this.caught[e.name]?.caught).length)
        : (where.subareas.map(x => this.caughtNum(x)).reduce((x, y) => x + y, 0));
    } else {
      return where.encounters.filter(e => this.caught[e.name]?.caught).length;
    }
  }

  locationLabelsComplete(location: TrackerLocation) {
    return location.areas.filter(x => this.caughtNum(x) >= x.numEncounters)
      .map(x => x.label);
  }

  locationLabelsIncomplete(location: TrackerLocation) {
    return location.areas.filter(x => this.caughtNum(x) < x.numEncounters)
      .map(x => x.label);
  }
}
