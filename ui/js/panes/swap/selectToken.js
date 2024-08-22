class SwapSelectToken extends StatefulElement {

    eventHandlers() {
        for(const elem of this.querySelectorAll(".token")){
            try {
                const logo = elem.querySelector(".tokenLogo")

                logo.onload = e => {
                    e.target.style.display = "initial"
                    elem.querySelector(".shimmerBG").style.display = "none"
                }
                logo.onerror = e => {
                    elem.querySelector(".defaultLogo").style.display = "flex"
                    elem.querySelector(".shimmerBG").style.display = "none"
                }

                logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + elem.getAttribute("chainID") + "/" + elem.getAttribute("contract") + "/logo.png"

                const chainLogo = elem.querySelector(".chainLogo")

                chainLogo.onload = e => {
                    e.target.style.display = "initial"
                    elem.querySelector(".shimmerChainLogo").style.display = "none"
                }
                chainLogo.onerror = e => {
                    elem.querySelector(".defaultChainLogo").style.display = "flex"
                    elem.querySelector(".shimmerChainLogo").style.display = "none"
                }

                chainLogo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + elem.getAttribute("chainID") + "/logo.png"
            }catch(e){}
        }
    }

    render() {
        const _this = this
        this.searchVal = ""

        const [reset, setReset] = this.useState("reset", false)

        const {data, loading} = this.useInterval(async () => {
            let tokens = await getFiatTokens()

            let fiats = await getAllTokens()

            tokens = tokens.concat(fiats)

            if(_this.exclude !== undefined){
                tokens = tokens.filter(item => !_this.exclude.includes(item.contract) && !_this.exclude.includes(item.contract.toLowerCase()))
            }

            if(_this.excludeFiat){
                tokens = tokens.filter(item => item.chainID != "FIAT")
            }

            return tokens
        }, 60000)

        if(loading){
            return `
                <div id="loading">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
            `
        }

        this.boxNumber = 15

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onNearEnd = this.registerFunction(() => {
            if(_this.boxNumber >= data.length || _this.searchVal != "") return

            const oldBoxNum = _this.boxNumber
            _this.boxNumber = Math.min(_this.boxNumber+5, data.length)

            const scroll = _this.querySelector("#inner")

            for(const row of _this.getRows(data, oldBoxNum, _this.boxNumber)){
                scroll.insertAdjacentHTML("beforeend", row)
            }

            _this.renderFuncs()
            _this.eventHandlers()
        })

        if(this.boxNumber > data.length) this.boxNumber = data.length

        const rows = this.getRows(data, 0, this.boxNumber)

        const onSearch = this.registerFunction(val => {
            _this.searchVal = val
            if(val == ""){
                setReset(!reset)
                return
            }

            const result = data.filter(record =>
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
                decimals: e.currentTarget.getAttribute("decimals"),
                chainID: e.currentTarget.getAttribute("chainID"),
                chainName: e.currentTarget.getAttribute("chainName")
            })
            _this.remove()
        })

        for (let i = min; i < max; i++) {
            try {
                rows.push(`
                    <div class="token mb-2 px-3" contract="${data[i].contract}" ticker="${data[i].ticker}" name="${data[i].name}" decimals="${data[i].decimals}" chainID="${data[i].chainID}" chainName="${data[i].chainName}" onclick="${onClick}">
                        <div class="tokenWrapper">
                            <div class="tokenLogosWrapper">
                                <div class="shimmerBG"></div>
                                <div class="defaultLogo" style="display: none"><p class="m-auto">${data[i].name.charAt(0).toUpperCase()}</p></div>
                                <img class="tokenLogo" style="display: none">
                                ${data[i].chainID != "FIAT" ? `
                                    <div class="shimmerBG shimmerChainLogo"></div>
                                    <div class="defaultChainLogo" style="display: none"><p class="m-auto">${data[i].chainName.charAt(0).toUpperCase()}</p></div>
                                    <img class="chainLogo" style="display: none">
                                ` : ""}
                            </div>
                            <div class="tokenText">
                                <p class="tokenName">${data[i].name}</p>
                                <p class="tokenAddress text-sm">${data[i].ticker} &centerdot; ${data[i].chainName}</p>
                            </div>
                            <i class="fa-regular fa-chevron-right text-xl tokenRightIcon"></i>
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
            
            .tokenLogosWrapper {
                height: 36px;
                width: 36px;
            }
            
            .chainLogo, .shimmerChainLogo, .defaultChainLogo {
                position: relative;
                height: 16px;
                width: 16px;
                border-radius: 100%;
                left: 24px;
                top: -44px;
                border: 1px solid white;
                animation-duration: 80s;
            }
            
            .defaultChainLogo {
                line-height: 16px;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
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
        `;
    }
}

Stateful.define("swap-select-token", SwapSelectToken)
