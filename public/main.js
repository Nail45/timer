/*global UIkit, Vue */

(() => {
  const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
  const client = new WebSocket(`${wsProto}//${location.host}`);

  const notification = (config) =>
    UIkit.notification({
      pos: "top-right",
      timeout: 5000,
      ...config,
    });

  const alert = (message) =>
    notification({
      message,
      status: "danger",
    });

  const info = (message) =>
    notification({
      message,
      status: "success",
    });

  const fetchJson = (...args) =>
    fetch(...args)
      .then((res) =>
        res.ok
          ? res.status !== 204
            ? res.json()
            : null
          : res.text().then((text) => {
              throw new Error(text);
            })
      )
      .catch((err) => {
        alert(err.message);
      });

  new Vue({
    el: "#app",
    data: {
      desc: "",
      activeTimers: [],
      oldTimers: [],
    },
    methods: {
      createTimer() {
        const description = this.desc;
        this.desc = "";
        fetchJson("/api/timers", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description }),
        }).then(({ id }) => {
          info(`Created new timer "${description}" [${id}]`);
        });
        client.send(
          JSON.stringify({
            isActive: true,
            createTimer: true,
          })
        );
      },
      stopTimer(id) {
        fetchJson(`/api/timers/${id}/stop`, {
          method: "post",
        }).then(() => {
          info(`Stopped the timer [${id}]`);
        });
        client.send(
          JSON.stringify({
            isActive: true,
            stopTimer: true,
          })
        );
      },
      formatTime(ts) {
        return new Date(ts).toTimeString().split(" ")[0];
      },
      formatDuration(d) {
        d = Math.floor(d / 1000);
        const s = d % 60;
        d = Math.floor(d / 60);
        const m = d % 60;
        const h = Math.floor(d / 60);
        return [h > 0 ? h : null, m, s]
          .filter((x) => x !== null)
          .map((x) => (x < 10 ? "0" : "") + x)
          .join(":");
      },
    },
    created() {
      client.addEventListener("open", () => {
        client.send(
          JSON.stringify({
            isActive: true,
          })
        );
      });
      client.addEventListener("message", (message) => {
        let data;
        try {
          data = JSON.parse(message.data);
        } catch (error) {
          return;
        }
        if (data.type === "all_timers") {
          this.activeTimers = data.timers.active;
          this.oldTimers = data.timers.completed;
        }
        if (data.type === "active_timers") {
          this.activeTimers = data.timer.active;
        }
      });
    },
  });
})();
