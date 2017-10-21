export const setPlayers = players => ({
  type: 'TABLE_SET_PLAYERS',
  players: players.map(p => ({ uuid: p.uuid, username: p.username, ready: p.ready })),
});

export const gameReady = players => ({
  type: 'TABLE_GAME_READY',
  players,
});
