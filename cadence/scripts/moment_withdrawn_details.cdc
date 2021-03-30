import TopShot from 0xTOPSHOTADDRESS
import Market from 0xMARKETADDRESS

pub struct MomentWithdrawnDetails {
    pub var id: UInt64
    pub var playId: UInt32
    pub var play: {String: String}
    pub var setId: UInt32
    pub var setName: String
    pub var serialNumber: UInt32

    init(moment: &TopShot.NFT) {
        self.id = moment.id
        self.playId = moment.data.playID
        self.play = TopShot.getPlayMetaData(playID: self.playId)!
        self.setId = moment.data.setID
        self.setName = TopShot.getSetName(setID: self.setId)!
        self.serialNumber = moment.data.serialNumber
    }
}

pub fun main(momentID: UInt64, owner: Address): MomentWithdrawnDetails {

    let collectionRef = getAccount(owner).getCapability(/public/topshotSaleCollection).borrow<&{Market.SalePublic}>()
            ?? panic("Could not borrow capability from public collection")

    let withdrawnMoment = collectionRef.borrowMoment(id: momentID)
            ?? panic("Could not borrow a reference to the specified moment")

    return MomentWithdrawnDetails(moment: withdrawnMoment!)
}