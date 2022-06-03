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

function getPublicRooms() {
  // const sids = io.sockets.adapter.sids;
  // const rooms = io.sockets.adapter.rooms;

  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRooms(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  // 닉네임 초기화
  socket["nickname"] = "Anonymous";
  // Open Rooms 목록에 열려 있는 채팅방 이름 추가
  io.sockets.emit("room_change", getPublicRooms());

  socket.on("enter_room", (roomName, user, done) => {
    socket.join(roomName); // 현재 소켓을 roomName이라는 채팅방에 참가 (채팅방에 입장)
    const roomCount = countRooms(roomName);
    done(roomCount);
    socket.to(roomName).emit("welcome", user, roomCount);

    // 서버 소켓 메소드 사용해서 전체 채팅방에 메시지(공지) 보내기
    io.sockets.emit("room_change", getPublicRooms());
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRooms(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    io.sockets.emit("room_change", getPublicRooms());
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// 3000번 포트를 통해 websocket, http 프로토콜을 이용해서 접속할 수 있음
httpServer.listen(3000, handleListen);
