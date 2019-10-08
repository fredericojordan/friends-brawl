import Phaser from "phaser";
import desertTiles from "./assets/tilemaps/tiles/tmw_desert_spacing.png";
import arenaMap from "./assets/tilemaps/maps/map.json";
import dude from "./assets/dude.png";
import bomb from "./assets/bomb.png";

var config = {
  type: Phaser.AUTO,
  parent: "friends-brawl",
  width: 800,
  height: 608,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
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
var bombs;
var gameOver = false;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image("tiles", desertTiles);
  this.load.tilemapTiledJSON("map", arenaMap);
  this.load.image("bomb", bomb);
  this.load.spritesheet("dude", dude, {
    frameWidth: 32,
    frameHeight: 48,
  });

}

function create ()
{
  let map = this.make.tilemap({ key: "map" });
  var tiles = map.addTilesetImage("Desert", "tiles");
  layer = map.createDynamicLayer("Ground", tiles, 0, 0).setVisible(false);
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

  bombs = this.physics.add.group();
  for (let i = 0; i <= 10; i++) {
    let x = Phaser.Math.Between(0, 800);
    var bomb = bombs.create(x, 16, "bomb");
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

  player.setVelocityX(0);
  player.setVelocityY(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.anims.play("turn");
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
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