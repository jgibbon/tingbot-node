
### Install a recent version of Node.js (my preferred way is via nvm) on Raspbian: ###

The following shell commands might get you started:
```bash
sudo apt install build-essential libssl-dev
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash

# download current nodejs
nvm install stable && nvm use stable

# wiring-pi needs to run with sudo, so we'll copy it over:
n=$(which node);n=${n%/bin/node};
chmod -R 755 $n/bin/*;
sudo cp -r $n/{bin,lib,share} /usr/local
```
The debian version is still available as `nodejs`, while the current stable version just installed works only as `node`
