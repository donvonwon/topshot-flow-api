import hash from "object-hash";

/**
 pub event PlayAddedToSet(setID: UInt32, playID: UInt32)

 Emitted when a new play is added to a set.
 **/

export default async (event: any, di) => {
  const { workerService } = di;

  const rawEvent = {
    hashedId: hash(event),
    ...event,
  };

  try {
    await workerService.saveRawEvent(rawEvent);
  } catch (error) {
    console.error(error);
  }
};
