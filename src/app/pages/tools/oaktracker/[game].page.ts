import { Component, Input } from '@angular/core';
import { OaktrackerComponent } from '../../../components/tools/oaktracker/oaktracker.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  template: `
    <app-oaktracker [folderName]="game" *ngIf="valid; else invalid"></app-oaktracker>
    <ng-template #invalid><div>This game is not available!</div></ng-template>
  `,
  imports: [
    OaktrackerComponent,
    CommonModule,
  ]
})
export default class OakTrackerPageComponent {
  @Input() game: string;

  get valid() { return [
    'bbvw2',
  ].includes(this.game) }
}