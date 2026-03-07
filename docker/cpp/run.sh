#!/bin/sh
# run.sh for C++
if [ -f /code/stdin.txt ]; then
    g++ -O2 -o /tmp/out /code/main.cpp 2> /tmp/compile_errors.txt
    if [ $? -ne 0 ]; then
        cat /tmp/compile_errors.txt >&2
        exit 1
    fi
    /tmp/out < /code/stdin.txt
else
    g++ -O2 -o /tmp/out /code/main.cpp 2> /tmp/compile_errors.txt
    if [ $? -ne 0 ]; then
        cat /tmp/compile_errors.txt >&2
        exit 1
    fi
    /tmp/out
fi
