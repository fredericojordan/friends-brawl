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
var player;
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
    client.socket.emit("newplayer");
};
client.direct = function(direction) {
  client.socket.emit("direct", {direction: direction});
};
client.dropBomb = function() {
  client.socket.emit("dropbomb");
};

client.socket.on("remove", function(id) {
    removePlayer(id);
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

function animatePlayerSprite(id, dx, dy) {
  var player = playerMap[id];
  if (player) {
    if (dx > 0) {
      player.anims.play("right", true);
    } else if (dx < 0) {
      player.anims.play("left", true);
    } else {
      if (dy > 0) {
        player.anims.play("right", true);
      } else if (dy < 0) {
        player.anims.play("left", true);
      } else {
        player.anims.play("turn", true);
      }
    }
  }
}

function movePlayer(id, x, y) {
  var player = playerMap[id];
  if (player) {
    player.x = x;
    player.y = y;

    if (id !== my_id) {
      animatePlayerSprite(id, x - player.x, y - player.y);
    }
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
    my_id = data.id;
    playerMap[data.id] = players.create(data.x, data.y, "dude");
    players.setDepth(1);
  });
  client.socket.on("allplayers", function(data) {
    for (var i = 0; i < data.length; i++) {
        playerMap[data[i].id] = players.create(data[i].x, data[i].y, "dude");
    }
    players.setDepth(1);
  });
  client.socket.on("bombs", function(data) {
    bombs.clear(true, true);
    for (var i = 0; i < data.length; i++) {
        bombs.create(data[i].x, data[i].y, "bomb");
    }
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
  // this.physics.add.collider(player, bombs, hitBomb, null, this);

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
  preMove(my_id, direction);
  client.direct(direction);

  rt.clear();
  rt.draw(layer);
}

function preMove(player_id, direction) {
  var player = playerMap[player_id];
  if (player) {
    var new_x = player.x + direction.x;
    var new_y = player.y + direction.y;
    movePlayer(my_id, new_x, new_y);
  }
}

function hitBomb(player, _bomb) {
  this.physics.pause();
  gameOver = true;

  if (my_id && playerMap[my_id]) {
    playerMap[my_id].setTint(0xff0000);
  }
}