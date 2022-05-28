import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views/");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// http를 이용해서 서버 생성
const server = http.createServer(app);

// websocket 서버 생성
// http 서버를 인자로 전달하면, 같은 서버에서 http, webSocket을 둘 다 작동할 수 있음
// (단, 필요하지 않은 경우엔 단순히 websocket 서버만 생성할 수 있음)
const wss = new WebSocket.Server({ server });

// webSocket을 이용한 방법
const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous"; // 닉네임을 Anonymous로 초기화
  console.log("Connected to Browser ✅");
  socket.on("close", () => console.log("Disconnected from Browser ❌"));
  socket.on("message", (msg) => {
    const message = JSON.parse(msg.toString("utf8"));

    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        // console.log(message.payload);
        socket["nickname"] = message.payload;
    }
  });
});

// 3000번 포트를 통해 websocket, http 프로토콜을 이용해서 접속할 수 있음
server.listen(3000, handleListen);
