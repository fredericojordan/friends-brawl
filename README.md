# Friends Brawl

A brawl-type multiplayer game. Currently in development and made available at [http://friends-brawl.herokuapp.com/](http://friends-brawl.herokuapp.com/).

Frontend uses [Phaser](https://phaser.io/phaser3) gaming framework and multiplayer made possible via [Socket.IO](https://socket.io/).

ES6 support via [Babel 7](https://babeljs.io/) and bundle created using [Webpack](https://webpack.js.org/).

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Instructions

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run-script build` | Builds code bundle with production settings (minification, uglification, etc..) |
| `node server.js` | Starts server and listens on `$PORT` (or `8081` by default) |

After cloning the repo, run `npm install` from your project directory to install dependencies.

Then you can run the command `npm run-script build`, and your code will be built into a single bundle
located at  `dist/bundle.min.js` along with any other assets you project dependes on.

After generating the webpack bundle, you can start serving it using `node server.js`, which will make the game
available at `http://localhost:8081` (or the port defined by the env var `PORT`).
