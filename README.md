# REDIS PUB/SUB

A redis pub/sub implementation in order to evaluate regular redis pub/sub vs redis streams.

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