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
// var bombs;
var gameOver = false;
var playerMap = {};
var client = {};

var game = new Phaser.Game(config);

client.socket = io.connect();
client.askNewPlayer = function() {
    client.socket.emit("newplayer");
};
client.direct = function(direction) {
  client.socket.emit("direct", {direction: direction});
};
client.socket.on("remove", function(id) {
    removePlayer(id);
});
client.socket.on("move", function(data) {
    movePlayer(data.id, data.x, data.y);
});

function removePlayer(id) {
    playerMap[id].destroy();
    delete playerMap[id];
}

function movePlayer(id, x, y) {
    var player = playerMap[id];
    var dx = x - player.x;
    if (dx > 0) {
      player.anims.play("right", true);
    } else if (dx < 0) {
      player.anims.play("left", true);
    } else {
      player.anims.play("turn", true);
    }
    player.x = x;
    player.y = y;
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
    playerMap[data.id] = self.physics.add.sprite(data.x, data.y, "dude");
  });
  client.socket.on("allplayers", function(data) {
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        playerMap[data[i].id] = self.physics.add.sprite(data[i].x, data[i].y, "dude");
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
  keys = this.input.keyboard.addKeys("W,S,A,D");

  // bombs = this.physics.add.group();
  // for (let i = 0; i < 0; i++) {
  //   let vx = Phaser.Math.Between(0, 800);
  //   let vy = Phaser.Math.Between(10, 30);
  //   var bomb = bombs.create(vx, vy, "bomb");
  //   bomb.setBounce(1);
  //   bomb.setCollideWorldBounds(true);
  //   bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  //   bomb.allowGravity = false;
  // }
  // this.physics.add.collider(player, bombs, hitBomb, null, this);
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

function hitBomb(player, _bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("turn");
  gameOver = true;
}