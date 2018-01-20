import UUID from 'uuid-js'

import { setPlayers, gameReady, setQuestion } from './Actions/TableActions'
import {
  setUuid,
  setUsername,
  setHand,
  resetPlayer,
} from './Actions/HandActions'
import { createQuestionDeck, createAnswerDeck } from './cards'

const MIN_PLAYERS = 2
const DRAW_SIZE = 11

let questionDeck = null
let answerDeck = null
let players = []
let playersCount = 1
let gameStarted = false
let question = null

function resetGame(io, socket) {
  questionDeck = null
  answerDeck = null
  gameStarted = false
  question = null
  players = players.map(p => ({ ...p, ready: false }))
  players.forEach(p => p.socket.emit('dispatch', resetPlayer()))
  socket.broadcast.emit('dispatch', setPlayers(players))
  io.sockets.emit('dispatch', setQuestion(question))
}

function disconnect(io, socket) {
  const { uuid } = socket
  if (uuid) {
    players = players.filter(p => p.uuid !== uuid)
    socket.broadcast.emit('dispatch', setPlayers(players))
  }

  if (players.length < 2) {
    resetGame(io, socket)
  }
  if (players.length === 0) {
    playersCount = 1
  }
}

function initTable(socket) {
  socket.emit('dispatch', setPlayers(players))
  socket.emit('dispatch', setQuestion(question))
}

function initPlayer(socket) {
  if (gameStarted) {
    return
  }
  const uuid = UUID.create().toString()
  const username = `Player ${playersCount}`
  playersCount += 1
  players.push({
    uuid,
    username,
    socket,
    ready: false,
    score: 0,
    hand: [],
  })
  socket.uuid = uuid
  socket.emit('dispatch', setUuid(uuid))
  socket.emit('dispatch', setUsername(username))
  socket.broadcast.emit('dispatch', setPlayers(players))
}

function updatePlayerUsername(socket, { username }) {
  if (gameStarted) {
    return
  }
  const player = players.find(p => p.uuid === socket.uuid)
  if (player) {
    player.username = username
    socket.broadcast.emit('dispatch', setPlayers(players))
  }
}

function updatePlayerReady(socket, { ready }) {
  if (gameStarted) {
    return
  }
  const player = players.find(p => p.uuid === socket.uuid)
  if (player) {
    player.ready = ready
    socket.broadcast.emit('dispatch', setPlayers(players))
  }
}

function launchGame(io) {
  gameStarted = true
  questionDeck = createQuestionDeck()
  answerDeck = createAnswerDeck()
  io.sockets.emit('dispatch', gameReady())
  players.forEach(player => {
    const { socket } = player
    const hand = answerDeck.draw(DRAW_SIZE)
    player.hand = hand
    socket.emit('dispatch', setHand(hand))
    question = questionDeck.draw()
    io.sockets.emit('dispatch', setQuestion(question))
  })
}

function play(socket, { cards }) {
  const player = players.find(p => p.uuid === socket.uuid)
  player.cards = cards
}

export default io => socket => {
  socket.on('disconnect', () => disconnect(io, socket))

  socket.on('dispatch', ({ type, ...params }) => {
    switch (type) {
      case 'TABLE_STARTUP':
        initTable(socket)
        break
      case 'HAND_STARTUP':
        initPlayer(socket)
        break
      case 'HAND_SET_USERNAME':
        updatePlayerUsername(socket, params)
        break
      case 'HAND_SET_READY':
        updatePlayerReady(socket, params)
        if (
          !gameStarted &&
          players.length >= MIN_PLAYERS &&
          players.every(p => p.ready)
        ) {
          launchGame(io)
        }
        break
      case 'HAND_PLAY':
        play(socket, params)
        break
      default:
        break
    }
  })
}
