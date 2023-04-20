import re
import shutil
import subprocess
import json

from collections import defaultdict
from pathlib import Path

INPUT_DIR = Path(__file__).parent
INPUT_PREFIX = "words_"
OUTPUT_DIR = Path(__file__).parent / ".." / ".." / "wordlists"

TRANSLATE_CHARS = re.compile(r"([\u0590-\u05fe]'?)")

translate_mapping = {
    "א": "a", "ב": "b", "ג": "g", "ג'": "g", "ד": "d", "ה": "h", 
    "ו": "v", "ז": "z", "ז'": "z", "ח": "H", "ט": "T", "י": "y", 
    "כ": "c", "ך": "c", "ל": "l", "מ": "m", "ם": "m", "נ": "n", 
    "ן": "n", "ס": "s", "ע": "e", "פ": "p", "ף": "p", "צ": "w", 
    "צ'": "w", "ץ": "w", "ץ'": "w", "ק": "k", "ר": "r", "ש": "S", 
    "ת": "t", "ת'": "t"
}

def init():
    try:
        shutil.rmtree(str(OUTPUT_DIR))
    except FileNotFoundError:
        pass
    OUTPUT_DIR.mkdir(parents = True, exist_ok = True)

def process_words_to_text():
    for source in INPUT_DIR.glob(f"{INPUT_PREFIX}*.txt"):

        print(f"Processing {source}")

        identifier = source.stem.replace(INPUT_PREFIX, "")

        output_path = OUTPUT_DIR / identifier
        output_path.mkdir()

        words_mapping = []
        words_mapping_translated = []
        num_words = 0

        with open(source, "r", encoding = "utf8") as f:
            for line in f:
                line = line.rstrip()
                words_mapping.append(line)
                words_mapping_translated.append(TRANSLATE_CHARS.sub(lambda m: translate_mapping.get(m.group(1), 
                                                                                                    m.group(1)), 
                                                                                                    line))
                num_words += 1

        for words, prefix in [(words_mapping, "h"), (words_mapping_translated, "e")]:
            with open(output_path / f"{prefix}.txt", "w", encoding = "utf8") as o:
                o.write("\n".join(sorted(words)))

        license_path = INPUT_DIR / f"license_{identifier}.txt"
        if license_path.exists():
            shutil.copyfile(license_path, output_path / "LICENSE")
        
        print(f"Processed {num_words} words")

def process_words_to_dawg():
    print("Creating DAWGs")

    container_name = "lastword_dict"

    try:
        subprocess.run(f"docker build -t {container_name} .", 
                        shell=True, check=True, capture_output=True, cwd=INPUT_DIR)
    except subprocess.CalledProcessError as e:
        raise RuntimeError("Failed to build docker container") from e


    subcommand = "/bin/bash -c ./dawg_encode.sh"
    command = f'docker run -it --rm --mount type=bind,source="{INPUT_DIR}",target=/app ' \
              f'--mount type=bind,source="{OUTPUT_DIR}",target=/words {container_name} {subcommand}' 
              
    try:
        output = subprocess.run(command, shell=True, check=True, capture_output=True, cwd=INPUT_DIR)
    except subprocess.CalledProcessError as e:
        raise RuntimeError("Failed to encode DAWG") from e
    print("Done creating DAWGs")

def create_config():
    print("Creating configuration")
    with open(OUTPUT_DIR / "config.json", "w", encoding="utf8") as o:
        config = {}
        config["translate_mapping"] = translate_mapping

        list_source = {}
        for directory in OUTPUT_DIR.iterdir():
            if not directory.is_dir():
                continue
            current_list_source = None
            
            txt_file = Path(directory) / "e.txt"
            txt_size = txt_file.stat().st_size
            dawg_size = Path(txt_file.with_suffix(".dawg")).stat().st_size
            current_list_source = "txt" if txt_size <= dawg_size else "dawg"
            list_source[directory.name] = current_list_source
        
        config["list_source"] = list_source
            
        o.write(json.dumps(config, indent=4))
    print("Done creating configuration")

def main():
    init()
    process_words_to_text()
    process_words_to_dawg()
    create_config()


if __name__ == "__main__":
    main()