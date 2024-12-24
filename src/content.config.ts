import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';

const starItems = defineCollection({
    loader: glob({ pattern: "rpg/star/items/*.[md|mdx]", base: "./src/content" }),
});
const starSessions = defineCollection({
    loader: glob({ pattern: "rpg/star/sessions/*.[md|mdx]", base: "./src/content" }),
});

export const collections = {
    'rpg/star/items': starItems,
    'rpg/star/sessions': starSessions,
};