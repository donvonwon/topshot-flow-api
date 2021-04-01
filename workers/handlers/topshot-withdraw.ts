import hash from "object-hash";

/**
 pub event Withdraw(id: UInt64, from: Address?)

 Emitted when a Moment is withdrawn from a collection. id refers to the global Moment ID.
 If the collection was in an account's storage when it was withdrawn, from will show the address of the account that it was withdrawn from.
 If the collection was not in storage when the Moment was withdrawn, from will be nil.
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
