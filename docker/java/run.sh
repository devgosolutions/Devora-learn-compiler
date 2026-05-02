#!/bin/sh
# run.sh for Java
javac /code/Main.java -d /tmp 2> /tmp/compile_errors.txt
if [ $? -ne 0 ]; then
    cat /tmp/compile_errors.txt >&2
    exit 1
fi

java -cp /tmp Main
