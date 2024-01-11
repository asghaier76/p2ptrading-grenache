class Order {  
  constructor(type, price, amount, timestamp) {
    this.id = Math.floor(Math.random() * 1000000) + 1;
    this.type = type;
    this.price = price;
    this.amount = amount;
    this.timestamp = timestamp;
  } 
}
  
class Trade {
  constructor(price, amount, timestamp) {
    this.price = price;
    this.amount = amount;
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
    const order = new Order(data.type, data.price, data.amount, data.timestamp);
    this._addOrderToBook(order);
  }

  _addOrderToBook(order) {
    const book = order.type === 'buy' ? this._bids : this._asks;
    this._insertOrder(book, order, order.type === 'buy');
  }

  _insertOrder(book, order, isBuy) {
    let index = book.findIndex(b => (isBuy ? b.price < order.price : b.price > order.price));
    if (index === -1) index = book.length;
    book.splice(index, 0, order);
  }

  async matchEngine() {
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
    const tradeTimestamp = Date.now();

    askOrder.amount -= tradeAmount;
    bidOrder.amount -= tradeAmount;

    this._updateBook(this._asks, askOrder);
    this._updateBook(this._bids, bidOrder);

    const trade = new Trade(tradePrice, tradeAmount, tradeTimestamp);
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
}

module.exports = {
  OrderBook,
  Trade,
  Order
};