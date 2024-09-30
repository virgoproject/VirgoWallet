class SelectToken extends StatefulElement {

    eventHandlers() {
        for(const elem of this.querySelectorAll(".token")){
            const logo = elem.querySelector(".tokenLogo")

            logo.onload = e => {
                e.target.style.display = "initial"
                elem.querySelector(".shimmerBG").style.display = "none"
            }
            logo.onerror = e => {
                elem.querySelector(".defaultLogo").style.display = "flex"
                elem.querySelector(".shimmerBG").style.display = "none"
            }

            logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.chainID + "/" + elem.getAttribute("contract") + "/logo.png"
        }
    }

    render() {
        const _this = this
        this.searchVal = ""

        const [reset, setReset] = this.useState("reset", false)

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        const {data, loading} = this.useInterval(async () => {
            let tokens = await getTokens()

            tokens = tokens.sort((a,b) => {
                let sortValA = a.price == 0 ? a.balance/10**a.decimals*2 : a.price*(a.balance/10**a.decimals)
                if(a.isNative) sortValA = sortValA + 1
                let sortValB = b.price == 0 ? b.balance/10**b.decimals*2 : b.price*(b.balance/10**b.decimals)
                if(b.isNative) sortValB = sortValB + 1
                return sortValB-sortValA
            })

            if(_this.exclude !== undefined){
                tokens = tokens.filter(item => !_this.exclude.includes(item.contract) && !_this.exclude.includes(item.contract.toLowerCase()))
            }

            return {
                tokens
            }
        }, 60000)

        if(loading || baseInfosLoading){
            return `
                <div id="loading">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
            `
        }

        this.baseInfos = baseInfos
        this.chainID = baseInfos.wallets[baseInfos.selectedWallet].wallet.chainID
        this.boxNumber = 15

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onNearEnd = this.registerFunction(() => {
            if(_this.boxNumber >= data.tokens.length || _this.searchVal != "") return

            const oldBoxNum = _this.boxNumber
            _this.boxNumber = Math.min(_this.boxNumber+5, data.tokens.length)

            const scroll = _this.querySelector("#inner")

            for(const row of _this.getRows(data.tokens, oldBoxNum, _this.boxNumber)){
                scroll.insertAdjacentHTML("beforeend", row)
            }

            _this.renderFuncs()
            _this.eventHandlers()
        })

        if(this.boxNumber > data.tokens.length) this.boxNumber = data.tokens.length

        const rows = this.getRows(data.tokens, 0, this.boxNumber)

        const onSearch = this.registerFunction(val => {
            _this.searchVal = val
            if(val == ""){
                setReset(!reset)
                return
            }

            const result = data.tokens.filter(record =>
                record.name.toLowerCase().includes(val.toLowerCase()) ||
                record.ticker.toLowerCase().includes(val.toLowerCase())
            )

            if(result.length == 0){
                _this.querySelector("#inner").innerHTML = `
                    <div class="text-center mt-5 mb-5">
                        <img src="../images/notFound.png" class="img-fluid" />
                        <h4>${Stateful.t("selectTokenNotFound")}</h4>
                    </div>
                `
                return
            }

            const rows = _this.getRows(result, 0, result.length)
            _this.querySelector("#inner").innerHTML = this.sanitizeHTML(rows)
            _this.renderFuncs()
            _this.eventHandlers()
        })

        const onScrollUp = this.registerFunction(() => {
            _this.querySelector("#search").show()
        })

        const onScrollDown = this.registerFunction(() => {
            _this.querySelector("#search").hide()
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="${Stateful.t("selectTokenTitle")}" backfunc="${back}"></section-header>
                    <search-bar inputhandler="${onSearch}" id="search" placeholder="${Stateful.t("selectTokenSearchPlaceholder")}"></search-bar>
                    <scroll-view id="scroll" onnearend="${onNearEnd}" onscrollup="${onScrollUp}" onscrolldown="${onScrollDown}">
                        <div id="inner" class="px-3">
                            ${rows}
                        </div>
                    </scroll-view>
                </div>
            </div>
        `;
    }

    getRows(data, min, max) {
        const rows = []

        const _this = this

        const onClick = this.registerFunction(e => {
            if(_this.setToken === undefined) return
            _this.setToken({
                contract: e.currentTarget.getAttribute("contract"),
                ticker: e.currentTarget.getAttribute("ticker"),
                name: e.currentTarget.getAttribute("name"),
                decimals: e.currentTarget.getAttribute("decimals")
            })
            _this.remove()
        })

        for (let i = min; i < max; i++) {
            try {
                rows.push(`
                    <div class="token mb-2 px-3" contract="${data[i].contract}" ticker="${data[i].ticker}" name="${data[i].name}" decimals="${data[i].decimals}" onclick="${onClick}">
                        <div class="tokenWrapper">
                            <div class="shimmerBG"></div>
                            <div class="defaultLogo" style="display: none"><p class="m-auto">${data[i].name.charAt(0).toUpperCase()}</p></div>
                            <img class="tokenLogo" style="display: none">
                            <div class="tokenText">
                                <p class="tokenName">${data[i].name}</p>
                                <p class="tokenAddress text-sm">${data[i].ticker}</p>
                            </div>
                            <div class="rightText">
                                <p class="balance"><span class="val">${Utils.cutTo4Decimals(Utils.formatAmount(data[i].balance, data[i].decimals))}</span></p>
                                <p class="fiatValue text-sm"><span class="fiatval">${(data[i].price*data[i].balance/10**data[i].decimals).toFixed(2)}</span><span class="fiatSymbol">${currencyToSymbol(_this.baseInfos.selectedCurrency)}</span></p>
                            </div>
                        </div>
                    </div>
                `)
            }catch (e) {}
        }

        return rows
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            #scroll {
                flex-grow: 1;
                min-height: 0;
            }
        
            .token {
                display: flex;
                padding: 0.75em 0px;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s ease-in;
                border-radius: 0.5em;
            }
            
            .token:hover {
                background: var(--gray-100);
            }
            
            .tokenWrapper {
                display: flex;
                flex-flow: row;
                align-items: center;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                width: 100%;
            }
            
            .tokenText {
                margin-left: 1em;
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }
            
            .tokenName {
                margin: 0;
                color: var(--gray-700);
                font-weight: 600;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .tokenAddress {
                margin: 0;
                color: var(--gray-400);
                text-overflow: ellipsis;
                overflow: hidden;
            }
            
            .tokenRightIcon {
                color: var(--gray-400);
            }
            
            .tokenLogo, .shimmerBG {
                height: 36px;
                width: 36px;
                background-size: cover;
                border-radius: 50%;
                animation-duration: 35s;
            }
            
            .defaultLogo {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                border-radius: 100%;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
            }
            
            .rightText {
                text-align: right;
                margin-left: 0.5em;
            }
            
            .balance {
                white-space: pre-wrap;
                margin: 0px;
                color: var(--gray-700);
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                font-weight: 600;
            }
            
            .fiatValue {
                margin: 0;
                color: var(--gray-400);
            }
            
            .val {
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
    }
}

Stateful.define("select-token", SelectToken)
