import type { DefaultFrontmatter } from "@/model/post.model";
import { render, type AnyEntryMap, type CollectionEntry } from "astro:content";

/**
 * Also handles post refs
 * @param post Collection entry
 */
export async function renderTypedPost<T extends DefaultFrontmatter>(post: CollectionEntry<keyof AnyEntryMap>) {
    const { Content, remarkPluginFrontmatter } = await render(post);
    
    const data = remarkPluginFrontmatter as T;

    return { post, data, Content };
}