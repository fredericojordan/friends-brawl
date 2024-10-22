import Phaser from "phaser";
import io from "socket.io-client";

var config = {
  type: Phaser.AUTO,
  parent: "friends-brawl",
  width: 800,
  height: 608,
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var rt;
var layer;
var cursors;
var keys;
var bombs;
var gameOver = false;
var players;
var playerMap = {};
var client = {};
var my_id;

var game = new Phaser.Game(config);

client.socket = io.connect();

client.askNewPlayer = function() {
  my_id = createUUID();
  client.socket.emit("newplayer", {id: my_id});
};
client.direct = function(direction) {
  client.socket.emit("direct", {direction: direction});
};
client.dropBomb = function() {
  client.socket.emit("dropbomb");
};
client.imDead = function() {
  client.socket.emit("imdead");
};

client.socket.on("remove", function(id) {
    removePlayer(id);
});
client.socket.on("died", function(id) {
    killPlayer(id);
});
client.socket.on("move", function(data) {
    movePlayer(data.id, data.x, data.y);
});

function removePlayer(id) {
  if (playerMap[id]) {
    playerMap[id].destroy();
    delete playerMap[id];
  }
}

function killPlayer(id) {
  if (playerMap[id]) {
    playerMap[id].anims.play("turn", true);
    playerMap[id].setTint(0xff0000);
  }
}

function movePlayer(id, x, y) {
  var player = playerMap[id];
  if (player) {
    var dx = x - player.x;
    if (dx > 0) {
      player.anims.play("right", true);
    } else if (dx < 0) {
      player.anims.play("left", true);
    } else {
      var dy = y - player.y;
      if (dy > 0) {
        player.anims.play("right", true);
      } else if (dy < 0) {
        player.anims.play("left", true);
      } else {
        player.anims.play("turn", true);
      }
    }
    player.x = x;
    player.y = y;
  }
}

function preload ()
{
  this.load.image("tiles", "./assets/tilemaps/tiles/tmw_desert_spacing.png");
  this.load.tilemapTiledJSON("map", "./assets/tilemaps/maps/map.json");
  this.load.image("bomb", "./assets/bomb.png");
  this.load.spritesheet("dude", "./assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create ()
{
  var self = this;
  client.askNewPlayer();

  let map = this.make.tilemap({ key: "map" });
  var tiles = map.addTilesetImage("Desert", "tiles");
  layer = map.createDynamicLayer("Ground", tiles, 0, 0).setVisible(false);
  rt = this.add.renderTexture(0, 0, 800, 800);

  client.socket.on("newplayer", function(data) {
    playerMap[data.id] = players.create(data.x, data.y, "dude");
    playerMap[data.id].id = data.id;
    players.setDepth(1);
  });
  client.socket.on("allplayers", function(data) {
    for (var i = 0; i < data.length; i++) {
        playerMap[data[i].id] = players.create(data[i].x, data[i].y, "dude");
        playerMap[data[i].id].id = data[i].id;
    }
    players.setDepth(1);
  });
  client.socket.on("bombs", function(data) {
    bombs.clear(true, true);
    for (var i = 0; i < data.length; i++) {
        var bomb = bombs.create(data[i].x, data[i].y, "bomb");
        bomb.parent_id = data[i].parent_id;
    }
    self.physics.add.collider(players, bombs, hitBomb, null, this);
  });

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();
  keys = this.input.keyboard.addKeys("W,S,A,D,space");

  bombs = this.physics.add.group();
  players = this.physics.add.group();

  keys.space.addListener("up", function() {client.dropBomb();} );
}

function update()
{
  if (gameOver) {
    return;
  }

  var direction = {x: 0, y: 0};
  if (cursors.left.isDown || keys.A.isDown) {
    direction.x = -1;
  } else if (cursors.right.isDown || keys.D.isDown) {
    direction.x = 1;
  }
  if (cursors.up.isDown || keys.W.isDown) {
    direction.y = -1;
  } else if (cursors.down.isDown || keys.S.isDown) {
    direction.y = 1;
  }
  client.direct(direction);

  rt.clear();
  rt.draw(layer);
}

function hitBomb(player, bomb) {
  if (player.id === my_id && bomb.parent_id !== my_id && !gameOver) {
    if (my_id && playerMap[my_id]) {
      playerMap[my_id].anims.play("turn", true);
      playerMap[my_id].setTint(0xff0000);
    }
    gameOver = true;
    client.direct({x: 0, y: 0});
    client.imDead();
  }
}

function createUUID(){

    let dt = new Date().getTime();

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });

    return uuid;
}