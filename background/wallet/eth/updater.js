class EthWalletUpdater {

    constructor(ethWallet, baseWalletInst) {

        this.wallet = ethWallet

        this.trackedUpdateIndex = 0
        this.untrackedUpdateIndex = 0
        this.updateBatchSize = 10

        this.fetchTokens()

        const _this = this

        const timer = setInterval(function(){
            if(baseWallet !== baseWalletInst){
                clearInterval(timer)
                return
            }
            _this.update()
        }, 10000)

        const startupWait = setInterval(() => {
            if(_this.wallet.getAddressesJSON().length === 0) return
            _this.update()
            clearInterval(startupWait)
        }, 50)

        const priceTimer = setInterval(function(){
            if(baseWallet !== baseWalletInst){
                clearInterval(priceTimer)
                return
            }
            _this.updatePrices()
        }, 60000)
    }

    update(){
        const _this = this

        const address = this.wallet.getCurrentAddress()

        const balances = this.wallet.getBalances().get(address)

        const tracked = []
        const untracked = []



        for(const token of balances){
            if(token.isNative) continue//exclude native asset as we dont update it like others
            if(token.tracked) tracked.push(token)
            else untracked.push(token)
        }

        let toUpdate = []

        if(this.trackedUpdateIndex < tracked.length && this.trackedUpdateIndex !== -1){
            //update tracked tokens
            const toSelect = Math.min(tracked.length-this.trackedUpdateIndex, 10)
            toUpdate = tracked.slice(this.trackedUpdateIndex, this.trackedUpdateIndex+toSelect)
            this.trackedUpdateIndex = this.trackedUpdateIndex+toSelect
        }else if(this.trackedUpdateIndex === -1) {
            //update untracked tokens then set trackedIndex to zero so next time we update tracked tokens
            const toSelect = Math.min(untracked.length-this.untrackedUpdateIndex, 10)
            toUpdate = untracked.slice(this.untrackedUpdateIndex, this.untrackedUpdateIndex+toSelect)
            this.untrackedUpdateIndex = this.untrackedUpdateIndex+toSelect
            this.trackedUpdateIndex = 0
        }else{
            //update native asset at the end of tracked tokens
            _this.wallet.web3.eth.getBalance(address).then(function(res){
                balances[_this.wallet.ticker].balance = res;
            })

            this.trackedUpdateIndex = -1
            return
        }



    }

    updatePrices(){
        const _this = this
        for(const token of this.wallet.tokens){
            if(!token.tracked && token.contract.toLowerCase() !== _this.wallet.contract.toLowerCase()) continue

            fetch(`http://localhost:2053/api/token/price/${_this.wallet.chainID}/${token.contract}/${selectedCurrency}`)
                .then(function (resp) {
                    resp.json().then(function (res) {
                        if(res.price && res.change)
                            _this.wallet.prices.set(token.contract, {
                                price: parseFloat(res.price),
                                change: parseFloat(res.change)
                            })
                    })
                }).catch(function (e) {
                    console.log(e)
                })
        }
    }

    fetchTokens(){

        const _this = this

        try {
            fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + _this.wallet.chainID + "/infos.json")
                .then(function(resp){
                    try {
                        resp.json().then(function(res){
                            _this.wallet.CG_Platform = res.CG_Platform
                            for(let token of res.tokens){
                                try {
                                    if(!_this.wallet.hasToken(token)){
                                        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + _this.wallet.chainID + "/" + token + "/infos.json")
                                            .then(function(resp2){
                                                console.log("adding " + _this.wallet.chainID + " " + token)
                                                resp2.json().then(function(res2){
                                                    console.log("added " + res2.ticker)
                                                    _this.wallet.addToken(res2.name, res2.ticker, res2.decimals, res2.contract, false)
                                                })
                                            })
                                    }
                                }catch(e){
                                    console.log(e)
                                }
                            }
                        }).catch(e => {
                            console.log(e)
                        })
                    }catch(e){
                        console.log(e)
                    }
                })
        }catch(e){
            console.log(e)
        }
    }

}