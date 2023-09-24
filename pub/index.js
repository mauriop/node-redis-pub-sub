// const json = require("milliparsec");
const Redis = require("ioredis");
const express = require("express");

const redis = new Redis();

const sleep = (ms, cb) => new Promise(() => setTimeout(cb, ms));

const app = express();

app.use(express.json());

app.post("/publish", (req, res) => {
  const timestamp = Date.now();
  //   redis.publish("send-user-data", JSON.stringify({ ts: new Date() }));
  redis.xadd("mystream", "*", "id", timestamp);
  return res.json({ msg: `I hope this runs 😅, ${timestamp}` });
});

app.post("/ack", (req, res) => {
  console.log(req.body);
  const { id } = req.body;
  sleep(5000, () => {
    console.log("acked", id);
    res.status(201).json({ msg: `acked id: ${id}` });
  });
});

app.listen(4000, () => {
  try {
    redis.xgroup("CREATE", "mystream", "mygroup", "$", "MKSTREAM");
  } catch (err) {
    console.log(err);
  }

  console.log("server started");
});
