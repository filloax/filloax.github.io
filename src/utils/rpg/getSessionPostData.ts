import type { SessionFrontMatter, SessionPost } from "@/model/rpg.model";
import type { MarkdownLayoutProps } from "astro";
import readingTime from "reading-time";
import getSessionId from "./getSessionId";

export default function getSessionPostData(
  session: SessionPost
) {
  return {
    id: getSessionId(session.frontmatter),
    readingTime: readingTime(session.frontmatter.rawMarkdown).text,
  };
}
