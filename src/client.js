'use strict';

const { PeerRPCClient }  = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const readline = require('readline');
const Logger = require('./logger');
const logger = new Logger('Client');

const link = new Link({
  grape: 'http://127.0.0.1:30001',
  requestTimeout: 10000
});
link.start();
const peer = new PeerRPCClient(link, {});
peer.init();

const cmdLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Enter the order command you want to execute (options are: addOrder or matchOrders) \n\n please make sure to use this format: addOrder <type> <price> <amount> or matchOrders \n\n ',
});

cmdLine.prompt();

async function handleCommand(command, orderData) {
  const payload = {
    command,
    order: orderData,
  };
  
  return new Promise((resolve, reject) => {
    peer.request('p2p_trading_worker', payload, { timeout: 10000 }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
} 

cmdLine.on('line', async (line) => {
  const [command, ...args] = line.trim().split(' ');

  if (command === 'addOrder') {
    if (args.length !== 5) {
      logger.info('Incorrcet list of parameters, please make sure to use this format: addOrder <type> <price> <amount> <firstPair> <secondPair>');
    } else {
      const [type, price, amount] = args;
      const data = {
        type,
        price: parseFloat(price),
        amount: parseInt(amount, 10),
        timestamp: Date.now(),
      };

      try {
        const response = await handleCommand('addOrder', data);
        logger.info('Order has successfully been added:', response);
      } catch (err) {
        logger.error('Error during submitting command for adding an order:', err);
      }
    }
  } else if (command === 'matchOrders') {
    try {
      const response = await handleCommand('matchOrders');
      logger.info('Orders matching successsfuly performed:', response);
    } catch (err) {
      logger.error('Error during submitting command for matching orders:', err);
    }
  } else {
    logger.warn('Unsupported command, available options are: addOrder or matchOrders');
  }

  cmdLine.prompt();
}).on('close', () => {
  logger.warn('Command Exiting.');
  process.exit(0);
});