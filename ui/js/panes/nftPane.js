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
            symbol: $("#assetsListAdd .resume .symbol"),
            decimals: $("#assetsListAdd .resume .decimals"),
            ticker: $("#assetsListAdd .resume .ticker"),
            submit: $("#assetsListAdd .resume button")
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
                    console.log(NftPane.add.contract.tokenId.val())
                    if (NftPane.add.contract.tokenId.val() !== undefined || NftPane.add.contract.tokenId.val() !== null){
                        NftPane.add.contract.submit.attr("disabled", !res || hasAsset)
                    }
                })
            })
        })

        NftPane.add.contract.submit.click(function(){
            NftPane.add.contract.input.attr("disabled", true)
            disableLoadBtn($(this))

            getNftDetails(NftPane.add.contract.input.val()).then(function(details){
                console.log(details)
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

                NftPane.add.resume.name.val(details.name)
                NftPane.add.resume.decimals.val(details.decimals)
                NftPane.add.resume.symbol.val(details.symbol)
                NftPane.add.resume.ticker.html(details.symbol)

                enableLoadBtn(NftPane.add.contract.submit)
                NftPane.add.contract.self.hide()
                NftPane.add.resume.self.show()
            })
        })
    }
}

const nftPane = new NftPane()
