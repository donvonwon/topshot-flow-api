import hash from "object-hash";

/**
 pub event CutPercentageChanged(newPercent: UFix64, seller: Address?)

 Emitted when a seller changes the percentage cut that is taken from their sales and sent to a beneficiary.
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
