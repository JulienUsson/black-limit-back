export const setPlayers = players => ({
  type: 'TABLE_SET_PLAYERS',
  players,
});

export const gameReady = players => ({
  type: 'TABLE_GAME_READY',
  players,
});
