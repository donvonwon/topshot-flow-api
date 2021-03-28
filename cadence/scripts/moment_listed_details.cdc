import TopShot from 0xTOPSHOTADDRESS
import Market from 0xMARKETADDRESS

pub struct MomentListedDetails {
    pub var id: UInt64
    pub var playId: UInt32
    pub var play: {String: String}
    pub var setId: UInt32
    pub var setName: String
    pub var serialNumber: UInt32
    pub var price: UFix64

    init(moment: &TopShot.NFT, price: UFix64) {
        self.id = moment.id
        self.playId = moment.data.playID
        self.play = TopShot.getPlayMetaData(playID: self.playId)!
        self.setId = moment.data.setID
        self.setName = TopShot.getSetName(setID: self.setId)!
        self.serialNumber = moment.data.serialNumber
        self.price = price
    }
}

pub fun main(listerAddress: Address, momentID: UInt64, price: UFix64): MomentListedDetails {

    let collectionRef = getAccount(listerAddress).getCapability(/public/MomentCollection)
            .borrow<&{TopShot.MomentCollectionPublic}>()
            ?? panic("Could not get public moment collection reference")

    let listedMoment = collectionRef.borrowMoment(id: momentID);

    return MomentListedDetails(moment: listedMoment!, price: price!)
}