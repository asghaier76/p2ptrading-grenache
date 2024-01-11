const { OrderBook, Order } = require('../src/orderbook');

describe('OrderBook', () => {
  let orderBook;

  beforeEach(() => {
    orderBook = new OrderBook();
  });

  describe('addOrder', () => {
    it('should throw error for invalid order type', async () => {
      await expect(orderBook.addOrder({ type: 'invalid', price: 100, amount: 10, timestamp: Date.now() }))
        .rejects
        .toThrow('Invalid order type');
    });

    it('should add a valid buy order to bids', async () => {
      await orderBook.addOrder({ type: 'buy', price: 100, amount: 10, timestamp: Date.now() });
      expect(orderBook.bids).toHaveLength(1);
    });

    it('should add a valid sell order to asks', async () => {
      await orderBook.addOrder({ type: 'sell', price: 105, amount: 5, timestamp: Date.now() });
      expect(orderBook.asks).toHaveLength(1);
    });
  });

  describe('Order Book functions', () => {

    it('should insert an order into an empty book', () => {
      const order = new Order('buy', 100, 10, Date.now());
      orderBook._insertOrder(orderBook._bids, order, true);
      expect(orderBook._bids).toHaveLength(1);
      expect(orderBook._bids[0]).toBe(order);
    });

    it('should insert an order at the beginning of the book', () => {
      const existingOrder = new Order('buy', 90, 10, Date.now());
      orderBook._bids.push(existingOrder);
    
      const newOrder = new Order('buy', 95, 10, Date.now());
      orderBook._insertOrder(orderBook._bids, newOrder, true);
    
      expect(orderBook._bids).toHaveLength(2);
      expect(orderBook._bids[0]).toBe(newOrder);
    });

    it('should insert an order at the end of the book', () => {
      const existingOrder = new Order('buy', 110, 10, Date.now());
      orderBook._bids.push(existingOrder);
    
      const newOrder = new Order('buy', 100, 10, Date.now());
      orderBook._insertOrder(orderBook._bids, newOrder, true);
    
      expect(orderBook._bids).toHaveLength(2);
      expect(orderBook._bids[1]).toBe(newOrder);
    });

    it('should insert an order in the middle of the book', () => {
      orderBook._bids.push(new Order('buy', 110, 10, Date.now()));
      orderBook._bids.push(new Order('buy', 90, 10, Date.now()));
    
      const newOrder = new Order('buy', 100, 10, Date.now());
      orderBook._insertOrder(orderBook._bids, newOrder, true);
    
      expect(orderBook._bids).toHaveLength(3);
      expect(orderBook._bids[1]).toBe(newOrder);
    });

    it('should not execute any trades if there are no matching orders', async () => {
      await orderBook.addOrder({ type: 'buy', price: 90, amount: 10, timestamp: Date.now() });
      await orderBook.addOrder({ type: 'sell', price: 110, amount: 10, timestamp: Date.now() });
    
      await orderBook.matchEngine();
    
      expect(orderBook._trades).toHaveLength(0);
    });

    it('should execute a trade with partial matching orders', async () => {
      await orderBook.addOrder({ type: 'buy', price: 100, amount: 5, timestamp: Date.now() });
      await orderBook.addOrder({ type: 'sell', price: 100, amount: 10, timestamp: Date.now() });
    
      await orderBook.matchEngine();
    
      expect(orderBook._trades).toHaveLength(1);
      expect(orderBook._trades[0].amount).toBe(5);
    });

    it('should execute a trade with complete matching orders', async () => {
      await orderBook.addOrder({ type: 'buy', price: 100, amount: 10, timestamp: Date.now() });
      await orderBook.addOrder({ type: 'sell', price: 100, amount: 10, timestamp: Date.now() });
    
      await orderBook.matchEngine();
    
      expect(orderBook._trades).toHaveLength(1);
      expect(orderBook._trades[0].amount).toBe(10);
    });

    it('should remove an order from the book when fully executed', () => {
      const order = new Order('buy', 100, 0, Date.now()); // Fully executed order
      orderBook._bids.push(order);
    
      orderBook._updateBook(orderBook._bids, order);
    
      expect(orderBook._bids).toHaveLength(0);
    });
  });
    
  describe('bids and asks getters', () => {
    it('should return an empty array for bids and asks in an empty order book', () => {
      expect(orderBook.bids).toEqual([]);
      expect(orderBook.asks).toEqual([]);
    });

    it('should return correct bids and asks after adding orders', async () => {
      await orderBook.addOrder({ type: 'buy', price: 100, amount: 10, timestamp: Date.now() });
      await orderBook.addOrder({ type: 'sell', price: 105, amount: 5, timestamp: Date.now() });
      expect(orderBook.bids).toHaveLength(1);
      expect(orderBook.asks).toHaveLength(1);
    });
  });
});
