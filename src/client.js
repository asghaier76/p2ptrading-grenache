'use strict';

const { PeerRPCClient }  = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const link = new Link({
  grape: 'http://127.0.0.1:30001',
  requestTimeout: 10000
});
link.start();
const peer = new PeerRPCClient(link, {});
peer.init();
const payload = { test: 10 };
peer.request('p2p_trading_worker', payload, { timeout: 100000 }, (err, result) => {
  if (err) throw err;
  console.log(
    'p2p trading response',
    result
  );
});