import { CommonModule, registerLocaleData } from "@angular/common";
import localeIt from '@angular/common/locales/it';
import { afterNextRender, Component, Input, LOCALE_ID, Renderer2, type SimpleChanges } from "@angular/core";
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
import getSessionId from "@/utils/rpg/getSessionId";

registerLocaleData(localeIt);

export interface PostInformation {
  title: string;
  date: string;
  id: string;
  new?: boolean;
  recap?: string;
}

export interface SessionPostInformation extends PostInformation {
  levelup?: number;
}

@Component({
  selector: "app-post-index",
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, EllipsisDirective],
  templateUrl: "./postIndex.component.html",
  styleUrl: "./postIndex.component.scss",
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
  ],
})
export class PostIndexComponent {
  @Input() posts: PostInformation[] = [];
  @Input() baseUrl: string = "";
  @Input() isSession: boolean = false;

  showPosts: PostInformation[] = [];
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
    return Math.ceil(this.posts.length / this.pageFiles);
  }

  get sessionPosts(): SessionPostInformation[] {
    return this.isSession ? this.posts.map(x => x as SessionPostInformation) : [];
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
    const files = this.posts;
    if (!this.posts) return;
    
    const sortedFiles = this.recentFirst
      ? files.toSorted((a, b) =>
          this.compareDates(b.date, a.date)
        )
      : files.toSorted((a, b) =>
          this.compareDates(a.date, b.date)
        );

    if (this.showAll) {
      this.showPosts = sortedFiles;
    } else {
      this.showPosts = sortedFiles.slice(
        this.page * this.pageFiles,
        (this.page + 1) * this.pageFiles
      );
    }

    // this.showFiles.forEach(file => {
    //   this.fileRecapsRaw[file.file] = file.frontmatter.recap;
    // });
  }

  loadLevels() {
    const sessions = this.sessionPosts;
    const sortedSessions = sessions.toSorted((a, b) =>
        this.compareDates(a.date, b.date)
      );

    let level = 1;
    // find starting level
    for (let i = 0; i < sortedSessions.length; i++) {
      if (sessions[i].levelup) {
        level = sessions[i].levelup;
        if (i > 0) // if not first, starts from level before
          level--;
        break;
      }
    }

    const levels = {};
    for (const session of sortedSessions) {
      if (session.levelup) {
        level = session.levelup;
      }
      levels[session.id] = level;
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

  openPost(post: PostInformation) {
    navigate(`${this.baseUrl.replace(/\/$/, '')}/${post.id}`);
  }

  castSession(post: PostInformation) { return post as SessionPostInformation }
}
