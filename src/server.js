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

// 3000번 포트를 통해 websocket, http 프로토콜을 이용해서 접속할 수 있음
httpServer.listen(3000, handleListen);
