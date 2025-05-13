#! /bin/bash

BASE_URL=""

k6 run --iterations 500 --vus 200 -e BASE_URL="${BASE_URL}" ./k6.js
