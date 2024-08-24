export interface SessionFrontMatter {
  title: string;
  date: string;
  players: string[];
  recap?: string;
  levelup?: number;
  new?: boolean;
  rawMarkdown: string;
}
