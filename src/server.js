const { PeerRPCServer }  = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const { OrderBook } = require('./orderbook');
const Logger = require('./logger');
const logger = new Logger('OrderBook');

const link = new Link({
  grape: 'http://127.0.0.1:30001'
});
link.start();

const peer = new PeerRPCServer(link, {
  timeout: 300000
});
peer.init();

let orderBook = new OrderBook();

const port = 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport('server');
service.listen(port);
logger.info(`Grenache service starting on ${port}`);

setInterval(function () {
  link.announce('p2p_trading_worker', service.port, {});
}, 5000);

service.on('request', async (rid, key, payload, handler) => {
  if (payload.command === 'addOrder') {
    await orderBook.addOrder(payload.order);
    handler.reply(null, {requestId: rid,  bids: orderBook.bids, asks: orderBook.asks});
  } else if (payload.command === 'matchOrders') {
    await orderBook.matchEngine();
    handler.reply(null, { orderBook });
    handler.reply(null, {requestId: rid,  trades: orderBook._trades});
  } else {
    handler.reply(null, { msg: 'Unsupported command' });
  }
});
