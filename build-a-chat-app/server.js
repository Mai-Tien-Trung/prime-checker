import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { WebSocketServer } from "ws";

const PORT = 3001;

const server = createServer(async (req, res) => {
  const html = await readFile("./public/index.html");

  res.writeHead(200, {
    "Content-Type": "text/html"
  });

  res.end(html);
});

const wss = new WebSocketServer({ server });

function broadcast(message) {
  const data = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

wss.on("connection", (socket, req) => {
  const username = new URL(
    req.url,
    "http://localhost"
  ).searchParams.get("username");

  broadcast({
    type: "system",
    text: `${username} joined`
  });

  socket.on("message", (data) => {
    const { username, text } = JSON.parse(data.toString());

    broadcast({
      type: "chat",
      username,
      text
    });
  });

  socket.on("close", () => {
    broadcast({
      type: "system",
      text: `${username} left`
    });
  });
});

server.listen(PORT, () => {
  console.log("Chat server running at http://localhost:3001");
});