class AssetsPane {

    static addAssetBtn = $("#mainPane .resume .assets .addAsset")
    static self = $("#assetsPane")
    static back = $("#assetsPane .back")
    static list = {
        self: $("#assetsPane .list"),
        base: $("#assetsListBaseAsset"),
        loading: $("#assetsPane .loading")
    }

    constructor() {
        this.tokensCount = 0;

        AssetsPane.addAssetBtn.click(function(){
            AssetsPane.self.show()
            assetsPane.tokensCount = 0;
            assetsPane.loadTokens()
        })

        AssetsPane.back.click(function(){
            AssetsPane.self.hide()
            AssetsPane.list.self.html("")
        })

    }

    loadTokens(){
        AssetsPane.list.loading.show()
        getBaseInfos().then(function(infos){
            let tokens = infos.wallets[infos.selectedWallet].wallet.tokens

            while(assetsPane.tokensCount < tokens.length){
                let token = tokens[assetsPane.tokensCount]

                let elem = AssetsPane.list.base.clone()
                elem.find(".name").html(token.name)
                elem.find(".ticker").html(token.ticker)
                elem.find(".logo").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + infos.wallets[infos.selectedWallet].wallet.ticker + "/" + token.contract + "/logo.png')");

                console.log(token.tracked)

                if(token.tracked)
                    elem.find(".stateCoin").addClass("activated")

                elem.find(".stateCoin").click(function(){
                    const coin = $(this)
                    changeAssetTracking(token.contract).then(function(){
                        if(coin.hasClass("activated")){
                            coin.removeClass("activated")
                            $("#bal"+token.contract).remove()
                        }else{
                            coin.addClass("activated")
                        }
                    })
                })

                AssetsPane.list.self.append(elem)
                elem.show()

                assetsPane.tokensCount++
            }

            AssetsPane.list.loading.hide()
        })
    }

}

const assetsPane = new AssetsPane()
