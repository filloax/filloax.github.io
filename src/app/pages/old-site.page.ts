import { afterNextRender, Component } from "@angular/core";

@Component({
    standalone: true,
    template: ``
})
export default class OldSiteRedirect { 
    constructor() {
        afterNextRender(() => {
            window.location.href = '/old-site/index.html';
        });
    }
}