import type { MarkdownLayoutProps } from "astro";
import readingTime from "reading-time";

export interface SessionFrontMatter {
  title: string;
  date: string;
  recap?: string;
  levelup?: number;
  new?: boolean;
  rawMarkdown: string;
}

export function getSessionId(frontmatter: SessionFrontMatter | string) {
    const title = (typeof frontmatter === "string")
        ? frontmatter
        : frontmatter.title

    const id = parseInt(title.split('-')[0].toLowerCase().replaceAll(/[^\d]/g, ''));
    if (!id && id !== 0) {
        throw Error(`Invalid session number in ${title}`);
    }
    return id;
}

export function getSessionPostData(session: MarkdownLayoutProps<SessionFrontMatter>) {
    return {
      id: getSessionId(session.frontmatter),
      readingTime: readingTime(session.frontmatter.rawMarkdown).text,
    }
  }