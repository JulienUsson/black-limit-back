export const setUuid = uuid => ({
  type: 'HAND_SET_UUID',
  uuid,
})

export const setUsername = username => ({
  type: 'HAND_SET_USERNAME',
  username,
})

export const setHand = hand => ({
  type: 'HAND_SET_HAND',
  hand,
})

export const resetPlayer = () => ({
  type: 'HAND_RESET',
})
