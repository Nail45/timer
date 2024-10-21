require("dotenv").config();

const http = require("http");
const express = require("express");
const nunjucks = require("nunjucks");
const cookie = require("cookie");
const cookieParser = require("cookie-parser");
const { increaseCount, clients } = require("./controllers/timerController");
const { findUserByuserId, sendTimers } = require("./controllers/sessionController");

const WebSocket = require("ws");

const knex = require("./config/knex");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

const PORT = process.env.PORT || 3000;

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
const timerRoutes = require("./routes/timerRoutes");
const indexRoutes = require("./routes/indexRoutes");

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", timerRoutes);

server.on("upgrade", (req, socket, head) => {
  const cookies = cookie.parse(req.headers["cookie"]);
  const userId = cookies["userId"];
  const token = cookies["token"];
  if (!userId) {
    socket.write("HTTP/1.1 401 Unauthorized/r/n/r/n");
    socket.destroy();
    return;
  }

  req.userId = userId;
  req.token = token;
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", async (ws, req) => {
  const userId = req.userId;
  const token = req.token;
  const user = await findUserByuserId(userId);
  clients.set(token, ws);
  // console.log("!", clients);
  // console.log("user", user);
  ws.on("close", () => {
    clients.delete(token);
  });
  let sendIntervalTimers;

  sendTimers(ws, user.id);
  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    clearInterval(sendIntervalTimers);
    sendIntervalTimers = setInterval(async () => {
      const activeTimers = await knex("timers").select().where({
        isActive: data.isActive,
        user_id: user.id,
      });

      ws.send(
        JSON.stringify({
          type: "active_timers",
          timer: {
            active: activeTimers,
          },
        })
      );
    }, 1000);
  });
});

const init = async () => {
  try {
    increaseCount();

    server.listen(PORT, () => {
      console.log(`  Listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

init();
