import { CommonModule, NgIf } from "@angular/common";
import { afterNextRender, Component, Input } from "@angular/core";
import type { MarkdownLayoutProps } from "astro";
import { setupShakyText } from "@/utils/shakyText";

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
  imports: [CommonModule],
  templateUrl: "./sessionsIndex.component.html",
  styleUrl: "./sessionsIndex.component.scss",
})
export class SessionsIndexComponent {
  @Input() files: Record<string, any>[] = [];

  showFiles: File[] = [];
  showAll: boolean = true;
  page: number = 0;
  pageFiles = 10;

  // from latest to most recent
  private get _files() {
    return (this.files as File[]).toSorted((a, b) =>
      this.compareDates(b.frontmatter.date, a.frontmatter.date)
    );
  }
  get numPages() {
    return Math.ceil(this.files.length / this.pageFiles);
  }

  buildFiles() {
    if (this.showAll) {
      this.showFiles = this._files;
    } else {
      this.showFiles = this._files.slice(
        this.page * this.pageFiles,
        (this.page + 1) * this.pageFiles
      );
    }
  }

  ngOnInit() {
    this.buildFiles();
  }

  ngAfterViewChecked() {
    setupShakyText();
  }

  changeMode() {
    this.showAll = !this.showAll;
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
}
