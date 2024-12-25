import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';

const starItems = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/rpg/star/items" }),
});
const starSessions = defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/rpg/star/sessions" }),
});

console.log("[DEBUG 1] COLL STAR ITEMS:", starItems);

export const collections = {
    'rpg-star-items': starItems,
    'rpg-star-sessions': starSessions,
};