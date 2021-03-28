import hash from "object-hash";

/**
 pub event MomentPriceChanged(id: UInt64, newPrice: UFix64, seller: Address?)

 Emitted when a user changes the price of their Moment.
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
