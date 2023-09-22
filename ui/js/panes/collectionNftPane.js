class CollectionNftPane {
    static self = $("#collectionPane")
    static back = $("#collectionPane .back")
    static titleCollection = $('#collectionPane #collectionTitle')
    static walletNft = $("#walletNftByCollection")
    static baseNftRow = $("#baseNftRowByCollection")


    constructor() {
        CollectionNftPane.back.click(function(){
            CollectionNftPane.self.hide()
            CollectionNftPane.walletNft.empty()
        })
    }

    displayCollection(collection,data){
        CollectionNftPane.self.show()
        let title = collection.charAt(0).toUpperCase() + collection.slice(1)
        CollectionNftPane.titleCollection.html(title)
        console.log(collection)
        const selectedWallet = data.wallets[data.selectedWallet].wallet

        for (let x = 0; x < data.wallets[data.selectedWallet].wallet.nft.length; x++) {
            console.log(data.wallets[data.selectedWallet].wallet.nft)
            if (data.wallets[data.selectedWallet].wallet.nft[x].collection === collection) {


                let uri = data.wallets[data.selectedWallet].wallet.nft[x].tokenUri;
                let contractAdr = data.wallets[data.selectedWallet].wallet.nft[x].contract;
                let tokenId = data.wallets[data.selectedWallet].wallet.nft[x].tokenId
                let elemId = "bal" + contractAdr;
                let existingElem = $("#" + elemId);
                console.log(existingElem.length)
                    fetch(uri).then(resp => {
                        resp.json().then(json => {
                            console.log(json)
                            // create row for this nft
                            let newRow = CollectionNftPane.baseNftRow.clone();
                            if (selectedWallet) {
                                newRow.attr("id", elemId);
                            }

                            newRow.find(".title").html(json.name);
                            newRow.find(".ticker").html();

                            let url = json.image;
                            const regex = /\.[^.\\/]*$/;
                            const extension = url.match(regex);
                            console.log(extension)

                            newRow.find(".logoNft").attr("src", url);
                            newRow.find("svg").attr("data-jdenticon-value");

                            newRow.click(function () {
                                nftDetailPane.displayToken(uri,contractAdr,tokenId);
                            });

                            CollectionNftPane.walletNft.append(newRow);
                            newRow.show();
                        });
                    });

                }
            }
        }

}
const collectionNftPane = new CollectionNftPane()
