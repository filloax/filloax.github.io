import type { DefaultFrontmatter } from "./post.model";

export interface SessionFrontMatter extends DefaultFrontmatter {
  title: string;
  date: string;
  players: string[];
  recap?: string;
  levelup?: number;
  new?: boolean;
}

export interface SettingFrontMatter extends DefaultFrontmatter {
  title: string;
  date: string;
}