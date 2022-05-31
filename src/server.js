import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views/");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// http를 이용해서 서버 생성
const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

io.on("connection", (socket) => {
  // 닉네임 초기화
  socket["nickname"] = "Anonymous";

  socket.on("enter_room", (roomName, user, done) => {
    socket.join(roomName); // 현재 소켓을 roomName이라는 채팅방에 참가 (채팅방에 입장)
    done();
    socket.to(roomName).emit("welcome", user);
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// 3000번 포트를 통해 websocket, http 프로토콜을 이용해서 접속할 수 있음
httpServer.listen(3000, handleListen);
