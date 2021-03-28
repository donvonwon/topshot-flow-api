import hash from "object-hash";

/**
 pub event MomentWithdrawn(id: UInt64, owner: Address?)

 Emitted when a seller withdraws their Moment from their SaleCollection.
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
