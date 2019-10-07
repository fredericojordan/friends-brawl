import Phaser from "phaser";
import desertTiles from "./assets/tilemaps/tiles/tmw_desert_spacing.png";
import arenaMap from "./assets/tilemaps/maps/map.json";
import dude from "./assets/dude.png";

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

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image("tiles", desertTiles);
  this.load.tilemapTiledJSON("map", arenaMap);
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
}

function update() {
  cursors = this.input.keyboard.createCursorKeys();

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
