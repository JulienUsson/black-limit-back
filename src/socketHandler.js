import UUID from 'uuid-js';
import { setPlayers } from './Actions/TableActions';
import { setUuid, setUsername } from './Actions/HandActions';

let players = [];
let playersCount = 1;

export default (socket) => {
  socket.on('disconnect', () => disconnect(socket));

  socket.on('dispatch', ({ type, ...params }) => {
    switch (type) {
      case 'HAND_STARTUP':
        initPlayer(socket);
        break;
      case 'HAND_SET_USERNAME':
        updatePlayerUsername(socket, params);
        break;
      default:
        break;
    }
  });
};

function disconnect(socket) {
  const { uuid } = socket;
  if (uuid) {
    players = players.filter(p => p.uuid !== uuid);
    socket.broadcast.emit('dispatch', setPlayers(players));
  }
}

function initPlayer(socket) {
  const uuid = UUID.create().toString();
  const username = `Player ${playersCount}`;
  players.push({ uuid, username });
  playersCount += 1;
  socket.uuid = uuid;
  socket.username = username;
  socket.emit('dispatch', setUuid(uuid));
  socket.emit('dispatch', setUsername(username));
  socket.broadcast.emit('dispatch', setPlayers(players));
}

function updatePlayerUsername(socket, { username }) {
  const player = players.find(p => p.uuid === socket.uuid);
  if (player) {
    player.username = username;
    socket.username = username;
    socket.broadcast.emit('dispatch', setPlayers(players));
  }
}
