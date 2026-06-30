
export const createPayload = (eventType,eventMessage) => ({
    eventType,
    eventTime: Date.now(),
    eventMessage,
  })


