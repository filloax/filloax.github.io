import { CommonModule, NgIf } from "@angular/common";
import { afterNextRender, Component, ElementRef, Input, Renderer2 } from "@angular/core";
import type { MarkdownLayoutProps } from "astro";
import { setupShakyText } from "@/utils/shakyText";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faArrowDownWideShort,
  faArrowUpWideShort,
} from "@fortawesome/free-solid-svg-icons";
import { EllipsisDirective } from "@/directives/ellipsis.directive";
import { Constants } from "@/utils/constants";

export interface SessionFrontMatter {
  title: string;
  date: string;
  recap?: string;
  levelup?: number;
  new?: boolean;
}

type File = MarkdownLayoutProps<SessionFrontMatter>;

@Component({
  selector: "app-sessions-index",
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, EllipsisDirective],
  templateUrl: "./sessionsIndex.component.html",
  styleUrl: "./sessionsIndex.component.scss",
})
export class SessionsIndexComponent {
  @Input() files: Record<string, any>[] = [];

  showFiles: File[] = [];
  showAll: boolean = true;
  page: number = 0;
  pageFiles = 10;
  recentFirst = true;

  // fileRecapsRaw: Record<string, string> = {};
  hoveredCard: any = null;

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

  buildFiles() {
    const files = this.recentFirst
      ? (this.files as File[]).toSorted((a, b) =>
          this.compareDates(b.frontmatter.date, a.frontmatter.date)
        )
      : (this.files as File[]).toSorted((a, b) =>
          this.compareDates(a.frontmatter.date, b.frontmatter.date)
        );

    if (this.showAll) {
      this.showFiles = files;
    } else {
      this.showFiles = files.slice(
        this.page * this.pageFiles,
        (this.page + 1) * this.pageFiles
      );
    }

    // this.showFiles.forEach(file => {
    //   this.fileRecapsRaw[file.url] = file.frontmatter.recap;
    // });
  }

  onRender() {
    setupShakyText();
  }

  ngOnInit() {
    this.buildFiles();
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
}
