class SwapTokens extends StatefulElement {

    eventHandlers() {
        const _this = this

        if(this.tokenIn != null){
            const logo = this.querySelector("#tokenInSelect .selectLogo")

            _this.querySelector("#tokenInSelect .shimmerIcon").style.display = "flex"

            logo.onload = e => {
                e.target.style.display = "initial"
                _this.querySelector("#tokenInSelect .shimmerIcon").style.display = "none"
            }
            logo.onerror = e => {
                _this.querySelector("#tokenInSelect .defaultSelectLogo").style.display = "flex"
                _this.querySelector("#tokenInSelect .shimmerIcon").style.display = "none"
            }

            logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.chainID + "/" + this.tokenIn.contract + "/logo.png"
        }

        if(this.tokenOut != null){
            const logo = this.querySelector("#tokenOutSelect .selectLogo")

            _this.querySelector("#tokenOutSelect .shimmerIcon").style.display = "flex"

            logo.onload = e => {
                e.target.style.display = "initial"
                _this.querySelector("#tokenOutSelect .shimmerIcon").style.display = "none"
            }
            logo.onerror = e => {
                _this.querySelector("#tokenOutSelect .defaultSelectLogo").style.display = "flex"
                _this.querySelector("#tokenOutSelect .shimmerIcon").style.display = "none"
            }

            logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.chainID + "/" + this.tokenOut.contract + "/logo.png"
        }

        if(this.amount !== undefined){
            this.querySelector("#input").value = this.amount
            this.querySelector("#input").dispatchEvent(new Event('input', { bubbles: true }))

        }

    }

