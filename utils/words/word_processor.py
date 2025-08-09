import re
import shutil
import subprocess
import json

from collections import defaultdict
from pathlib import Path

INPUT_DIR = Path(__file__).parent
INPUT_PREFIX = "words_"
OUTPUT_DIR = Path(__file__).parent / ".." / ".." / "client" / "public" / "wordlists"
OUTPUT_NAME = "HebDict"

TRANSLATE_CHARS = re.compile(r"([\u0590-\u05fe]'?)")

translate_mapping = {
    "א": "a", "ב": "b", "ג": "g", "ג'": "g", "ד": "d", "ה": "h", 
    "ו": "v", "ז": "z", "ז'": "z", "ח": "H", "ט": "T", "י": "y", 
    "כ": "c", "ך": "c", "ל": "l", "מ": "m", "ם": "m", "נ": "n", 
    "ן": "n", "ס": "s", "ע": "e", "פ": "p", "ף": "p", "צ": "w", 
    "צ'": "w", "ץ": "w", "ץ'": "w", "ק": "k", "ר": "r", "ש": "S", 
    "ת": "t", "ת'": "t"
}

reverse_translate_mapping = {
    "a": "א", "b": "ב", "g": "ג", "d": "ד", "h": "ה", 
    "v": "ו", "z": "ז", "H": "ח", "T": "ט", "y": "י", 
    "c": "כ", "l": "ל", "m": "מ", "n": "נ", 
    "s": "ס", "e": "ע", "p": "פ", "w": "צ", 
    "k": "ק", "r": "ר", "S": "ש", 
    "t": "ת"
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
            with open(output_path / f"{prefix}{OUTPUT_NAME}.txt", "w", encoding = "utf8") as o:
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
        config["reverse_translate_mapping"] = reverse_translate_mapping

        list_source = {}
        for directory in OUTPUT_DIR.iterdir():
            if not directory.is_dir():
                continue
            base_name = f"e{OUTPUT_NAME}"
            
            txt_file = Path(directory) / f"{base_name}.txt"
            txt_size = txt_file.stat().st_size
            dawg_size = Path(txt_file.with_suffix(".dawg")).stat().st_size
            current_list_source = "txt" if txt_size <= dawg_size else "dawg"
            list_source[directory.name] = {
                "type": current_list_source,
                "filename": f"{base_name}.{current_list_source}"
            }
        
        config["wordlists"] = list_source
            
        o.write(json.dumps(config, indent=4))
    print("Done creating configuration")

def main():
    init()
    process_words_to_text()
    process_words_to_dawg()
    create_config()


if __name__ == "__main__":
    main()