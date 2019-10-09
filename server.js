var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

app.use("/", express.static(__dirname + "/dist"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/dist/index.html");
});

server.listen(process.env.PORT || 8081, function() {
    console.log("Listening on " + server.address().port);
});

var bombs = [];
const BOMB_TIMEOUT = 3000;

io.on("connection", function(socket) {
    console.log("connected");
    socket.on("newplayer", function(data) {
        console.log("player " + data.id.toString() + " has entered");
        socket.player = {
            id: data.id,
            x: randomInt(20,780),
            y: randomInt(20,588)
        };
        socket.emit("bombs", bombs);
        socket.emit("allplayers", getAllPlayers());
        socket.broadcast.emit("newplayer", socket.player);

        socket.on("dropbomb", function(data) {
            bombs.push({parent_id: socket.player.id, x: socket.player.x, y: socket.player.y+20});
            setTimeout(function(){ bombs.shift(); io.emit("bombs", bombs); }, BOMB_TIMEOUT);
            io.emit("bombs", bombs);
        });

        socket.on("direct", function(data) {
            let speed = 1;
            socket.player.x += speed*data.direction.x;
            socket.player.y += speed*data.direction.y;
            io.emit("move", socket.player);
        });

        socket.on("disconnect", function(){
            console.log("player " + socket.player.id + " has left");
            io.emit("remove", socket.player.id);
        });
    });
});

function getAllPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    console.log(players);
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