    render() {

        const _this = this

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            return infos
        })

        if(baseInfosLoading) return ""

        const wallet = baseInfos.wallets[baseInfos.selectedWallet].wallet

        if(!wallet.swapV2Params){
            return this.notYet()
        }

        this.chainID = wallet.chainID

        const [tokenIn, setTokenIn] = this.useState("tokenIn", null)
        const [tokenOut, setTokenOut] = this.useState("tokenOut", null)

        this.tokenIn = tokenIn
        this.tokenOut = tokenOut

        const {data: inBalance, loading: inBalanceLoading} = this.useInterval(async () => {
            if(_this.tokenIn == null) return null
            return await getBalanceCross(wallet.chainID, _this.tokenIn.contract)
        }, 10000)

        const {data: outBalance, loading: outBalanceLoading} = this.useInterval(async () => {
            if(_this.tokenOut == null) return null
            return await getBalanceCross(wallet.chainID, _this.tokenOut.contract)
        }, 10000)

        const {data: refresh15s, loading: refresh15sLoading} = this.useInterval(async () => {
            return Math.random()
        }, 15000)

        const onInput = this.registerFunction(e => {
            const span = _this.querySelector("#inputCalcSpan")
            span.innerHTML = e.currentTarget.value
            e.currentTarget.style.maxWidth = span.offsetWidth + "px"

            this.amount = e.currentTarget.value

            if(tokenIn != null && tokenOut != null && Utils.isValidNumber(e.currentTarget.value)){

                const contractIn = tokenIn.contract+""
                const contractOut = tokenOut.contract+""
                const value = e.currentTarget.value+""

                _this.querySelector("#unavailable").style.display = "none"
                _this.querySelector("#notfound").style.display = "none"

                _this.querySelector("#tokenOutWrapper").classList.add("shimmerBG")
                _this.querySelector("#next").disabled = true
                _this.querySelector("#next").innerHTML = '<i class="fa-solid fa-spinner-third fa-spin"></i>'

                getSwapRoute(value, contractIn, contractOut).then(function (res) {

                    _this.querySelector("#tokenOutWrapper").classList.remove("shimmerBG")
                    _this.querySelector("#next").innerHTML = "Next"

                    if(res.error && res.reason == 'Amount must be >= 0') return
                    if(contractIn != _this.tokenIn.contract || contractOut != _this.tokenOut.contract || value != _this.amount) return

                    if(res == false){
                        _this.querySelector("#unavailable").style.display = "block"
                        return
                    }

                    if(res.error != undefined || res.routes === undefined) {
                        _this.querySelector("#notfound").style.display = "block"
                        return
                    }

                    _this.querySelector("#output").value = Utils.formatAmount(res.routes[0].amount, tokenOut.decimals)

                    _this.querySelector("#next").disabled = new BN(Utils.toAtomicString(value, tokenIn.decimals)).gt(new BN(inBalance.balance))

                    _this.route = res
                })
            }else{
                _this.querySelector("#output").value = ""
                _this.querySelector("#next").disabled = true
            }
        })

        const selectInClick = this.registerFunction(() => {
            const elem = document.createElement("select-token")
            elem.setToken = token => {
                setTokenIn(token)
                _this.runIntervals()
            }

            let toExclude = []
            if(tokenIn != null) toExclude.push(tokenIn.contract)
            if(tokenOut != null) toExclude.push(tokenOut.contract)
            if(toExclude.length != 0) elem.exclude = toExclude

            document.body.appendChild(elem)
        })

        const selectOutClick = this.registerFunction(() => {
            const elem = document.createElement("select-token")
            elem.setToken = token => {
                setTokenOut(token)
                _this.runIntervals()
            }

            let toExclude = []
            if(tokenIn != null) toExclude.push(tokenIn.contract)
            if(tokenOut != null) toExclude.push(tokenOut.contract)
            if(toExclude.length != 0) elem.exclude = toExclude

            document.body.appendChild(elem)
        })

        const switchClick = this.registerFunction(() => {
            const ti = tokenIn
            const to = tokenOut
            setTokenIn(to)
            setTokenOut(ti)
            _this.runIntervals()
        })

        const nextClick = this.registerFunction(() => {
            const elem = document.createElement("confirm-swap")
            elem.tokenIn = tokenIn
            elem.tokenOut = tokenOut
            elem.amountIn = Utils.toAtomicString(_this.amount, tokenIn.decimals)
            elem.route = _this.route
            elem.resetParent = () => {
                _this.amount = ""
                setTokenIn(null)
                setTokenOut(null)
                _this.runIntervals()
            }
            elem.getRoute = () => {
                return _this.route
            }
            document.body.appendChild(elem)
        })

        return `
            <div id="wrapper">
                <section-header title="Swap"></section-header>
                <div id="content">
                    <div class="labelWrapper text-sm mb-1">
                         <p class="m-0">You send</p>
                         <div class="balanceWrapper">
                            <p class="m-0">Available: </p>
                            <p class="m-0 balance">${inBalance == null ? "-" : inBalanceLoading ? "<div class='shimmerBG balanceShimmer'></div>" : Utils.formatAmount(inBalance.balance, inBalance.decimals)}</p>
                         </div>
                    </div>
                    <div class="tokenWrapper">
                        <div class="amountWrapper">
                            <input type="text" placeholder="0.0" class="amount text-2xl" oninput="${onInput}" id="input">
                            <p id="max">Max</p>
                        </div>
                        <div class="select" onclick="${selectInClick}" id="tokenInSelect">
                            <div class="selectHeight"></div>
                            <div class="shimmerBG shimmerIcon" style="display: none"></div>
                            <img style="display: none" class="selectLogo">
                            <div class="defaultSelectLogo" style="display: none"><p class="m-auto">${tokenIn == null ? "" : tokenIn.name.charAt(0).toUpperCase()}</p></div>
                            <p class="selectName text-lg">${tokenIn == null ? "Select" : tokenIn.ticker}</p>
                            <i class="selectIcon fa-solid fa-caret-down"></i>
                        </div>
                    </div>
                    <div id="switch" class="text-2xl mt-4 mb-2" onclick="${switchClick}"><i class="fas fa-sync-alt"></i></div>
                    <div class="labelWrapper text-sm mb-1">
                         <p class="m-0">You get</p>
                         <div class="balanceWrapper">
                            <p class="m-0">Available: </p>
                            <p class="m-0 balance">${outBalance == null ? "-" : outBalanceLoading ? "<div class='shimmerBG balanceShimmer'></div>" : Utils.formatAmount(outBalance.balance, outBalance.decimals)}</p>
                         </div>
                    </div>
                    <div class="tokenWrapper" id="tokenOutWrapper">
                        <div class="amountWrapper">
                            <input type="text" placeholder="0.0" class="amount disabled text-2xl" disabled id="output">
                        </div>
                        <div class="select" onclick="${selectOutClick}" id="tokenOutSelect">
                            <div class="selectHeight"></div>
                            <div class="shimmerBG shimmerIcon" style="display: none"></div>
                            <img style="display: none" class="selectLogo">
                            <div class="defaultSelectLogo" style="display: none"><p class="m-auto">${tokenOut == null ? "" : tokenOut.name.charAt(0).toUpperCase()}</p></div>
                            <p class="selectName text-lg">${tokenOut == null ? "Select" : tokenOut.ticker}</p>
                            <i class="selectIcon fa-solid fa-caret-down"></i>
                        </div>
                    </div>
                    <p id="unavailable" style="display: none">Service unavailable</p>
                    <p id="notfound" style="display: none">No route found</p>
                </div>
                <button class="button w-100" disabled id="next" onclick="${nextClick}">Next</button>
            </div>
            <span id="inputCalcSpan" class="text-2xl"></span>
        `;

    }

    notYet(){
        return `
        <div id="notYetWrapper">
            <div class="text-4xl" id="notYetLogo">
                <i class="fas fa-retweet"></i>
            </div>
            <p class="mt-4 text-lg text-center" id="notYetText">Swaps will be available<br>soon for this chain!</p>
        </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100vh;
                justify-content: space-between;
            }
            
            #content {
                margin-top: -35px;
            }
            
            #inputCalcSpan {
                visibility: hidden;
                position: absolute;
                top: -100vh;
            }
            
            .tokenWrapper {
                display: flex;
                background: var(--gray-100);
                border-radius: 0.5em;
                justify-content: space-between;
                padding: 0.5em;
            }
            
            .amountWrapper {
                display: flex;
                align-items: center;
                min-width: 0;
            }
            
            .amount {
                width: 100%;
                background: transparent;
                border: none;
                min-width: 4ch;
                max-width: 0;
                outline: 0;
            }
            
            .amount.disabled {
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #max {
                margin: 0 0.5em;
                cursor: pointer;
                color: var(--mainColor);
            }
            
            .shimmerIcon {
                height: 36px;
                width: 36px;
                border-radius: 100%;
                animation-duration: 35s;
            }
            
            .selectLogo {
                height: 36px;
                width: 36px;
                border-radius: 100%;
            }
            
            .defaultSelectLogo {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                border-radius: 100%;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
            }
            
            .select {
                display: flex;
                width: fit-content;
                align-items: center;
                background: white;
                padding: 0.5em 1em;
                border-radius: 0.5em;
                cursor: pointer;
                transition: 0.1s ease-in all;
                font-weight: 600;
            }
            
            .select:hover {
                background: var(--gray-50);
            }
            
            .selectName {
                margin: 0 0.5em;
                color: var(--gray-700);
            }
            
            .selectHeight {
                height: 36px;
            }
            
            .selectIcon {
                color: var(--gray-400);
                padding-bottom: 4px;
            }
            
            .labelWrapper {
                display: flex;
                justify-content: space-between;
                white-space: nowrap;
                color: var(--gray-400);
            }
            
            .balanceWrapper {
                display: flex;
                white-space: pre;
                min-width: 0;
                margin-left: 2em;
            }
            
            .balance {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #switch {
                background-color: var(--gray-50);
                width: fit-content;
                margin: 0 auto;
                padding: 0.5em;
                line-height: 1em;
                border-radius: 50%;
                color: var(--mainColor);
                cursor: pointer;
                transition: all 0.1s ease-in;
            }
            
            #switch:hover {
                background-color: var(--gray-100);
            }
            
            .button {
                margin-bottom: 70px;
            }
            
            .balanceShimmer {
                width: 5ch;
                border-radius: 0.5em;
                height: 1rem;
                animation-duration: 30s;
            }
            
            #tokenOutWrapper.shimmerBG {
                background: linear-gradient(to right, var(--gray-100) 8%, white 18%, var(--gray-100) 33%);
            }
            
            #unavailable, #notfound {
                color: var(--red-700);
                position: absolute;
                margin-top: 1em;
                width: 100%;
                text-align: center;
                margin-left: -1rem;
            }
            
            #notYetWrapper {
                height: 100vh;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            
            #notYetLogo {
                background: var(--gray-50);
                padding: 1em;
                border-radius: 50%;
                color: var(--gray-400);
            }
            
            #notYetText {
                color: var(--gray-700);
            }
        `;
    }

}

Stateful.define("swap-tokens", SwapTokens)
