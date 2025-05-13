#! /bin/bash

# Build the Docker image
docker buildx build --platform linux/amd64 -t registry.digitalocean.com/unit-engineering/loadtest-app:latest ./Buildfile
docker push registry.digitalocean.com/unit-engineering/loadtest-app:latest

# Run the container
# docker run -p 3003:3003 registry.digitalocean.com/unit-engineering/loadtest-app:latest
