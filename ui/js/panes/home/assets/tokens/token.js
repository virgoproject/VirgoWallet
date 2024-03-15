class HomeToken extends StatefulElement {

    eventHandlers() {
        const _this = this

        if(this.baseInfos === undefined) return

        const logo = this.querySelector("#logo")
        const address = this.getAttribute("address")

        logo.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }
        logo.onerror = e => {
            _this.querySelector("#defaultLogo").style.display = "flex"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }

        logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.baseInfos.wallets[this.baseInfos.selectedWallet].wallet.chainID + "/" + address + "/logo.png"
    }

    async render() {
        const _this = this

        const {data, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()
            const balance = await getBalance(_this.getAttribute("address"))
            return {
                balance,
                baseInfos
            }
        }, 1000)

        if(loading) return ""

        this.baseInfos = data.baseInfos

        const tokenClick = this.registerFunction(() => {
            const elem = document.createElement("token-details")
            elem.address = _this.getAttribute("address")
            document.body.appendChild(elem)
        })

        return `
            <div id="wrapper" class="mb-2 px-3" onclick="${tokenClick}">
                <div class="shimmerBG" id="shimmerIcon"></div>
                <div id="defaultLogo" style="display: none"><p class="m-auto">${data.balance.name.charAt(0).toUpperCase()}</p></div>
                <img id="logo" style="display: none">
                <div id="leftText">
                    <p id="name">${data.balance.ticker}</p>
                    ${this.getChange(data.balance.change)}
                </div>
                <div id="rightText">
                    <p id="balance"><span id="val">${Utils.cutTo4Decimals(Utils.formatAmount(data.balance.balance, data.balance.decimals))}</span></p>
                    <p id="fiatValue" class="text-sm"><span id="fiatval">${(data.balance.price*data.balance.balance/10**data.balance.decimals).toFixed(2)}</span><span id="fiatSymbol">${currencyToSymbol(data.baseInfos.selectedCurrency)}</span></p>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                align-items: center;
                padding: 0.75em 0px;
                cursor: pointer;
                transition: all 0.2s ease-in;
                border-radius: 0.5em;
            }
            
            #wrapper:hover {
                background: var(--gray-100);
            }
            
            #logo, #shimmerIcon {
                height: 36px;
                width: 36px;
                background-size: cover;
                border-radius: 50%;
                animation-duration: 35s;
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
            
            #name {
                margin: 0;
                color: var(--gray-700);
                font-weight: 600;
            }
            
            #leftText {
                margin-left: 1em;
                flex: 1;
                max-width: fit-content;
            }
            
            #rightText {
                text-align: right;
                flex: 1;
                min-width: 0;
                margin-left: 1em;
            }
            
            #change {
                margin: 0;
                color: var(--gray-400);
            }
            
            #change.positive {
                color: var(--green-600);
            }
            
            #change.negative {
                color: var(--red-600);
            }
            
            #balance {
                white-space: pre-wrap;
                margin: 0px;
                color: var(--gray-700);
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                font-weight: 600;
            }
            
            #fiatValue {
                margin: 0;
                color: var(--gray-400);
            }
            
            #val {
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
    }

    getChange(change){
        if(change == null) change = 0
        change = change.toFixed(2)

        if(change > 0.1) return `<p id="change" class="positive text-sm">+${change}%</p>`
        if(change < -0.1) return `<p id="change" class="negative text-sm">${change}%</p>`
        return `<p id="change" class="text-sm">${change > 0 ? "+" : ""}${change}%</p>`
    }

}

Stateful.define("home-token", HomeToken)
