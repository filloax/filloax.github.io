import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';

const starItems = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/rpg/star/items" }),
});
const starSessions = defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/rpg/star/sessions" }),
});

const soliPosts = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/rpg/soli/post" }),
});
const gearPosts = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/rpg/gears/post" }),
});

const freeShop = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/rpg/free/shop" }),
});
const freeTextFrags = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/rpg/free/text" }),
});

export const collections = {
    'rpg-star-items': starItems,
    'rpg-star-sessions': starSessions,
    'rpg-soli-post': soliPosts,
    'rpg-gears-post': gearPosts,
    'rpg-free-shop': freeShop,
    'rpg-free-text-frags': freeTextFrags,
};