const { PeerRPCServer }  = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');

const link = new Link({
  grape: 'http://127.0.0.1:30001'
});
link.start();

const peer = new PeerRPCServer(link, {
  timeout: 300000
});
peer.init();

const port = 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport('server');
service.listen(port);
console.info(`Grenache service starting on ${port}`);

setInterval(function () {
  console.log('Announce service');
  link.announce('p2p_trading_worker', service.port, {});
}, 1000);

service.on('request', async (rid, key, payload, handler) => {
  console.log(rid, key, payload, handler);
  handler.reply(null, 'result');
});
