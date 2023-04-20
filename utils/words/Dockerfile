FROM ubuntu:latest

RUN \
    apt-get update \
 && apt-get install -y perl hspell wget tar dawgdic-tools \
 && wget http://hspell.ivrix.org.il/hspell-1.4.tar.gz \
 && tar -xvf hspell-1.4.tar.gz \
 && rm -rf /var/lib/apt/lists/* 
 
#RUN \
#    cd hspell-1.4 \
# && perl wolig.pl | iconv -f ISO-8859-8 -t UTF-8 > /tmp/wolig.txt \
# && ./woo | iconv -f ISO-8859-8 -t UTF-8 > /tmp/woo.txt 

WORKDIR /app


# docker build -t hspell .
# docker run -it --rm --mount type=bind,source="${PWD}",target=/app --mount type=bind,source="${PWD}\..\..\wordlists",target=/words hspell /bin/bash
# find /words -type f -iname "e*.txt" -exec bash -c 'dawgdic-build -g "$1" > "${1%.txt}.dawg"' _ {} \;