import type { SessionFrontMatter } from "@/model/rpg.model";

export default function getSessionId(frontmatter: SessionFrontMatter | string) {
  const title =
    typeof frontmatter === "string" ? frontmatter : frontmatter.title;

  const id = parseInt(
    title.split("-")[0].toLowerCase().replaceAll(/[^\d]/g, "")
  );
  if (!id && id !== 0) {
    throw Error(`Invalid session number in ${title}`);
  }
  return id;
}
