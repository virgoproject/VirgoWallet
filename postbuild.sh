#! /bin/sh

browserify --standalone bip39 -r bip39 > background/bip39.js \
&& browserify --standalone HDWalletProvider  -r @truffle/hdwallet-provider:2.1.4 > background/hdwallet.js \
&& mkdir build \
&& cp -r background build \
&& cp -r commonJS build \
&& cp -r content build \
&& cp -r ui build \
&& cp LICENSE build \
&& cp manifest.json build
