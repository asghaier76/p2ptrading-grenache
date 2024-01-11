const Logger = require('./logger');
const logger = new Logger('OrderBook');

class Order {  
  constructor(type, price, amount, firstPair, secondPair, timestamp) {
    this.id = Math.floor(Math.random() * 1000000) + 1;
    this.type = type;
    this.price = price;
    this.amount = amount;
    this.firstPair = firstPair;
    this.secondPair = secondPair;
    this.timestamp = timestamp;
  } 
}
  
class Trade {
  constructor(price, amount, firstPair, secondPair, timestamp) {
    this.price = price;
    this.amount = amount;
    this.firstPair = firstPair;
    this.secondPair = secondPair;
    this.timestamp = timestamp;
  }
}

class OrderBook {
  constructor() {
    this._bids = [];
    this._asks = [];
    this._trades = [];
  }

  async addOrder(data) {
    if (!['buy', 'sell'].includes(data.type)) {
      throw new Error('Invalid order type');
    }
    logger.info('adding new order');
    const order = new Order(data.type, data.price, data.amount, data.firstPair, data.secondPair, data.timestamp);
    this._addOrderToBook(order);
  }

  _addOrderToBook(order) {
    const book = order.type === 'buy' ? this._bids : this._asks;
    this._insertOrder(book, order, order.type === 'buy');
  }

  _insertOrder(book, order, isBuy) {
    logger.info('Inserting order in the book');
    let index = book.findIndex(b => (isBuy ? b.price < order.price : b.price > order.price));
    if (index === -1) index = book.length;
    book.splice(index, 0, order);
  }

  async matchEngine() {
    logger.info('Running matching engine starting');
    while (this._hasPotentialTrade()) {
      this._executeTrade();
    }
  }

  _hasPotentialTrade() {
    return this._asks.length > 0 && this._bids.length > 0 && this._asks[0].price <= this._bids[0].price;
  }

  _executeTrade() {
    const askOrder = this._asks[0];
    const bidOrder = this._bids[0];

    const tradePrice = askOrder.price;
    const tradeAmount = Math.min(askOrder.amount, bidOrder.amount);
    const tradeFirstPair = askOrder.firstPair;
    const tradeSecondPair = askOrder.secondPair;
    const tradeTimestamp = Date.now();

    askOrder.amount -= tradeAmount;
    bidOrder.amount -= tradeAmount;

    this._updateBook(this._asks, askOrder);
    this._updateBook(this._bids, bidOrder);

    const trade = new Trade(tradePrice, tradeAmount, tradeFirstPair, tradeSecondPair, tradeTimestamp);
    this._trades.push(trade);
  }

  _updateBook(book, order) {
    if (order.amount === 0) {
      book.shift();
    }
  }

  get bids() {
    return this._bids;
  }

  get asks() {
    return this._asks;
  }

  get trades() {
    return this._trades;
  }
}

module.exports = {
  OrderBook,
  Trade,
  Order
};