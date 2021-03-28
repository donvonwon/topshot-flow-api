import hash from "object-hash";

/**
 pub event NewSeriesStarted(newCurrentSeries: UInt32)

 Emitted when a new series has been triggered by an admin.
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
