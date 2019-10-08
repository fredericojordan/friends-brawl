import Phaser from "phaser";

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
var playerMap;
var client = {};
var add = {add:false, id:0, x:0, y:0};

var game = new Phaser.Game(config);

client.socket = io.connect();
client.askNewPlayer = function() {
    client.socket.emit("newplayer");
};
client.sendClick = function(x, y) {
  client.socket.emit("click", {x:x, y:y});
};
client.socket.on("newplayer", function(data) {
    addNewPlayer(data.id,data.x,data.y);
});
client.socket.on("allplayers", function(data) {
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        addNewPlayer(data[i].id, data[i].x, data[i].y);
    }
});
client.socket.on("remove", function(id) {
    removePlayer(id);
});
client.socket.on("move", function(data) {
    movePlayer(data.id, data.x, data.y);
});

function getCoordinates(layer, pointer) {
    client.sendClick(pointer.worldX, pointer.worldY);
}

function addNewPlayer(id, x, y) {
  add = {add:true, id:id, x:x, y:y};
    // playerMap[id] = this.physics.add.sprite(x, y, "dude");
}

function removePlayer(id) {
    playerMap[id].destroy();
    delete playerMap[id];
}

function movePlayer(id, x, y) {
    var player = playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var duration = distance*10;
    var tween = this.add.tween(player);
    tween.to({x:x, y:y}, duration);
    tween.start();
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
  playerMap = {};
  client.askNewPlayer();

  let map = this.make.tilemap({ key: "map" });
  var tiles = map.addTilesetImage("Desert", "tiles");
  layer = map.createDynamicLayer("Ground", tiles, 0, 0).setVisible(false);
  layer.inputEnabled = true; // Allows clicking on the map
  // layer.events.onInputUp.add(getCoordinates, this);
  rt = this.add.renderTexture(0, 0, 800, 800);

  player = this.physics.add.sprite(100, 450, "dude");
  player.setCollideWorldBounds(true);
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

  bombs = this.physics.add.group();
  for (let i = 0; i <= 10; i++) {
    let vx = Phaser.Math.Between(0, 800);
    let vy = Phaser.Math.Between(10, 30);
    var bomb = bombs.create(vx, vy, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update()
{
  if (gameOver) {
    return;
  }

  if (add.add) {
    playerMap[add.id] = this.physics.add.sprite(add.x, add.y, "dude");
    add.add = false;
  }

  player.setVelocityX(0);
  player.setVelocityY(0);

  if (cursors.left.isDown || keys.A.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown || keys.D.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.anims.play("turn");
  }

  if (cursors.up.isDown || keys.W.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown || keys.S.isDown) {
    player.setVelocityY(160);
  }

  rt.clear();
  rt.draw(layer);
}

function hitBomb(player, _bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
  gameOver = true;
}