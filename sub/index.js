// @/sub/index.js

const Redis = require("ioredis");

const redis = new Redis();

const main = () => {
  redis.subscribe("send-user-data", (err, count) => {
    if (err) console.error(err.message);
    console.log(`Subscribed to ${count} channels.`);
  });

  redis.on("message", (channel, message) => {
    console.log(`Received message from ${channel} channel.`);
    console.log(JSON.parse(message));
  });
};

const processMessage = (message) => {
  console.log("Id: %s. Data: %O", message[0], message[1]);
};

async function listenForMessage(lastId = "$") {
  // `results` is an array, each element of which corresponds to a key.
  // Because we only listen to one key (mystream) here, `results` only contains
  // a single element. See more: https://redis.io/commands/xread#return-value

  // see here: https://javascript.plainenglish.io/an-introduction-to-redis-stream-57445a21751e
  const results = await redis.xreadgroup("BLOCK", 0, "GROUP", "mygroup", process.pid, "COUNT", 1, "STREAMS", "mystream", ">");
  const [key, messages] = results[0]; // `key` equals to "mystream"

  messages.forEach(processMessage);

  // Pass the last id of the results to the next round.
  await listenForMessage(messages[messages.length - 1][0]);
}

listenForMessage();

// main();
