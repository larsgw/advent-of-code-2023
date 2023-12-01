#!/usr/bin/env bash

dir="day-$(printf "%02d" $1)"
mkdir -p $dir
cp template.js "$dir/index.js"
curl -L "https://adventofcode.com/2023/day/$1/input" -o "$dir/input.txt"
