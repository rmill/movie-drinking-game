// Setup the server
// usage: node ./index.js $PORT
const {DiscoveryServer} = require('./lib/server');
const server = new DiscoveryServer(process.argv[2]);
