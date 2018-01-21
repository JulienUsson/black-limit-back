export const setPlayers = players => ({
  type: 'TABLE_SET_PLAYERS',
  players: players.map(p => ({
    uuid: p.uuid,
    username: p.username,
    ready: p.ready,
  })),
})

export const gameReady = players => ({
  type: 'TABLE_GAME_READY',
  players,
})

export const setQuestion = question => ({
  type: 'TABLE_SET_QUESTION',
  question,
})

export const setAnswers = answers => ({
  type: 'TABLE_SET_ANSWERS',
  answers,
})
