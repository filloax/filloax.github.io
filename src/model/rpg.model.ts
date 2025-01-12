import type { DefaultFrontmatter } from "./post.model";

interface RpgFrontMatter extends DefaultFrontmatter {
  title: string;
  date: string;
  new?: boolean;
}

export interface SessionFrontMatter extends RpgFrontMatter {
  players: string[];
  recap?: string;
  levelup?: number;
}

export interface SettingFrontMatter extends RpgFrontMatter {
}