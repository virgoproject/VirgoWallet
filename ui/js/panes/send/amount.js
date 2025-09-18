class SendTokenAmount extends StatefulElement {

    eventHandlers() {
        const _this = this

        if(this.amount !== undefined){
            this.querySelector("#amount").value = this.amount
        }

        if(this.nextDisabled !== undefined){
            this.querySelector("#next").disabled = this.nextDisabled
        }

        if(this.fiatVal !== undefined){
            this.querySelector("#fiat").innerHTML = this.fiatVal
        }

        const logo = this.querySelector("#logo")

        logo.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }
        logo.onerror = e => {
            _this.querySelector("#defaultLogo").style.display = "flex"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }

        logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.chainID + "/" + this.token.contract + "/logo.png"
    }

    render() {
        const _this = this

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            return infos
        })

        if(baseInfosLoading) return ""

        const wallet = baseInfos.wallets[baseInfos.selectedWallet].wallet

        const [token, setToken] = this.useState("token", {
            contract: wallet.ticker,
            name: wallet.asset,
            ticker: wallet.ticker,
            decimals: wallet.decimals
        })

        this.token = token
        this.chainID = wallet.chainID

        const {data: balance, loading: balanceLoading} = this.useInterval(async () => {
            return getBalanceCross(wallet.chainID, _this.token.contract)
        }, 10000)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const selectClick = this.registerFunction(() => {
            const elem = document.createElement("select-token")
            elem.setToken = token => {
                _this.amount = ""
                this.nextDisabled = true
                this.fiatVal = "-"
                setToken(token)
                _this.runIntervals()
            }
            document.body.appendChild(elem)
        })

        const onInput = this.registerFunction(e => {
            if(balanceLoading) return
            _this.amount = _this.querySelector("#amount").value
            let val = _this.amount
            if(val.trim() == "") val = "0"

            if(balance.balance == 0 || balance.price == 0){
                this.fiatVal = "-"
                this.querySelector("#fiat").innerHTML = "-"
            }else{
                this.fiatVal = (balance.price*val).toFixed(2)
                this.querySelector("#fiat").innerHTML = this.fiatVal
            }

            if(!Utils.isValidNumber(val))
                val = "0"

            this.nextDisabled = new BN(balance.balance).lt(new BN(Utils.toAtomicString(val, balance.decimals))) || Number(val) == 0 || balance.balance == 0

            this.querySelector("#next").disabled = this.nextDisabled
        })

        const maxClick = this.registerFunction(() => {
            if(token.contract == wallet.ticker){
                estimateSendFees(_this.address, balance.balance, token.contract).then(function(fees) {
                    const totalFees = new BN(fees.gasLimit).mul(new BN(fees.gasPrice))
                    const maxSendable = new BN(balance.balance).sub(totalFees).toString()
                    _this.querySelector("#amount").value = Utils.formatAmount(maxSendable, balance.decimals)
                    _this.querySelector("#amount").oninput()
                })
            }else {
                _this.querySelector("#amount").value = Utils.formatAmount(balance.balance, balance.decimals)
                _this.querySelector("#amount").oninput()
            }
        })

        const nextClick = this.registerFunction(() => {
            const elem = document.createElement("send-token-confirm")
            elem.address = _this.address
            elem.token = _this.token
            elem.chainID = _this.chainID
            elem.amount = Utils.toAtomicString(_this.amount, balance.decimals)
            elem.removeParent = () => {
                _this.remove()
            }
            document.body.appendChild(elem)
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="${Stateful.t("sendAmountTitle")}" backfunc="${back}"></section-header>
                    <div id="content" class="px-3">
                        <div id="select" class="mt-3" onclick="${selectClick}">
                            <div class="shimmerBG" id="shimmerIcon"></div>
                            <img style="display: none" id="logo">
                            <div id="defaultLogo" style="display: none"><p class="m-auto">${token.name.charAt(0).toUpperCase()}</p></div>
                            <p id="selectTokenName" class="text-lg">${token.ticker}</p>
                            <i id="selectTokenIcon" class="fa-solid fa-caret-down"></i>
                        </div>
                        <input type="number" placeholder="0.0" id="amount" class="mt-3 text-4xl" oninput="${onInput}">
                        <p id="max" class="mt-3 text-lg" onclick="${maxClick}">${Stateful.t("sendAmountMaxBtn")}</p>
                        <p id="fiatConversion" class="mt-3">${currencyToSymbol(baseInfos.selectedCurrency)} <span id="fiat">-</span></p>
                        <div id="balanceWrapper" class="mt-3">
                            <p id="balanceText">${Stateful.t("sendAmountBalanceLabel")} </p>
                            <p id="balance">${balanceLoading ? "<div class='shimmerBG' id='balanceShimmer'></div>" : Utils.formatAmount(balance.balance, balance.decimals)}</p>
                        </div>  
                    </div>
                    <div class="p-3">
                        <button class="button w-100" id="next" disabled onclick="${nextClick}">${Stateful.t("sendAmountNextBtn")}</button>              
                    </div>
                </div>
            </div>
        `;
    }

    style() {
        return `
        
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            #content {
                flex-grow: 1;
                min-height: 0;
            }
        
            #shimmerIcon {
                height: 36px;
                width: 36px;
                border-radius: 100%;
                animation-duration: 35s;
            }
            
            #logo {
                height: 36px;
                width: 36px;
                border-radius: 100%;
            }
            
            #defaultLogo {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                border-radius: 100%;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
            }
            
            #select {
                display: flex;
                width: fit-content;
                align-items: center;
                margin: auto;
                background: var(--gray-50);
                padding: 0.5em 1em;
                border-radius: 0.5em;
                cursor: pointer;
                transition: 0.1s ease-in all;
                font-weight: 600;
            }
            
            #select:hover {
                background: var(--gray-100);
            }
            
            #selectTokenName {
                margin: 0 0.5em;
                color: var(--gray-700);
            }
            
            #selectTokenIcon {
                color: var(--gray-400);
                padding-bottom: 4px;
            }
            
            #amount {
                width: 100%;
                text-align: center;
                border: none;
                outline: none;
                color: var(--gray-700);
            }
            
            #amount::placeholder {
                color: var(--gray-400);
            }
            
            #max {
                color: var(--mainColor);
                cursor: pointer;
                width: fit-content;
                margin: auto;
                font-weight: 600;
            }
            
            #fiatConversion {
                background: var(--gray-50);
                color: var(--gray-700);
                padding: 0.5em 2em;
                border-radius: 0.5em;
                width: fit-content;
                margin: auto;
                font-weight: 600;
            }
            
            #balanceWrapper {
                display: flex;
                justify-content: center;
                white-space: pre;
                color: var(--gray-400);
                width: 100%;
                flex-wrap: nowrap;
                align-items: center;
            }
            
            #balance {
                margin: 0px;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #balanceText, #balanceSymbol {
                margin: 0;
            }
            
            #balanceShimmer {
                width: 5ch;
                border-radius: 0.5em;
                height: 1rem;
                animation-duration: 30s;
            }
        `;
    }

}

Stateful.define("send-token-amount", SendTokenAmount)
