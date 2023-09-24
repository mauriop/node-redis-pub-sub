const Redis = require("ioredis");
const { Observable, timer, from, of, interval } = require("rxjs");
const {
  map,
  concatMap,
  delay,
  mergeMap,
  switchMap,
  catchError,
} = require("rxjs/operators");
const os = require("os");
const axios = require("axios");

const redis = new Redis();

const sleep = (ms, cb) => new Promise(() => setTimeout(cb, ms));

const url = "http://localhost:4000/ack";

const customHeaders = {
  "Content-Type": "application/json",
};

const processMessage = async (message) => {
  const [id, data] = message.messages[0];
  console.log("to ack message with Id: %s. Data: %O", id, data);

  await redis.xack("mystream", "mygroup", id);
};

const postAck = async (message) => {
  const [id, data] = message?.messages[0];
  console.log("to post ack message with Id: %s", id);
  const response = await axios.post(
    url,
    { id },
    {
      headers: customHeaders,
    }
  );
  console.log(response.body);

  return response;
};

async function listenForMessage(lastId = "$") {
  // `results` is an array, each element of which corresponds to a key.
  // Because we only listen to one key (mystream) here, `results` only contains
  // a single element. See more: https://redis.io/commands/xread#return-value

  // see here: https://javascript.plainenglish.io/an-introduction-to-redis-stream-57445a21751e
  const results = await redis.xreadgroup(
    "BLOCK",
    0,
    "GROUP",
    "mygroup",
    os.hostname,
    "COUNT",
    1,
    "STREAMS",
    "mystream",
    ">"
  );
  const [key, messages] = results[0]; // `key` equals to "mystream"

  messages.forEach(processMessage);

  // Pass the last id of the results to the next round.
  await listenForMessage(messages[messages.length - 1][0]);
}

// listenForMessage();

const read = async () => {
  console.log("reading...");
  const res = await redis.xreadgroup(
    "BLOCK",
    2000,
    "GROUP",
    "mygroup",
    `${os.hostname()} - ${process.pid}`,
    "COUNT",
    1,
    "STREAMS",
    "mystream",
    ">"
  );

  if (!res || !res.length) {
    return undefined;
  }
  const [key, messages] = res[0];
  const result = {
    key,
    messages,
  };

  return result;
};

const executeAsyncTasks = async (message) => {
  // Replace with your async tasks to external resources
  console.log("Executing async tasks for response:", message);
  // Simulate an async task with a delay
  const body = await postAck(message);
  if (!body) {
    throw new Error("error");
  }
  await processMessage(message);
  console.log("Async tasks executed for response:", message);
};

// timer(0, 500)
// interval(500)
//   .pipe(
//     concatMap(() =>
//       from(read()).pipe(
//         map((response) => {
//           console.log("response", response);
//           return response;
//         })
//       )
//     )
//   )
//   .pipe(
//     concatMap(async (item) => {
//       await processMessage(item);
//     })
//   )
//   // .pipe(map(async (m) => await processMessage(m)))
//   .subscribe((m) => console.log(m));
interval(500)
  .pipe(
    concatMap(() =>
      from(read()).pipe(
        concatMap((response) =>
          of(response).pipe(
            concatMap((responseData) => from(executeAsyncTasks(responseData))),
            catchError((error) => {
              console.error("Error executing async work:", error);
              return of(null);
            })
          )
        ),
        catchError((error) => {
          console.error("Error fetching data:", error);
          return of(null);
        })
      )
    )
  )
  .subscribe((x) => console.log(x));
