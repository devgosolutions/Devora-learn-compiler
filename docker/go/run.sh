#!/bin/sh
# run.sh for Go
if [ -f /code/stdin.txt ]; then
    go build -o /tmp/out /code/main.go 2> /tmp/compile_errors.txt
    if [ $? -ne 0 ]; then
        cat /tmp/compile_errors.txt >&2
        exit 1
    fi
    /tmp/out < /code/stdin.txt
else
    go build -o /tmp/out /code/main.go 2> /tmp/compile_errors.txt
    if [ $? -ne 0 ]; then
        cat /tmp/compile_errors.txt >&2
        exit 1
    fi
    /tmp/out
fi
