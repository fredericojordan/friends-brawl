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

server.listen(8081, function() {
    console.log("Listening on " + server.address().port);
});

server.lastPlayerID = 0;

io.on("connection", function(socket) {
    socket.on("newplayer", function() {
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(20,780),
            y: randomInt(20,588)
        };
        socket.emit("allplayers", getAllPlayers());
        socket.broadcast.emit("newplayer", socket.player);

        socket.on("click", function(data) {
            console.log("click to " + data.x + ", " + data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit("move",socket.player);
        });

        socket.on("disconnect",function(){
            io.emit("remove",socket.player.id);
        });
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
