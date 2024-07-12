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
  imports: [CommonModule, KeyValuePipe, FormsModule, MatCheckbox],
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
    console.log("BUILT", this.locationEntries);
  }

  setCaught(name: string, value: boolean) {
    if (!this.caught[name]) return;

    this.caught[name].caught = value;

    this.saveCaught.emit({name: value})
  }
}
