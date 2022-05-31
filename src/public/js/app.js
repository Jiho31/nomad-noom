const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

let roomName;

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

room.hidden = true;

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `📍 Room ${roomName}`;

  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();

  // 닉네임 설정
  const nicknameInput = form.querySelector("#nickname");
  socket.emit("nickname", nicknameInput.value);

  // 채팅방 이름 설정
  const roomInput = form.querySelector("#roomName");

  socket.emit("enter_room", roomInput.value, nicknameInput.value, showRoom);
  roomName = roomInput.value;
  roomInput.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} joined! 😄`);
});

socket.on("bye", (user) => {
  addMessage(`${user} left. 😢`);
});

socket.on("new_message", addMessage);
