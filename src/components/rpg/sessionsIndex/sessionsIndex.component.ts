import { CommonModule, NgIf, registerLocaleData } from "@angular/common";
import localeIt from '@angular/common/locales/it';
import { afterNextRender, Component, ElementRef, Input, LOCALE_ID, Renderer2, type SimpleChanges } from "@angular/core";
import type { MarkdownLayoutProps } from "astro";
import { setupShakyText } from "@/utils/shakyText";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faArrowDownWideShort,
  faArrowUpWideShort,
} from "@fortawesome/free-solid-svg-icons";
import { EllipsisDirective } from "@/directives/ellipsis.directive";
import { Constants } from "@/utils/constants";
import type { SessionFrontMatter } from "@/model/rpg.model";
import { navigate } from 'astro:transitions/client';
import { getSessionId } from "@/utils/rpg/getSessionId";

registerLocaleData(localeIt);

type File = MarkdownLayoutProps<SessionFrontMatter>;

@Component({
  selector: "app-sessions-index",
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, EllipsisDirective],
  templateUrl: "./sessionsIndex.component.html",
  styleUrl: "./sessionsIndex.component.scss",
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
  ],
})
export class SessionsIndexComponent {
  @Input() files: Record<string, any>[] = [];
  @Input() baseUrl: string = "";

  showFiles: File[] = [];
  showAll: boolean = true;
  page: number = 0;
  pageFiles = 10;
  recentFirst = true;

  // fileRecapsRaw: Record<string, string> = {};
  hoveredCard: any = null;
  sessionLevels: Record<string, number> = {};

  faArrowDownWideShort = faArrowDownWideShort;
  faArrowUpWideShort = faArrowUpWideShort;

  get numPages() {
    return Math.ceil(this.files.length / this.pageFiles);
  }

  constructor(
    private renderer2: Renderer2,
  ) {
    afterNextRender(this.onRender.bind(this));
  }

  ngOnInit() {
    this.buildFiles();
    this.loadLevels();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.files) {
      this.buildFiles();
      this.loadLevels();
    }
  }

  buildFiles() {
    const files = this.files as File[];
    if (!this.files) return;
    
    const sortedFiles = this.recentFirst
      ? files.toSorted((a, b) =>
          this.compareDates(b.frontmatter.date, a.frontmatter.date)
        )
      : files.toSorted((a, b) =>
          this.compareDates(a.frontmatter.date, b.frontmatter.date)
        );

    if (this.showAll) {
      this.showFiles = sortedFiles;
    } else {
      this.showFiles = sortedFiles.slice(
        this.page * this.pageFiles,
        (this.page + 1) * this.pageFiles
      );
    }

    // this.showFiles.forEach(file => {
    //   this.fileRecapsRaw[file.file] = file.frontmatter.recap;
    // });
  }

  loadLevels() {
    const files = this.files as File[];
    const sortedFiles = files.toSorted((a, b) =>
        this.compareDates(a.frontmatter.date, b.frontmatter.date)
      );

    let level = 1;
    // find starting level
    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      if (file.frontmatter.levelup) {
        level = file.frontmatter.levelup;
        if (i > 0) // if not first, starts from level before
          level--;
        break;
      }
    }

    const levels = {};
    for (const file of sortedFiles) {
      if (file.frontmatter.levelup) {
        level = file.frontmatter.levelup;
      }
      levels[file.file] = level;
    }
    this.sessionLevels = levels;
  }

  onRender() {
    setupShakyText();
  }

  changeMode() {
    this.showAll = !this.showAll;
    this.buildFiles();
  }

  changeOrder() {
    this.recentFirst = !this.recentFirst;
    this.buildFiles();
  }

  setPage(i: number) {
    this.page = i;
    this.buildFiles();
  }

  // dates must be YYYY-MM-DD
  compareDates(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1.getTime() - d2.getTime();
  }

  private getOgHeight(card: HTMLElement) {
    return card.dataset[Constants.Dataset.ORIGINAL_HEIGHT];
  }

  calcFullHeight(card: HTMLElement) {
    if (this.getOgHeight(card)) {
      return `calc(${this.getOgHeight(card)} + 1rem)`;
    }
    return '';
  }

  calcFullMaxHeight(card: HTMLElement) {
    if (this.getOgHeight(card)) {
      return `calc(${this.getOgHeight(card)} + 3rem)`;
    }
    return '';
  }

  startHover(card: HTMLElement) {
    this.hoveredCard = card;
  }

  endHover(card: HTMLElement) {
    this.hoveredCard = null;
  }

  openSession(frontmatter: SessionFrontMatter) {
    const id = getSessionId(frontmatter);
    navigate(`${this.baseUrl}/${id}`);
  }
}
