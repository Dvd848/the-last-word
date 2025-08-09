import string, re

words = set()


for filename in ["wolig.txt", "woo.txt", "shemp.txt"]:
    with open(filename, encoding="utf8") as f:
        for line in f:
            line = line.rstrip()
            if line.startswith("#"):
                continue
            elif "-" in line:
                continue
            elif '"' in line:
                continue
            elif line.strip() == "":
                continue
            else:
                word = re.sub(r'[a-zA-Z]', '', line)
                word = word.replace("+", "")
                words.add(word)

for filename in ["extrawords.txt", "customwords.txt", "2_letter_words.txt"]:
    with open(filename, encoding="utf8") as f:
        for line in f:
            line = line.rstrip()
            if line.startswith("#"):
                continue
            words.add(line)

with open("words_hspell.txt", "w", encoding="utf8") as o:
    for word in sorted(words):
        o.write(word + "\n")