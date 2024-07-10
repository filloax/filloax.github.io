import { Component } from '@angular/core';

@Component({
  selector: 'app-legacy',
  template: '<div></div>',
  standalone: true
})
export class LegacyComponent {
  ngOnInit() {
    window.location.href = '/assets/old-site/index.html';
  }
}