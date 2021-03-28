import hash from "object-hash";

/**
 pub event MomentMinted(momentID: UInt64, playID: UInt32, setID: UInt32, serialNumber: UInt32)

 Emitted when a Moment is minted from a set.
 The momentID is the global unique identifier that differentiates a Moment from all other Top Shot Moments in existence.
 The serialNumber is the identifier that differentiates the Moment within an Edition.
 It corresponds to the place in that edition where it was minted.
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
