#!/bin/bash

find /words -type f -iname "e*.txt" -exec bash -c 'dawgdic-build -g "$1" > "${1%.txt}.dawg"' _ {} \;