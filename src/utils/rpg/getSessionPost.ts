import type { SessionPost } from "@/model/rpg.model";
import { render } from "astro:content";

export default async function getSessionPost(collectionPost: any): Promise<SessionPost> {
    return render(collectionPost).then(r => {
        const { Content } = r;
        return {
            Content: Content,
            frontmatter: collectionPost.data,
        }
    });
}