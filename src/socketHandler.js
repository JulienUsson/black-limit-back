import UUID from 'uuid-js';

import { setPlayers, gameReady, setQuestion } from './Actions/TableActions';
import { setUuid, setUsername, setHand } from './Actions/HandActions';
import { createQuestionDeck, createAnswerDeck } from './Deck';

const MIN_PLAYERS = 2;
const DRAW_SIZE = 5;

let questionDeck = null;
let answerDeck = null;
let players = [];
let playersCount = 1;
let gameStarted = false;


function disconnect(socket) {
  const { uuid } = socket;
  if (uuid) {
    players = players.filter(p => p.uuid !== uuid);
    socket.broadcast.emit('dispatch', setPlayers(players));
  }
}

function initPlayer(socket) {
  if (gameStarted) {
    return;
  }
  const uuid = UUID.create().toString();
  const username = `Player ${playersCount}`;
  players.push({
    uuid, username, socket, ready: false, hand: [],
  });
  playersCount += 1;
  socket.uuid = uuid;
  socket.emit('dispatch', setUuid(uuid));
  socket.emit('dispatch', setUsername(username));
  socket.broadcast.emit('dispatch', setPlayers(players));
}

function updatePlayerUsername(socket, { username }) {
  if (gameStarted) {
    return;
  }
  const player = players.find(p => p.uuid === socket.uuid);
  if (player) {
    player.username = username;
    socket.broadcast.emit('dispatch', setPlayers(players));
  }
}

function updatePlayerReady(socket, { ready }) {
  if (gameStarted) {
    return;
  }
  const player = players.find(p => p.uuid === socket.uuid);
  if (player) {
    player.ready = ready;
    socket.broadcast.emit('dispatch', setPlayers(players));
  }
}

function launchGame(io) {
  gameStarted = true;
  questionDeck = createQuestionDeck();
  answerDeck = createAnswerDeck();
  io.sockets.emit('dispatch', gameReady());
  players.forEach((player) => {
    const { socket } = player;
    const hand = answerDeck.draw(DRAW_SIZE);
    player.hand = hand;
    socket.emit('dispatch', setHand(hand));
    socket.broadcast.emit('dispatch', setQuestion(questionDeck.draw()));
  });
}

export default io => (socket) => {
  socket.on('disconnect', () => disconnect(socket));

  socket.on('dispatch', ({ type, ...params }) => {
    switch (type) {
      case 'HAND_STARTUP':
        initPlayer(socket);
        break;
      case 'HAND_SET_USERNAME':
        updatePlayerUsername(socket, params);
        break;
      case 'HAND_SET_READY':
        updatePlayerReady(socket, params);
        if (!gameStarted && players.length >= MIN_PLAYERS && players.every(p => p.ready)) {
          launchGame(io);
        }
        break;
      default:
        break;
    }
  });
};
