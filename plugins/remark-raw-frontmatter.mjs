import {visit} from 'unist-util-visit';

export default function remarkRawFrontmatter() {
  return (tree, file) => {
    let rawMarkdown = '';

    visit(tree, 'text', (node) => {
      rawMarkdown += node.value + '\n';
    });

    // Ensure the frontmatter exists
    if (!file.data) file.data = {};
    if (!file.data.frontmatter) file.data.frontmatter = {};

    // Add the raw markdown to the frontmatter
    file.data.astro.frontmatter.rawMarkdown = rawMarkdown.trim();
  };
}