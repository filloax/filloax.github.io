import {ItemType} from "@/utils/rpg/5e-enum.ts";

export const api5eUrl = import.meta.env['CUSTOM_5E_URL'].replace(/\/$/, '');

export function resolveImageHref(href: Href) {
    if (href.type == "external") {
        return href.url;
    } else {
        return `${api5eUrl}/img/${href.path}`;
    }
}

export function getFluffImage(entry: {fluff?: Fluff}) {
    if (entry.fluff?.images?.length) {
        return resolveImageHref(entry.fluff.images[0]?.href);
    }
}

export interface Entry5e {
    name: string;
    source: string;
}

export interface Item extends Entry5e {
    rarity: string,
    wondrous: true,
    entries: string[],
    fluff?: Fluff,
    value: number,
    type: ItemType,
}

export interface Fluff {
    name: string,
    source: string,
    images: Link[];
}

export interface Link {
    type: string;
    href: Href;
}

export interface Href {
    type: string;
    path?: string;
    url?: string;
}