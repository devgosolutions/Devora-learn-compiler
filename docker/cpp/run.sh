#!/bin/sh
# run.sh for C++
g++ -O2 -o /tmp/out /code/main.cpp 2> /tmp/compile_errors.txt
if [ $? -ne 0 ]; then
    cat /tmp/compile_errors.txt >&2
    exit 1
fi

chmod +x /tmp/out

if [ -f /code/stdin.txt ]; then
    /tmp/out < /code/stdin.txt
else
    /tmp/out
fi
