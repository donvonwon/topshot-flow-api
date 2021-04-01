import hash from "object-hash";

/**
 pub event Deposit(id: UInt64, to: Address?)

 Emitted when a Moment is deposited into a collection. id refers to the global Moment ID.
 If the collection was in an account's storage when it was deposited, to will show the address of the account that it was deposited to.
 If the collection was not in storage when the Moment was deposited, to will be nil.
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
