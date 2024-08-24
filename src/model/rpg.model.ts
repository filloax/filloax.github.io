export interface SessionFrontMatter {
  title: string;
  date: string;
  players: string[];
  recap?: string;
  levelup?: number;
  new?: boolean;
  rawMarkdown: string;
}

export interface SessionPost {
  frontmatter: SessionFrontMatter,
  Content: any,
}