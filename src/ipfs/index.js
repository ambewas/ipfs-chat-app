const IPFS = require('ipfs')

const ipfs = new IPFS({
  EXPERIMENTAL: {
    pubsub: true
  },
  // note to self: repo is necessary, otherwise odd errors about non resolved addresses get thrown
  repo: 'ipfs-repo-'+String(Math.random()),
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
})

export default ipfs;
