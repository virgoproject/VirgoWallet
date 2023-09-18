class AssetsPane {

    static addAssetBtn = $("#mainPane .resume .assets .addAsset")
    static self = $("#assetsPane")
    static back = $("#assetsPane .back")
    static list = {
        wrapper: $("#assetsPane .listWrap"),
        self: $("#assetsPane .list"),
        base: $("#assetsListBaseAsset"),
        loading: $("#assetsPane .loading"),
        end: $("#assetsPane .listEnd")
    }
    static title = $("#assetListTitle")
    static addCustom = $("#assetsPane .addBottomLogo")
    static add = {
        self: $("#assetsListAdd"),
        contract: {
            self: $("#assetsListAdd .contract"),
            input: $("#assetsListAdd .contract input"),
            submit: $("#assetsListAdd .contract button"),
            label: $("#assetsListAdd .contract .label")
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
    static search = {
        self: $("#assetsListSearchWrapper"),
        input: $("#assetsListSearch"),
        notFound: $("#assetsPane .searchNotFound")
    }

    constructor() {
        this.tokensCount = 0
        this.reachedEnd = false

        AssetsPane.addAssetBtn.click(function(){
            AssetsPane.self.show()
            hideStatsBar()
            assetsPane.tokensCount = 0
            assetsPane.reachedEnd = false
            AssetsPane.search.input.val("")
            assetsPane.loadTokens()
        })

        AssetsPane.back.click(function(){
            if(AssetsPane.list.self.is(":visible")){
                AssetsPane.self.hide()
                AssetsPane.list.self.html("")
                showStatsBar()
            }else{
                AssetsPane.list.self.show()
                AssetsPane.search.self.show()
                AssetsPane.title.html("My Assets")
                AssetsPane.add.self.hide()
                AssetsPane.addCustom.show()
            }
        })

        AssetsPane.addCustom.click(function(){
            $(this).hide()
            AssetsPane.list.self.hide()
            AssetsPane.search.self.hide()
            AssetsPane.title.html("Add An Asset")
            AssetsPane.add.self.show()
        })

        AssetsPane.search.input.on("input", function(){
            const val = $(this).val()
            AssetsPane.list.self.html("")
            AssetsPane.list.loading.show()

            if(val == ""){
                assetsPane.tokensCount = 0
                assetsPane.reachedEnd = false
                assetsPane.loadTokens()
                return
            }
            getBaseInfos().then(function(infos) {
                const tokens = infos.wallets[infos.selectedWallet].wallet.tokens
                const result = tokens.filter(record =>
                    record.name.toLowerCase().includes(val.toLowerCase()) ||
                    record.ticker.toLowerCase().includes(val.toLowerCase())
                )

                AssetsPane.list.loading.hide()

                if(result.length == 0){
                    const notFoundMsg = AssetsPane.search.notFound.clone()
                    AssetsPane.list.self.append(notFoundMsg)
                    notFoundMsg.show()
                    notFoundMsg.find("span").click(function(){
                        AssetsPane.addCustom.click()
                    })
                    return
                }

                for(const token of result){
                    assetsPane.showToken(infos, token)
                }
            })
        })

        AssetsPane.list.wrapper.scroll(function(){
            if(assetsPane.reachedEnd) return;

            const scrollPercent = ($(this).scrollTop() / (AssetsPane.list.self.height() - $(this).height()))

            if(scrollPercent > 0.7){
                assetsPane.loadTokens()
            }
        })

        AssetsPane.add.contract.input.on("input", function(){
            validateAddress(AssetsPane.add.contract.input.val()).then(function(res){
                hasAsset(AssetsPane.add.contract.input.val()).then(function(hasAsset){
                    AssetsPane.add.contract.submit.attr("disabled", !res || hasAsset)
                })
            })
        })

        AssetsPane.add.contract.submit.click(function(){
            AssetsPane.add.contract.input.attr("disabled", true)
            disableLoadBtn($(this))

            getTokenDetails(AssetsPane.add.contract.input.val()).then(function(details){
                if(!details){
                    AssetsPane.add.contract.input.attr("disabled", false)
                    enableLoadBtn(AssetsPane.add.contract.submit)
                    AssetsPane.add.contract.submit.attr("disabled", true)

                    AssetsPane.add.contract.input.addClass("is-invalid")
                    AssetsPane.add.contract.label.addClass("text-danger")
                    AssetsPane.add.contract.label.html("Invalid contract")

                    setTimeout(function(){
                        AssetsPane.add.contract.input.removeClass("is-invalid")
                        AssetsPane.add.contract.label.removeClass("text-danger")
                        AssetsPane.add.contract.label.html("Contract address")
                    }, 2500)
                    return
                }

                AssetsPane.add.resume.name.val(details.name)
                AssetsPane.add.resume.decimals.val(details.decimals)
                AssetsPane.add.resume.symbol.val(details.symbol)
                AssetsPane.add.resume.ticker.html(details.symbol)

                enableLoadBtn(AssetsPane.add.contract.submit)
                AssetsPane.add.contract.self.hide()
                AssetsPane.add.resume.self.show()
            })
        })

        AssetsPane.add.resume.submit.click(function(){
            const contract = AssetsPane.add.contract.input.val().toLowerCase()
            const name = AssetsPane.add.resume.name.val()
            const decimals = AssetsPane.add.resume.decimals.val()
            const symbol = AssetsPane.add.resume.symbol.val()

            addAsset(name, symbol, decimals, contract).then(function(){
                AssetsPane.back.click()
                notyf.success("Added "+symbol+"!")
            })

        })

    }

    loadTokens(){
        AssetsPane.list.loading.show()
        getBaseInfos().then(function(infos){
            let tokens = infos.wallets[infos.selectedWallet].wallet.tokens

            let initialCount = assetsPane.tokensCount

            while(assetsPane.tokensCount < tokens.length && assetsPane.tokensCount-initialCount < 20){
                assetsPane.showToken(infos, tokens[assetsPane.tokensCount])
                assetsPane.tokensCount++
            }

            AssetsPane.list.loading.hide()

            if(assetsPane.tokensCount == tokens.length){
                const endMsg = AssetsPane.list.end.clone()
                AssetsPane.list.self.append(endMsg)
                endMsg.show()

                endMsg.find("span").click(function(){
                    AssetsPane.addCustom.click()
                })

                assetsPane.reachedEnd = true
            }
        })
    }

    showToken(infos, token){
        let elem = AssetsPane.list.base.clone()
        elem.find(".name").html(token.name)
        elem.find(".ticker").html(token.ticker)

        elem.find(".logo").on('load', function() {
            elem.find("svg").hide()
            elem.find(".logo").show()
        }).attr("src", "https://raw.githubusercontent.com/virgoproject/tokens/main/" + infos.wallets[infos.selectedWallet].wallet.chainID + "/" + token.contract + "/logo.png");

        elem.find("svg").attr("data-jdenticon-value", token.contract)

        if(token.tracked)
            elem.addClass("selected")

        elem.click(function(){
            changeAssetTracking(token.contract).then(function(){
                if(elem.hasClass("selected")){
                    elem.removeClass("selected")
                    $("#bal"+token.contract).remove()
                }else{
                    elem.addClass("selected")
                }
            })
        })

        AssetsPane.list.self.append(elem)
        elem.show()
    }

}

const assetsPane = new AssetsPane()
