import io
import os
import re
import ruamel.yaml

yaml = ruamel.yaml.YAML()
yaml.indent(mapping=4, sequence=4, offset=2)
yaml.preserve_quotes = True

# Directory where your .mdx files are located
directory = os.path.join(os.path.dirname(__file__), '../src/content/rpg/star/sessions')

# Regular expressions
frontmatter_pattern = re.compile(r'^---\s*\n(.*?)\n---', re.DOTALL)
players_pattern = re.compile(r'^\n?Partecipano:\s*(.*)\n?', re.MULTILINE)

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Extract and parse the frontmatter
    frontmatter_match = frontmatter_pattern.search(content)
    if not frontmatter_match:
        print(f"No frontmatter found in {file_path}")
        return

    frontmatter = frontmatter_match.group(1)
    frontmatter_data = yaml.load(frontmatter)

    # Find Players block
    players_match = players_pattern.search(content)
    if players_match:
        players_str = players_match.group(1)
        players_list = [player.strip() for player in players_str.split(',')]
        
        # Add Players to frontmatter as a YAML list
        frontmatter_data['players'] = players_list

        # Remove old Players block from the content
        content = players_pattern.sub('', content)

        # Reconstruct the file with the updated frontmatter
        buf = io.BytesIO()
        yaml.dump(frontmatter_data, buf)
        updated_frontmatter = '---\n' + buf.getvalue().decode('UTF-8') + '---'
        new_content = frontmatter_pattern.sub(updated_frontmatter, content)

        # Save the updated file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)

        print(f"Updated {file_path}")
    # else:
    #     print(f"No Players block found in {file_path}")

# Process all .mdx files in the directory
for filename in os.listdir(directory):
    if filename.endswith('.mdx'):
        process_file(os.path.join(directory, filename))
