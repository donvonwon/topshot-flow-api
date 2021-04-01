import hash from "object-hash";

/**
 pub event PlayRetiredFromSet(setID: UInt32, playID: UInt32, numMoments: UInt32)

 Emitted when a play is retired from a set.
 Indicates that that play/set combination and cannot be used to mint moments any more.
 **/

export default async (event: any, di) => {
  const { eventService } = di;

  const rawEvent = {
    hashedId: hash(event),
    ...event,
  };

  try {
    await eventService.save(rawEvent);
  } catch (error) {
    console.error(error);
  }
};
