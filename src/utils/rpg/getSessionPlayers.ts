import type { SessionFrontMatter } from "@/model/rpg.model";

const playerPattern = /(.+?)\((.+)\)/

export default function getSessionPlayers(frontmatter: SessionFrontMatter) {
  return frontmatter.players.map((player) => {
    const match = playerPattern.exec(player);
    if (!match) throw Error("Invalid player string: " + player);

    let [_, character, owner] = match;
    character = character.trim();
    owner = owner.trim();
    return {character, player: owner}
  });
}
