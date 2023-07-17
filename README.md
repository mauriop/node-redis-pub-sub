# REDIS PUB/SUB

A redis pub/sub implementation in order to evaluate redis [pub/sub](https://redis.io/docs/interact/pubsub/) vs [redis streams](https://redis.io/docs/data-types/streams/).

## Redis
Run redis in docker:
```
docker run --rm -d -p 6379:6379 --name redis redis
```

## Publisher
Open a terminal:
```
$ cd pub
$ npm install
$ npm start
```

## Consumer
Open another terminal
```
$ cd sub
$ npm install
$ node index.js
```