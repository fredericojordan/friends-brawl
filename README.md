# Friends Brawl

[![Build](https://circleci.com/gh/fredericojordan/friends-brawl.svg?style=svg)](https://circleci.com/gh/fredericojordan/friends-brawl)

A brawl-type multiplayer game. Currently in development and made available at
[friends-brawl.herokuapp.com](http://friends-brawl.herokuapp.com/).

Frontend uses [Phaser](https://phaser.io/phaser3) gaming framework and multiplayer made possible via
[Socket.IO](https://socket.io/).

ES6 support via [Babel](https://babeljs.io/) and bundle created using [Webpack](https://webpack.js.org/).

## Build

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

### Available commands:

| Command                | Description                                                                     |
|------------------------|---------------------------------------------------------------------------------|
| `npm install`          | Install project dependencies                                                    |
| `npm run-script build` | Builds code bundle with production settings (minification, uglification, etc..) |
| `node server.js`       | Starts server and listens on `$PORT` (or `8081` by default)                     |

After cloning the repo, run `npm install` from your project directory to install dependencies.

Then you can run the command `npm run-script build`, and your code will be built into a single bundle
located at  `dist/bundle.min.js`.

You can then start the server by running `node server.js`, which will make the game
available at [`localhost:8081`](http://localhost:8081).
