import type { SessionFrontMatter } from "@/model/rpg.model";
import type { MarkdownLayoutProps } from "astro";
import readingTime from "reading-time";
import { getSessionId } from "./getSessionId";

export function getSessionPostData(
  session: MarkdownLayoutProps<SessionFrontMatter>
) {
  return {
    id: getSessionId(session.frontmatter),
    readingTime: readingTime(session.frontmatter.rawMarkdown).text,
  };
}
