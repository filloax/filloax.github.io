import { render, type AnyEntryMap, type CollectionEntry } from "astro:content";

/**
 * 
 * @param post Collection entry
 */
export async function renderTypedPost<T>(post: CollectionEntry<keyof AnyEntryMap>) {
    const { Content, remarkPluginFrontmatter } = await render(post);
    return { post, data: remarkPluginFrontmatter as T, Content };
}