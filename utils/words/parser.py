import string, re

with open("words_hspell.txt", "w", encoding="utf8") as o:
    for filename in ["wolig.txt", "woo.txt"]:
        with open(filename, encoding="utf8") as f:
            firstWord = True
            for line in f:
                line = line.rstrip()
                if line.startswith("#"):
                    continue
                elif firstWord:
                    if '"' not in line:
                        o.write(re.sub(r'[a-zA-Z]', '', line) + "\n")
                    firstWord = False
                elif line.startswith("-"):
                    firstWord = True
                else:
                    continue
    
    for filename in ["extrawords.txt"]:
        with open(filename, encoding="utf8") as f:
            for line in f:
                line = line.rstrip()
                o.write(line + "\n")

