class ConfirmSwap extends StatefulElement {

    eventHandlers() {
        const _this = this

        const logoIn = this.querySelector("#tokenIn .logo")

        logoIn.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#tokenIn .shimmerIcon").style.display = "none"
        }
        logoIn.onerror = e => {
            _this.querySelector("#tokenIn .defaultLogo").style.display = "flex"
            _this.querySelector("#tokenIn .shimmerIcon").style.display = "none"
        }

        logoIn.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.tokenIn.chainID + "/" + this.tokenIn.contract + "/logo.png"

        const chainLogoIn = this.querySelector("#tokenIn .chainLogo")

        chainLogoIn.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#tokenIn .shimmerChainLogo").style.display = "none"
        }
        chainLogoIn.onerror = e => {
            _this.querySelector("#tokenIn .defaultChainLogo").style.display = "flex"
            _this.querySelector("#tokenIn .shimmerChainLogo").style.display = "none"
        }

        chainLogoIn.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.tokenIn.chainID + "/logo.png"



        const logoOut = this.querySelector("#tokenOut .logo")

        logoOut.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#tokenOut .shimmerIcon").style.display = "none"
        }
        logoOut.onerror = e => {
            _this.querySelector("#tokenOut .defaultLogo").style.display = "flex"
            _this.querySelector("#tokenOut .shimmerIcon").style.display = "none"
        }

        logoOut.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.tokenOut.chainID + "/" + this.tokenOut.contract + "/logo.png"

        const chainLogoOut = this.querySelector("#tokenOut .chainLogo")

        chainLogoOut.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#tokenOut .shimmerChainLogo").style.display = "none"
        }
        chainLogoOut.onerror = e => {
            _this.querySelector("#tokenOut .defaultChainLogo").style.display = "flex"
            _this.querySelector("#tokenOut .shimmerChainLogo").style.display = "none"
        }

        chainLogoOut.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + this.tokenOut.chainID + "/logo.png"

    }

    render() {
        const _this = this

        const {data: chainInfos, loading: chainInfosLoading} = this.useFunction(async () => {
            return (await getChainInfos(_this.tokenIn.chainID)).wallet
        })

        if(chainInfosLoading) return ""

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const {data: balance, loading: balanceLoading} = this.useInterval(async () => {
            return {
                token: await getBalanceCross(_this.tokenIn.chainID, _this.tokenIn.contract),
                native: await getBalanceCross(_this.tokenIn.chainID)
            }
        }, 10000)

        const {data: fees, loading: feesLoading} = this.useFunction(async () => {
            const swapFees = await estimateSwapFees(_this.tokenIn.chainID, _this.tokenIn.contract, _this.tokenOut.chainID, _this.tokenOut.contract, _this.amountIn, _this.route)
            const gasPrice = await getGasPrice(_this.tokenIn.chainID)
            return {
                gasLimit: swapFees.gas,
                gasPrice,
                feesRate: swapFees.feesRate
            }
        })

        const {data: refresh30s, loading: refresh30sLoading} = this.useInterval(async () => {
            _this.route = _this.getRoute()
            return Math.random()
        }, 30000)

        const [sending, setSending] = this.useState("sending", false)

        let feesContent = ""

        if(balanceLoading || feesLoading)
            feesContent = this.feesShimmer()
        else
            feesContent = this.getFees(fees, chainInfos, balance, sending)

        const confirmClick = this.registerFunction(() => {
            initSwap(_this.tokenIn.chainID, _this.tokenIn.contract, _this.tokenOut.chainID, _this.tokenOut.contract, _this.amountIn, _this.route, fees.gasLimit, _this.gasPrice)
                .then(function () {
                    notyf.success("Swap initiated!")
                    _this.feesEditor.remove()
                    _this.resetParent()
                    _this.remove()
                })
            setSending(true)
        })

        let button = `<button class="button w-100" id="next" ${this.btnDisabled ? "disabled" : ""} onclick="${confirmClick}">Confirm</button>`
        if(sending) button = `<button class="button w-100" disabled><i class="fa-solid fa-spinner-third fa-spin"></i></button>`

        return `
            <bottom-popup onclose="${back}">
                    <section-header title="Confirm Swap" no-padding></section-header>
                    <div id="content">
                        <div>
                            <div class="tokenWrapper mt-3" id="tokenIn">
                                <div class="logosWrapper">
                                    <div class="shimmerBG shimmerIcon"></div>
                                    <div class="defaultLogo" style="display: none"><p class="m-auto">${_this.tokenIn.name.charAt(0).toUpperCase()}</p></div>
                                    <img class="logo" style="display: none">
                                    <div class="shimmerBG shimmerChainLogo"></div>
                                    <div class="defaultChainLogo" style="display: none"><p class="m-auto">${_this.tokenIn.chainName.charAt(0).toUpperCase()}</p></div>
                                    <img class="chainLogo" style="display: none">
                                </div>
                                <div class="textLeft">
                                    <p class="amountLabel text-sm">You swap</p>
                                    <div class="amountWrapper">
                                        <p class="amount">${Utils.formatAmount(_this.amountIn, _this.tokenIn.decimals)}</p>
                                        <p> ${_this.tokenIn.ticker}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="tokenWrapper mt-3" id="tokenOut">
                                <div class="logosWrapper">
                                    <div class="shimmerBG shimmerIcon"></div>
                                    <div class="defaultLogo" style="display: none"><p class="m-auto">${_this.tokenOut.name.charAt(0).toUpperCase()}</p></div>
                                    <img class="logo" style="display: none">
                                    <div class="shimmerBG shimmerChainLogo"></div>
                                    <div class="defaultChainLogo" style="display: none"><p class="m-auto">${_this.tokenOut.chainName.charAt(0).toUpperCase()}</p></div>
                                    <img class="chainLogo" style="display: none">
                                </div>
                                <div class="textLeft">
                                    <p class="amountLabel text-sm">You will get</p>
                                    <div class="amountWrapper">
                                        <p class="amount">${Utils.formatAmount(_this.route.routes[0].amount, _this.tokenOut.decimals)}</p>
                                        <p> ${_this.tokenOut.ticker}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${feesContent}
                    </div>
                    <div class="mt-3">
                        ${button}
                    </div>
            </div>
        `;
    }

    getFees(fees, wallet, balance, sending){
        const _this = this

        const [gasPrice, setGasPrice] = this.useState("gasPrice", fees.gasPrice)
        const [gasLimit, setGasLimit] = this.useState("gasLimit", fees.gasLimit)

        _this.gasLimit = gasLimit
        _this.gasPrice = gasPrice

        const editFeesClick = this.registerFunction(() => {
            if(sending) return
            _this.feesEditor.show()
        })

        if(this.feesEditor === undefined){
            this.feesEditor = EditFeesNew.init(gasLimit, setGasPrice, wallet)
        }

        const feesBN = new BN(gasLimit).mul(new BN(gasPrice))
        let totalNative = feesBN
        if(_this.tokenIn.contract == wallet.ticker)
            totalNative = totalNative.add(new BN(_this.amountIn))

        this.btnDisabled = totalNative.gt(new BN(balance.native.balance)) || new BN(_this.amountIn).gt(new BN(balance.token.balance))

        return `
            <div id="feesWrapper" class="mt-4">
                <div class="feesRow mb-2">
                    <p class="feesTitle">Network fees<span id="editFees" onclick="${editFeesClick}">Edit</span></p>
                    <div class="feesAmountWrapper">
                        <p class="feesAmount">${Utils.formatAmount(feesBN.toString(), wallet.decimals)}</p>
                        <p> ${wallet.ticker}</p>
                    </div>
                </div>
                <div class="feesRow mb-2">
                    <p class="feesTitle">Swap fees</p>
                    <div class="feesAmountWrapper">
                        <p class="feesAmount">${Utils.formatAmount(new BN(_this.amountIn).mul(new BN(fees.feesRate*1000)).div(new BN(1000)).toString(), _this.tokenIn.decimals)}</p>
                        <p> ${_this.tokenIn.ticker}</p>
                    </div>
                </div>
                <div class="feesRow mb-2">
                    <p class="feesTitle">Slippage</p>
                    <div class="feesAmountWrapper">
                        <p class="feesAmount">Auto</p>
                    </div>
                </div>
                <div class="feesRow">
                    <p class="feesTitle">Total</p>
                    <div class="feesAmountWrapper">
                        <p class="feesAmount">${Utils.formatAmount(totalNative.toString(), wallet.decimals)}</p>
                        <p> ${wallet.ticker}</p>
                    </div>
                </div>
            </div>
        `
    }

    feesShimmer(){
        this.btnDisabled = true
        return `
            <div class="shimmerBG mt-4" id="feesShimmer"></div>
        `
    }

    style() {
        return `
            #content {
                flex-grow: 1;
                min-height: 0;
                text-align: center;
            }
            
            .logosWrapper {
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
            
            .shimmerIcon {
                height: 36px;
                width: 36px;
                border-radius: 100%;
                animation-duration: 35s;
            }
            
            .logo {
                height: 36px;
                width: 36px;
                border-radius: 100%;
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
            
            .tokenWrapper {
                display: flex;
                text-align: left;
                align-items: center;
            }
            
            .tokenWrapper p {
                margin: 0;
            }
            
            .textLeft {
                padding-left: 1em;
                min-width: 0;
                flex: 1;
            }
            
            .amountWrapper {
                display: flex;
                white-space: pre;
            }
            
            .amount {
                margin: 0;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .amountLabel {
                color: var(--gray-400);
            }
            
            #feesWrapper {
                background-color: var(--gray-50);
                padding: 1em;
                border-radius: 0.5em;
                color: var(--gray-700);
            }
            
            #feesWrapper p {
                margin-bottom: 0;
                font-weight: 600;
            }
            
            .feesRow {
                display: flex;
                justify-content: space-between;
            }
            
            .feesTitle {
                min-width: fit-content;
                margin-right: 1em;
                color: var(--gray-400);
                font-weight: 500!important;
            }
            
            .feesAmountWrapper {
                display: flex;
                white-space: pre;
                min-width: 0;
            }
            
            .feesAmount {
                min-width: 0px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #editFees {
                color: var(--mainColor);
                cursor: pointer;
                margin-left: 1em;
                font-weight: 600;
            }
            
            #feesShimmer {
                height: 136px;
                border-radius: 0.5em;
            }
        `;
    }

}

Stateful.define("confirm-swap", ConfirmSwap)
