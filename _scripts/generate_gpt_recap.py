# For now only input, maybe later add calling gpt too

# Control OpenAPI usage: https://platform.openai.com/account/usage

import os, sys
import argparse
import re
from markdown import Markdown
from bs4 import BeautifulSoup, NavigableString, Tag
import openai
import frontmatter
import yaml
import textwrap

rootdir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

parser = argparse.ArgumentParser()

parser.add_argument("campaign", help="campaign name to generate scripts for")
parser.add_argument("-o", "--outdir", default=os.path.join(rootdir, "_data", "gpt"), help="Output directory")
parser.add_argument("-d", "--dry-run", action='store_true', help="Do not run external APIs but print their call data")
parser.add_argument("-K", "--api-key", default=os.path.join(rootdir, "_scripts", "data", "secret", "openai-api.key"), help="OpenAPI api key path")
parser.add_argument("-P", "--post-process", action='store_true', help="Do post processing (fill missing things in out files)")

def main():
    args = parser.parse_args()

    if os.getenv("GITHUB_ACTIONS") == "true":
        print("GPT Recap: In github actions env, aborting...")
        return

    openai.api_key_path = args.api_key

    dir = os.path.join(rootdir, f"_{args.campaign}", "sessions")
    outdir = os.path.join(args.outdir, args.campaign)
    outdir_text = os.path.join(outdir, "plain")
    outdir_gpt = os.path.join(outdir, "out")

    os.makedirs(outdir_text, exist_ok=True)
    os.makedirs(outdir_gpt, exist_ok=True)

    if args.post_process:
        post_process_output(outdir_gpt, args.dry_run)
        return

    changed = update_plain_text(dir, outdir_text)

    update_gpt_recaps(outdir_text, outdir_gpt, changed, args.dry_run)

def update_plain_text(dir, outdir_text) -> list[str]:
    changed = []

    md = Markdown(output_format="html")

    for fn in os.listdir(dir):
        name = fn.replace(".md", "")
        path = os.path.join(dir, fn)

        wip = False
        with open(path, 'r', encoding="utf-8") as f:
            content = f.read()
            post = frontmatter.loads(content)
            if 'wip' in post.keys():
                wip = post['wip']

        if wip:
            continue

        content = re.sub(r'\{:[^\}]+\}', '', content)
        content = re.sub(r'\{%[^(?:%)]+%\}[.\n]*{%\s?end[^(?:%)]+%\}', '', content)
        content = re.sub(r'---.*?---', '', content, 1, re.DOTALL).strip()

        soup = BeautifulSoup(md.convert(content), 'html.parser')

        for ul_tag in soup.find_all('ul'):
            ul_tag.name = 'ul'
            for li_tag in ul_tag.find_all('li'):
                li_tag.insert(0, '- ')
        for ul_tag in soup.find_all('ol'):
            ul_tag.name = 'ol'
            for li_tag in ul_tag.find_all('li'):
                li_tag.insert(0, '- ')

        content = extract_text(soup)

        content = re.sub(r'\n\n+', '\n\n', content)

        plainname = os.path.join(outdir_text, f"{name}.txt")

        should_update = True
        if os.path.exists(plainname):
            simple_content = re.sub(r'[><!?\.,]', '', content)
            with open(plainname, 'r', encoding="utf-8") as of:
                simple_content_2 = re.sub(r'[><!?\.,]', '', of.read().strip())
                if simple_content == simple_content_2:
                    should_update = False
    
        if should_update:
            with open(plainname, 'w', encoding="utf-8") as of:
                print(content, file=of)
                print(f"Updated {name}")
                changed.append(name)

    return changed

def update_gpt_recaps(outdir_text, outdir_gpt, changed, dry):
    model = "gpt-3.5-turbo"

    for fn in os.listdir(outdir_text):
        name = fn.replace(".txt", "")
        plain_fn = os.path.join(outdir_text, fn)
        out_fn = os.path.join(outdir_gpt, f"{name}.yml")

        try:
            with open(plain_fn, 'r', encoding='utf-8') as f:
                big_recap = f.read()
        except Exception:
            return
        
        messages = [
            {"role": "user", "content": big_recap},
            {
                "role": "system", 
                "content": textwrap.dedent("""
                            Riassumi, in italiano, il testo scritto precedentemente dall'utente 
                            in un paragrafo, non troppo lungo se possibile. 
                            Non cominciare menzionando la composizione del gruppo, e non menzionare
                            le eventuali ricompense.
                            Mostra l'output in questo formato, analogo a YAML:
                            ```
                            recap: "<riassunto>"
                            ```
                            Assicurati di non inviare output incompleti o invalidi per il formato.
                            """).strip()
            },
        ]

        if name in changed:
            if dry:
                print(f"{name}:\n\tmodel: {model}\n\tmessages: {messages}")
            else:
                print(f"{name}: Calling OpenAPI")
                output = openai.ChatCompletion.create(model=model, messages=messages)
                print(f"{name}: Done")
                choice = output.get("choices")[0]
                finish_reason = choice["finish_reason"]
                if finish_reason == "stop":
                    choice_text = choice["message"]["content"]
                    with open(out_fn, 'w', encoding='utf-8') as of:
                        of.write(choice_text)
                else:
                    print("Error in GPT API response, finish reason is:", finish_reason)
                    os.path.remove(plain_fn)

def post_process_output(outdir_gpt, dry):
    for fname in os.listdir(outdir_gpt):
        path = os.path.join(outdir_gpt, fname)
        with open(path, 'r', encoding="utf-8") as fr:
            try:
                content = yaml.safe_load(fr)
            except:
                print(f"Error in parsing yaml in file {path}")
                content = None

        if content:
            changed = False
            # if "title" not in content:
            #     content["title"] = ""
            #     changed = True
                
            if "recap" not in content:
                print(f"Recap wasn't correctly produced for {path}")
                
            if not dry:
                with open(path, 'w', encoding="utf-8") as fw:
                    yaml.dump(content, fw, allow_unicode=True)
            elif changed:
                print(f"{fname}: {yaml.dump(content, allow_unicode=True)}")

_inline_elements = {"a","span","em","strong","u","i","font","mark","label",
    "s","sub","sup","tt","bdo","button","cite","del","b","a","font",}

def extract_text(element):
    text = ""
    if isinstance(element, NavigableString):
        text += str(element).strip()
    elif element.name in ["button", "script"]:
        text += ''  # Skip extracting text from <button> tags
    elif element.children:
        for child in element.children:
            if isinstance(child, Tag):
                is_block_element = child.name not in _inline_elements
                if is_block_element:
                    text += "\n"
                text += "\n" if child.name == "br" else extract_text(child)
                if is_block_element:
                    text += "\n"
            elif isinstance(child, NavigableString):
                text += child.string
    else:
        text += element.get_text(separator=' ')

    return text.strip()

if __name__ == "__main__":
    main()