const { serverDomain, serverPort } = require('../src/ServerSettings');
const express = require('express');
const next = require('next');
const middleware = require('../src/Middleware');
const route = require('../src/Route');
const dbConnection = require('../src/database/Connection')

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = express();

    // setup middleware (i.e. linebot)
    middleware(server);

    // customize routing
    route(server);

    // let next handle rest of routing
    server.get('*', (req, res) => {
      return handle(req, res)
    })

    dbConnection.on('error', (err) => {
      throw err;
    });

    //dbConnection.on('open', () => {
      // we're connected!
      //console.log("> MongoDB open~");
      server.listen(serverPort, (err) => {
        if(err) throw err;
        console.log(`> Ready on ${serverDomain}:${serverPort} or http://localhost:${serverPort}`);
      });
    //});
  })
  .catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  });
