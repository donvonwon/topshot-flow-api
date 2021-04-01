import hash from "object-hash";

/**
 pub event SetLocked(setID: UInt32)

 Emitted when a set is locked, meaning plays cannot be added.
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
