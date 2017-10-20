import Express from 'express';
import Http from 'http';
import SocketIO from 'socket.io';

import config from './config';
import socketHandler from './socketHandler';

const app = Express();
const http = Http.Server(app);
const io = SocketIO(http);

io.on('connection', socketHandler);

http.listen(config.port, () => {
  console.log(`listening on *:${config.port}`);
});
