MAIN_ASSET = undefined

class MainPane {

    updateData(){
        browser.runtime.sendMessage({command: 'getBaseInfos'})
            .then(function (response) {
                mainPane.displayData(response)
            })
    }

    displayData(data){
        const selectedWallet = data.wallets[data.selectedWallet].wallet

        MAIN_ASSET = selectedWallet
    }

    async displayNFTs() {
        return
        const data = await getBaseInfos()
        const selectedWallet = data.wallets[data.selectedWallet].wallet
        let previousCollection = null
        const collectionCount = {};
        console.log(data.wallets[data.selectedWallet].wallet.nft)

        if (data.wallets[data.selectedWallet].wallet.nft.length > 0) {
            for (let x = 0; x < data.wallets[data.selectedWallet].wallet.nft.length; x++) {

                if (data.wallets[data.selectedWallet].wallet.nft[x].collection !== previousCollection) {
                    previousCollection = data.wallets[data.selectedWallet].wallet.nft[x].collection

                    let uri = data.wallets[data.selectedWallet].wallet.nft[x].tokenUri;
                    let contractAdr = data.wallets[data.selectedWallet].wallet.nft[x].contract;
                    let collection = data.wallets[data.selectedWallet].wallet.nft[x].collection
                    let elemId = "bal" + collection;
                    let existingElem = $("#" + elemId);
                    if (existingElem.length === 0) {
                        fetch(uri).then(resp => {
                            resp.json().then(json => {
                                // create row for this nft
                                let newRow = MainPane.baseNftRow.clone();

                                if (selectedWallet) {
                                    newRow.attr("id", elemId);
                                }

                                let title = data.wallets[data.selectedWallet].wallet.nft[x].collection.charAt(0).toUpperCase() + data.wallets[data.selectedWallet].wallet.nft[x].collection.slice(1)

                                newRow.find(".title").html(title);
                                newRow.find(".ticker").html();

                                data.wallets[data.selectedWallet].wallet.nft.forEach(obj => {
                                    const collection = obj.collection;

                                    if (collection in collectionCount) {
                                        collectionCount[collection]++;
                                    } else {
                                        collectionCount[collection] = 1;
                                    }
                                });

                                newRow.find(".nftInCollection").html(collectionCount[collection])
                                let url = json.image;
                                const regex = /\.[^.\\/]*$/;
                                const extension = url.match(regex);

                                newRow.find(".logoNft").attr("src", url);
                                newRow.find("svg").attr("data-jdenticon-value");

                                newRow.click(function () {
                                    collectionNftPane.displayCollection(collection, data)
                                });


                                MainPane.walletNft.append(newRow);
                                $('#nftNotfound').hide()
                                newRow.show();
                                $(".loadingCollection").hide()
                            });
                        });
                    }
                }
            }
        }else{
            MainPane.walletNft.empty()
            $(".loadingCollection").hide()
            $('#nftNotfound').show()
        }
    }

    setResume(data){
        this.displayData(data)

        setInterval(function(){
            mainPane.updateData()
        }, 1000)

    }

}

const mainPane = new MainPane()
