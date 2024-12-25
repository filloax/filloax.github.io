import type { SessionPost } from "@/model/rpg.model";
import type { MarkdownLayoutProps } from "astro";
import readingTime from "reading-time";
import getSessionId from "./getSessionId";
import { htmlToText } from 'html-to-text';

export default function getSessionPostData(
  session: SessionPost
) {
  return {
    id: getSessionId(session.frontmatter),
    readingTime: readingTime(htmlToText(session.Content)).text,
  };
}
