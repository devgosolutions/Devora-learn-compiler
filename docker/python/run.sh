#!/bin/sh
# run.sh for Python
if [ -f /code/stdin.txt ]; then
    python3 /code/main.py < /code/stdin.txt
else
    python3 /code/main.py
fi
