# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.194.3/containers/debian/.devcontainer/base.Dockerfile

# [Choice] Debian version: bullseye, buster, stretch
ARG VARIANT="buster"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

# ** [Optional] Uncomment this section to install additional packages. **
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \ 
    && curl -sL https://deb.nodesource.com/setup_14.x | sudo bash - \
    && apt-get update && apt-get install nodejs

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y locales \
    && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure locales \
    && update-locale LANG=en_US.UTF-8

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y chromium

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y pkg-config build-essential libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg62-turbo-dev libgif-dev python

RUN apt-get autoremove -y \
    && apt-get clean -y

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium