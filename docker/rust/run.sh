#!/bin/sh
# run.sh for Rust
rustc /code/main.rs -o /tmp/out 2> /tmp/compile_errors.txt
if [ $? -ne 0 ]; then
    cat /tmp/compile_errors.txt >&2
    exit 1
fi

/tmp/out
