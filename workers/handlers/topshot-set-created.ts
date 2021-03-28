import hash from "object-hash";

/**
 pub event SetCreated(setID: UInt32, series: UInt32)

 Emitted when a new set is created.
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
