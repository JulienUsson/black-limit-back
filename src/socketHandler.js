import UUID from 'uuid-js';

import { setPlayers, gameReady, setQuestion } from './Actions/TableActions';
import { setUuid, setUsername, setHand } from './Actions/HandActions';
import { createQuestionDeck, createAnswerDeck } from './cards';

const MIN_PLAYERS = 2;
const DRAW_SIZE = 5;

let questionDeck = null;
let answerDeck = null;
let players = [];
let gameStarted = false;
let question = null;

function disconnect(socket) {
  const { uuid } = socket;
  if (uuid) {
    players = players.filter(p => p.uuid !== uuid);
    socket.broadcast.emit('dispatch', setPlayers(players));
  }
}

function initTable(socket) {
  socket.emit('dispatch', setPlayers(players));
  socket.emit('dispatch', setQuestion(question));
}

function initPlayer(socket) {
  if (gameStarted) {
    return;
  }
  const uuid = UUID.create().toString();
  const username = `Player ${players.length + 1}`;
  players.push({
    uuid, username, socket, ready: false, score: 0, hand: [],
  });
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
    question = questionDeck.draw();
    socket.broadcast.emit('dispatch', setQuestion(question));
  });
}

export default io => (socket) => {
  socket.on('disconnect', () => disconnect(socket));

  socket.on('dispatch', ({ type, ...params }) => {
    switch (type) {
      case 'TABLE_STARTUP':
        initTable(socket);
        break;
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
