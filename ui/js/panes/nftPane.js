class NftPane{
    static addNftBtn = $("#mainPane .resume .addNft")
    static self = $("#nftAddPane")
    static back = $("#nftAddPane .back")
    static add = {
        self: $("#nftListAdd"),
        contract: {
            self: $("#nftListAdd .contract"),
            input: $("#nftListAdd .contract .contractAddr"),
            submit: $("#nftListAdd .contract button"),
            label: $("#nftListAdd .contract .label"),
            tokenId: $("#nftListAdd .contract .tokenID")
        },
        resume: {
            self: $("#assetsListAdd .resume"),
            name: $("#assetsListAdd .resume .name"),
            uri: $("#assetsListAdd .resume .uri"),
            tokenId: $("#assetsListAdd .resume .tokenId"),
            owner: $("#assetsListAdd .resume .owner"),
        }
    }

    constructor() {

        NftPane.addNftBtn.click(function(){
            NftPane.self.show()
            hideStatsBar()
        })

        NftPane.back.click(function(){
            NftPane.self.hide()
            showStatsBar()
        })

        NftPane.add.contract.input.on("input", function(){
            validateAddress(NftPane.add.contract.input.val()).then(function(res){
                hasAsset(NftPane.add.contract.input.val()).then(function(hasAsset){
                        NftPane.add.contract.submit.attr("disabled", !res || hasAsset)
                })
            })
        })

        NftPane.add.contract.submit.click(function(){
            NftPane.add.contract.input.attr("disabled", true)
            disableLoadBtn($(this))
            console.log(NftPane.add.contract.tokenId.val())
            getNftDetails(NftPane.add.contract.input.val(), NftPane.add.contract.tokenId.val()).then(function(details){
                console.log(details)
                console.log("details")
                if(!details){
                    NftPane.add.contract.input.attr("disabled", false)
                    enableLoadBtn(NftPane.add.contract.submit)
                    NftPane.add.contract.submit.attr("disabled", true)

                    NftPane.add.contract.input.addClass("is-invalid")
                    NftPane.add.contract.label.addClass("text-danger")
                    NftPane.add.contract.label.html("Invalid contract")

                    setTimeout(function(){
                        NftPane.add.contract.input.removeClass("is-invalid")
                        NftPane.add.contract.label.removeClass("text-danger")
                        NftPane.add.contract.label.html("Contract address")
                    }, 2500)
                    return
                }

                enableLoadBtn(NftPane.add.contract.submit)


                const uri = details.tokenURI
                const tokenId = details.tokenID
                console.log(details.contract)

                addNft(uri,tokenId,details.owner,details.contract).then(function(){
                    AssetsPane.back.click()
                    notyf.success("Added !")
                })

            })
        })
    }
}

const nftPane = new NftPane()
//2526987
//0x4a8e348b29Df68Fa4d874b043f920150d750604E