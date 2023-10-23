class NftPane {
    static addNftBtn = $("#manageNFTsBtn")
    static self = $("#nftAddPane")
    static back = $("#nftAddPane .back")
    static add = {
        self: $("#nftListAdd"),
        contract: {
            self: $("#nftListAdd .contract"),
            input: $("#nftListAdd .contract .contractAddr"),
            submit: $("#nftListAdd .contract button"),
            label: $("#nftListAdd .contract .label"),
            labelId: $("#nftListAdd .contract .labelId"),
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
                    NftPane.add.contract.tokenId.on("input", function (){
                        if (NftPane.add.contract.tokenId.val() !== ""){
                            NftPane.add.contract.submit.attr("disabled", !res || hasAsset)
                        }else{
                            NftPane.add.contract.submit.attr("disabled", true)
                        }
                    })
                })
            })
        })

        NftPane.add.contract.submit.click(function(){
            NftPane.add.contract.input.attr("disabled", true)
            disableLoadBtn($(this))
            getNftDetails(NftPane.add.contract.input.val(), NftPane.add.contract.tokenId.val()).then(function(details){
                if(!details){
                    NftPane.add.contract.input.attr("disabled", false)
                    enableLoadBtn(NftPane.add.contract.submit)
                    NftPane.add.contract.submit.attr("disabled", true)

                    NftPane.add.contract.input.addClass("is-invalid")
                    NftPane.add.contract.label.addClass("text-danger")
                    NftPane.add.contract.label.html("Invalid contract")

                    NftPane.add.contract.input.addClass("is-invalid")
                    NftPane.add.contract.labelId.addClass("text-danger")
                    NftPane.add.contract.labelId.html("Invalid token ID")

                    setTimeout(function(){
                        NftPane.add.contract.input.removeClass("is-invalid")
                        NftPane.add.contract.label.removeClass("text-danger")
                        NftPane.add.contract.label.html("Contract address")

                        NftPane.add.contract.input.removeClass("is-invalid")
                        NftPane.add.contract.labelId.removeClass("text-danger")
                        NftPane.add.contract.labelId.html("Token ID")
                    }, 2500)
                    return
                }

                enableLoadBtn(NftPane.add.contract.submit)

                const uri = details.tokenURI
                const tokenId = details.tokenID

                addNft(uri,tokenId,details.owner,details.contract,details.collection).then(function(res){
                    if (res == false){
                        notyf.error("You do not own this NFT")
                        NftPane.back.click()
                    }else if (res == true){
                        notyf.success("NFT Successfully added!")
                        NftPane.back.click()
                    }
                })

            })
        })
    }
}

const nftPane = new NftPane()
