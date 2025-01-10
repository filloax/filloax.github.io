import { visit } from "unist-util-visit";
import fs from 'fs';

/**
 * A rehype plugin to add `title` attributes to footnote references with the footnote content.
 */
export default function rehypeFootnoteTitles() {
    return (tree, file) => {
        const footnotesMap = new Map();

        // Collect footnote definitions
        visit(tree, "footnoteDefinition", (node) => {
            const footnoteId = node.identifier;
            const footnoteContent = node.children
                .map((child) => stringifyNode(child))
                .join("");

            // console.log(footnoteId, node, footnoteContent);

            footnotesMap.set(footnoteId, footnoteContent);
        });

        // Add titles to footnote references
        visit(tree, "footnoteReference", (node) => {
            const footnoteId = node.identifier;

            // console.log(footnoteId, footnotesMap.get(footnoteId));

            if (footnotesMap.has(footnoteId)) {
                node.data = node.data || {};
                node.data.hProperties = node.data.hProperties || {};
                node.data.hProperties.title = footnotesMap.get(footnoteId);

                // console.log(node.data);
            }
        });
    };
}

/**
 * Utility function to stringify a node's children.
 */
function stringifyNode(node) {
    if (node.type === "text") {
        return node.value;
    } else if (node.children) {
        return node.children.map(stringifyNode).join("");
    }
    return "";
}
