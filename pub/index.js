// const json = require("milliparsec");
const Redis = require("ioredis");
const express = require("express");

const redis = new Redis();

const app = express();
// app.use(json());

app.post("/publish", (req, res) => {
  //   redis.publish("send-user-data", JSON.stringify({ ts: new Date() }));
  redis.xadd("mystream", "*", "id", new Date());
  return res.json({ msg: "I hope this runs 😅" });
});

app.listen(4000, () => {
  console.log("server started");
});
