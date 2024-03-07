class SendTokenAmount extends StatefulElement {

    eventHandlers() {
        const _this = this

        if(this.value !== undefined){
            this.querySelector("#amount").value = this.value
        }

        if(this.nextDisabled !== undefined){
            this.querySelector("#next").disabled = this.nextDisabled
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
            ticker: wallet.ticker
        })

        this.token = token
        this.chainID = wallet.chainID

        const {data: balance, loading: balanceLoading} = this.useInterval(async () => {
            const bal = await getBalanceCross(wallet.chainID, token.contract)
            bal.balance = bal.balance + Math.round(Math.random()*100)
            return bal
        }, 10000)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const selectClick = this.registerFunction(() => {
            const elem = document.createElement("select-token")
            elem.setToken = token => {
                setToken(token)
            }
            document.body.appendChild(elem)
        })

        const onInput = this.registerFunction(e => {
            if(balanceLoading) return
            this.value = e.currentTarget.value
            let val = this.value
            if(val.trim() == "") val = 0

            const bal = Number(Utils.formatAmount(balance.balance, balance.decimals))

            if(bal == 0 || balance.price == 0){
                this.querySelector("#fiat").innerHTML = "-"
            }else{
                this.querySelector("#fiat").innerHTML = (balance.price*bal).toFixed(2)
            }

            this.nextDisabled = bal < Number(val) || val == 0 || bal == 0

            this.querySelector("#next").disabled = this.nextDisabled
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Amount" backfunc="${back}"></section-header>
                    <div id="content" class="px-3">
                        <div id="select" class="mt-3" onclick="${selectClick}">
                            <div class="shimmerBG" id="shimmerIcon"></div>
                            <img style="display: none" id="logo">
                            <div id="defaultLogo" style="display: none"><p class="m-auto">${token.name.charAt(0).toUpperCase()}</p></div>
                            <p id="selectTokenName" class="text-lg">${token.ticker}</p>
                            <i id="selectTokenIcon" class="fa-solid fa-caret-down"></i>
                        </div>
                        <input type="number" placeholder="0.0" id="amount" class="mt-3 text-4xl" oninput="${onInput}">
                        <p id="max" class="mt-3 text-lg">Use max</p>
                        <p id="fiatConversion" class="mt-3">${currencyToSymbol(baseInfos.selectedCurrency)} <span id="fiat">-</span></p>
                        <div id="balanceWrapper" class="mt-3">
                            <p id="balanceText">Balance: </p>
                            <p id="balance">${balanceLoading ? "<div class='shimmerBG' id='balanceShimmer'></div>" : Utils.formatAmount(balance.balance, balance.decimals)}</p>
                            <p id="balanceSymbol"> ${token.ticker}</p>
                        </div>  
                    </div>
                    <div class="p-3">
                        <button class="button w-100" id="next" disabled>Next</button>              
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
        `;
    }

}

Stateful.define("send-token-amount", SendTokenAmount)
