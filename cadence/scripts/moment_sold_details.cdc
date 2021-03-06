import TopShot from 0xTOPSHOTADDRESS
import Market from 0xMARKETADDRESS

pub struct MomentSoldDetails {
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

pub fun main(momentID: UInt64, seller: Address): MomentSoldDetails {

    let collectionRef = getAccount(seller).getCapability(/public/topshotSaleCollection).borrow<&{Market.SalePublic}>()
            ?? panic("Could not borrow capability from public collection")

    let soldMoment = collectionRef.borrowMoment(id: momentID);
    let soldPrice = collectionRef.getPrice(tokenID: momentID);

    return MomentSoldDetails(moment: soldMoment!, price: soldPrice!)
}