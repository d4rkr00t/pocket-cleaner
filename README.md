# Pocket Cleaner

Removes all articles which older than number of days which you define.

> Required: nodejs >= 0.12 or iojs because of generators.

## Usage

```
git clone https://github.com/d4rkr00t/pocket-cleaner.git
cd pocket-cleaner
npm i
npm run init
```

Then you should create your app at [Pocket Developer](http://getpocket.com/developer/apps/) and get consumer key and access token. Then fill config.js with this keys and set number of days after which article will be deleted.

In ```pocket-cleaner``` directory run:

```
node cleaner.js
```
