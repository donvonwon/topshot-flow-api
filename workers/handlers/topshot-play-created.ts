import hash from "object-hash";

/**
 pub event PlayCreated(id: UInt32, metadata: {String:String})

 Emitted when a new play has been created and added to the smart contract by an admin.
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
