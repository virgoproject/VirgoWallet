class appsPane {
   static currencyArray = [
        {
            "symbol": "ETH",
            "network": "",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 1,
            "name": "ETH",
            "warnings_from": [
                "Please be careful not to deposit your ETH from a smart contract."
            ],
            "warnings_to": [
                "Please be careful not to provide a smart contract as your ETH payout address."
            ],
            "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
            "validation_extra": null,
            "address_explorer": "https://etherscan.io/address/{}",
            "tx_explorer": "https://etherscan.io/tx/{}",
            "confirmations_from": "1",
            "image": "https://static.simpleswap.io/images/currencies-logo/eth.svg"
        },

        {
            "symbol": "MATIC",
            "network": "polygon",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 137,
            "name": "MATIC",
            "warnings_from": [
                "Only MATIC network supported. Please ensure your deposit is made on the MATIC network."
            ],
            "warnings_to": [
                "Only MATIC network withdrawals supported. Withdrawing to an address that is not a MATIC network address will result the LOSS of your funds."
            ],
            "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
            "validation_extra": null,
            "address_explorer": "https://polygonscan.com/address/{}",
            "tx_explorer": "https://polygonscan.com/tx/{}",
            "confirmations_from": " ",
            "image": "https://static.simpleswap.io/images/currencies-logo/matic.svg"
        },
        {
            "symbol": "bnb-bsc",
            "network": "BSC",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 56,
            "name": "BNB BSC",
            "warnings_from": [
                "Only BSC network supported. Please ensure your deposit is made on the BSC network."
            ],
            "warnings_to": [
                "Only BSC network withdrawals supported. Withdrawing to an address that is not a BSC network address will result the LOSS of your funds."
            ],
            "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
            "validation_extra": null,
            "address_explorer": "https://bscscan.com/address/{}",
            "tx_explorer": "https://bscscan.com/tx/{}",
            "confirmations_from": "15",
            "image": "https://static.simpleswap.io/images/currencies-logo/bnb-bsc.svg"
        },

        {
            "symbol": "AVAX",
            "network": "AVAX-X",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 43114,
            "name": "AVAX",
            "warnings_from": [],
            "warnings_to": [],
            "validation_address": "^(X-avax)[0-9A-Za-z]{30,70}$",
            "validation_extra": null,
            "address_explorer": "https://avascan.info/blockchain/x/address/{}",
            "tx_explorer": "https://avascan.info/blockchain/x/tx/{}",
            "confirmations_from": "1",
            "image": "https://static.simpleswap.io/images/currencies-logo/avax.svg"
        },

        {
            "symbol": "FTM",
            "network": "FTM",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 250,
            "name": "FTM",
            "warnings_from": [
                "Please note that we accept FTM mainnet coins only."
            ],
            "warnings_to": [
                "Please note that only FTM mainnet coins are available for the withdrawal."
            ],
            "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
            "validation_extra": null,
            "address_explorer": "https://ftmscan.com/address/{}",
            "tx_explorer": "https://ftmscan.com/tx/{}",
            "confirmations_from": "1",
            "image": "https://static.simpleswap.io/images/currencies-logo/ftm.svg"
        },

        {
            "symbol": "KCS",
            "network": "ERC20",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 321,
            "name": "KCS",
            "warnings_from": [
                "Please note that only KCS ERC-20 tokens are available for the deposit.",
                "Please be careful not to deposit your KCS from a smart contract."
            ],
            "warnings_to": [
                "Please note that only KCS ERC-20 tokens are available for the withdrawal."
            ],
            "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
            "validation_extra": null,
            "address_explorer": "https://etherscan.io/address/{}",
            "tx_explorer": "https://etherscan.io/tx/{}",
            "confirmations_from": "24",
            "image": "https://static.simpleswap.io/images/currencies-logo/kcs.svg"
        },

        {
            "symbol": "CRO",
            "network": "ERC20",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 25,
            "name": "CRO",
            "warnings_from": [
                "Please note that only CRO ERC-20 tokens are available for the deposit.",
                "Please be careful not to deposit your CRO from a smart contract."
            ],
            "warnings_to": [
                "Please note that only CRO ERC-20 tokens are available for the withdrawal."
            ],
            "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
            "validation_extra": null,
            "address_explorer": "https://etherscan.io/address/{}",
            "tx_explorer": "https://etherscan.io/tx/{}",
            "confirmations_from": "24",
            "image": "https://static.simpleswap.io/images/currencies-logo/cro.svg"
        },
        {
            "symbol": "ETHW",
            "network": "ethw",
            "has_extra_id": false,
            "extra_id": "",
            "chainID": 10001,
            "name": "ETHW",
            "warnings_from": [
                "Please note that exchanges of ETHW mainnet might take some time due to the fact that, network transactions require at least 1500 conformations to be considered valid."
            ],
            "warnings_to": [],
            "validation_address": "^(0x)[0-9A-Fa-f]{40}$",
            "validation_extra": null,
            "address_explorer": "https://www.oklink.com/en/ethw/address/{}",
            "tx_explorer": "https://www.oklink.com/en/ethw/tx/{}",
            "confirmations_from": "1500",
            "image": "https://static.simpleswap.io/images/currencies-logo/ethw.svg"
        }
    ]
    static inputs = {
        one: {
            input: $("#simpleswapInput1"),
            select: $("#simpleswapSelect1"),
            ticker: $("#simpleswapTicker1"),
            rateTicker: $("#simpleswapRateTicker1"),
            balance: $("#simpleswapBalance1"),
            btnTicker: $("#simpleswapBtnTicker1"),
            btnMax: $("#simpleswapMaxBtn1")
        },
        two: {
            input: $("#simpleswapInput2"),
            select: $("#simpleswapSelect2"),
            ticker: $("#simpleswapTicker2"),
            rateTicker: $("#simpleswapRateTicker2"),
            balance: $("#simpleswapBalance2"),
            btnTicker: $("#simpleswapBtnTicker2")
        }
    }
    static div = {
        virgoFarmApp: $("#virgoFarm"),
        simpleSwapApp: $("#simpleswap")
    }

    static buttons = {
        appsBtn: $('#body .store .appElement'),
        goBackFarm: $('#virgoFarm .back'),
        goBackSwap : $('#simpleswap .back')
    }

    static alert = {
        appPopup: $('#appPopup')
    }

    static text = {
        appsTitle: $('#appPopup .appPPTitle h3'),
        appsFeatures: $('#appPopup .appPPFeatures'),
        appsDesc: $('#appPopup .appPPTDesc'),
        appText1: $('#appPopup .appPPText1'),
        appText2: $('#appPopup .appPPText2'),
        appText3: $('#appPopup .appPPText3'),
        appText4: $('#appPopup .appPPText4')
    }
    static rate = {
        self: $("#simpleswapRate"),
        loading: $("#simpleswapRateLoading"),
        amount: $("#simpleswapRateAmount"),
        route: $("#simpleswapRoute"),
        routeBaseStep: $("#simpleswapRouteBaseStep")
    }
    static switchBtn = $("#simpleswapSwitchBtn")
    static params = $("#simpleswapParams")
    static initBtn = $("#simpleinitSwapBtn")
    static loading = $("#simpleswapLoading")
    constructor() {





        $('.appElement').click(function (e) {
            const appSwitch = $(this).attr('data-app')

            switch (appSwitch) {
                case 'virgo-farm':
                    appsPane.virgofarm()
                    break;
                case 'simpleswap':
                    appsPane.simpleswap()
                    break;
            }
        })
    }

    static virgofarm() {
        let officialApp = true
        appsPane.alert.appPopup.show()
        appsPane.div.virgoFarmApp.show()
        getBaseInfos().then(function (infos) {
            console.log(infos.addresses[0].address)
        })

        appsPane.buttons.goBackFarm.click(function () {
            appsPane.div.virgoFarmApp.hide()
        })

        if (officialApp) {
            appsPane.text.appsTitle.html('Virgo Farm <i class="fa-solid fa-badge-check" style="color: var(--mainColor)"></i>')
        } else {
            appsPane.text.appsTitle.html('Virgo Farm')
        }

        appsPane.text.appsFeatures.html("What's Virgo Farm ?")
        appsPane.text.appsDesc.html("Version 1.0")
        appsPane.text.appText1.html('<b>Stake your VGOs, earn rewards</b>, virgoFarm is the application enabling you to stake your VGOs.')
        appsPane.text.appText2.html('<b>Earn while you sleep</b>, up to <b>36.4% APY</b>')
        appsPane.text.appText3.hide()
        appsPane.text.appText4.hide()

    }

    static simpleswap(){
        this.select1OldElem = ""
        this.select2OldElem = ""
        let officalApp = true
        appsPane.div.simpleSwapApp.show()

        appsPane.buttons.goBackSwap.click(function () {
            appsPane.div.simpleSwapApp.hide()
        })
        console.log(this.select2OldElem)
        this.setSelect(appsPane.inputs.one)
        this.setSelect(appsPane.inputs.two)


        appsPane.inputs.one.select.change(function(){
            appsPane.updateSelects(1)
            appsPane.updateBalance(appsPane.inputs.one)
            appsPane.inputs.one.input.trigger("input")
        })

        appsPane.inputs.two.select.change(function(){
            appsPane.updateSelects(2)
            appsPane.updateBalance(appsPane.inputs.two)
            appsPane.inputs.one.input.trigger("input")
        })

        appsPane.inputs.one.input.on("input",function(){
            appsPane.simplecheckAmount(appsPane.inputs.one,appsPane.inputs.two)
        })

        appsPane.initBtn.click(function (){
            appsPane.sendSimpleSwap()
        })

        appsPane.inputs.one.btnMax.click(function(){
            if(appsPane.inputs.one.select.val() == "") return
            appsPane.inputs.one.input.val(appsPane.inputs.one.balance.html())
            appsPane.inputs.one.input.trigger("input")
        })

        appsPane.switchBtn.click(function(){
            const oneVal = appsPane.inputs.one.select.val()
            const twoVal = appsPane.inputs.two.select.val()

            appsPane.inputs.one.select.val("")
            appsPane.inputs.two.select.val("")

            appsPane.inputs.one.select.trigger("change")
            appsPane.inputs.two.select.trigger("change")

            appsPane.inputs.one.select.val(twoVal)
            appsPane.inputs.two.select.val(oneVal)

            appsPane.inputs.one.select.trigger("change")
            appsPane.inputs.two.select.trigger("change")
        })


    }

   static setSelect(input){
                input.select.html("")

                Object.entries(this.currencyArray).map(([index, result]) => {
                    let elem = $("<option></option>")
                    elem.val(result.chainID)
                    elem.html(result.name)

                    elem.attr("data-content",
                        '<div class="selectLogo"  style="background-image: url('+result.image+');"></div><span class="selectText">'+result.name+'</span>')
                    input.select.append(elem)
                })

                input.select.selectpicker('refresh');


    }

   static updateSelects(elem){
        if(elem == 1){
            if(this.select2OldElem != ""){
                appsPane.inputs.two.select.append(this.select2OldElem.elem)
                this.select2OldElem.elem.insertIndex(this.select2OldElem.index)
            }
            if(appsPane.inputs.one.select.val() == ""){
                this.select2OldElem = ""
                appsPane.inputs.two.select.selectpicker('refresh')
                return
            }
            const oldElem = appsPane.inputs.two.select.find('[value='+appsPane.inputs.one.select.val()+']')
            this.select2OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select2OldElem.elem.remove()
            appsPane.inputs.two.select.selectpicker('refresh')
        }else{
            if(this.select1OldElem != ""){
                appsPane.inputs.one.select.append(this.select1OldElem.elem)
                this.select1OldElem.elem.insertIndex(this.select1OldElem.index)
            }
            if(appsPane.inputs.two.select.val() == ""){
                this.select1OldElem = ""
                appsPane.inputs.one.select.selectpicker('refresh')
                return
            }
            const oldElem = appsPane.inputs.one.select.find('[value='+appsPane.inputs.two.select.val()+']')
            this.select1OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select1OldElem.elem.remove()
            appsPane.inputs.one.select.selectpicker('refresh')
        }

    }

    static updateBalance(elem){
        elem.ticker.html("")

        if(elem.select.val() == "") {
            elem.balance.html("-")
            elem.btnTicker.html("-")
            elem.rateTicker.html("-")
            return
        }
        for (let y = 0;y < this.currencyArray.length;y++){
            const array = this.currencyArray
            if (array[y].chainID == elem.select.val()){
                getBalanceCross(elem.select.val(),array[y].name).then(function(res){
                    elem.ticker.html(res.ticker)
                    elem.rateTicker.html(res.ticker)
                    elem.btnTicker.html(res.ticker)
                    elem.balance.html(Utils.formatAmount(res.balance, res.decimals))
                })
            }
        }


    }

   static simplecheckAmount(asset1,asset2) {
       let from = ""
       let to = ""
       let amount = asset1.input.val()
       appsPane.initBtn.attr("disabled", true)

       for (let y = 0;y < this.currencyArray.length;y++) {
           const array = this.currencyArray
               if (array[y].chainID == asset1.select.val()) {
                   from = array[y].name.toLowerCase()
               }
               if (array[y].chainID == asset2.select.val()){
                   to = array[y].name.toLowerCase()
               }
           }

       let requestOptions = {
           method: 'GET',
           redirect: 'follow'
       };
           fetch("https://api.simpleswap.io/get_ranges?api_key=befea97b-5be5-4bc7-b02e-8aaf2417e802&fixed=true&currency_from="+from+"&currency_to="+to+"", requestOptions)
               .then(response => response.json())
               .then(function(result){

                   if (result !== null){
                       switch (true){
                           case (amount < parseInt(result.min)):
                               console.log(result.min)
                               break;
                           case (amount > parseInt(result.max)):
                               console.log(result.max)
                               break;
                           case (amount >= parseInt(result.min) && amount <= parseInt(result.max)):
                               console.log("ok")
                               fetch("https://api.simpleswap.io/get_estimated?api_key=befea97b-5be5-4bc7-b02e-8aaf2417e802&fixed=true&currency_from="+from+"&currency_to="+to+"&amount="+amount+"", requestOptions)
                                   .then(response => response.json())
                                   .then(function(res){
                                       appsPane.inputs.two.input.val(res)
                                   })
                                   .catch(error => console.log('error', error));
                               if (amount <= appsPane.inputs.one.balance.html()){
                                   appsPane.initBtn.attr("disabled", false)
                               }
                               break;
                       }


                       }

               })
               .catch(error => console.log('error', error));

   }

 static sendSimpleSwap(){

 }

}

const appsPans = new appsPane()
