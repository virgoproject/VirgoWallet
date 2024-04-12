class TransactionCard extends StatefulElement {

    eventHandlers() {
        const _this = this

        this.querySelectorAll(".copy").forEach(e => {

            const clickFunc = event => {
                notyf.success("Copied to clipboard!")
                copyToClipboard(e.querySelector(".detailContent").textContent)
            }

            e.querySelector(".detailContent").onclick = clickFunc
            e.querySelector(".detailCopy").onclick = clickFunc
        })

    }

    async render() {
        const _this = this

        const {data: json, loading} = this.useInterval(async () => {
            if(_this.hasAttribute("cross"))
                return await getCrossSwap("0"+_this.getAttribute("id"))

            return await getTransaction("0"+_this.getAttribute("id"))
        }, 10000)

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(loading || baseInfosLoading){
            return `
                <div id="shimmer" class="row mt-2">
                    <div class="col-2 align-self-center">
                        <div class="shimmerBG" id="shimmerIcon"></div>
                    </div>
                    <div class="col-10 align-self-center">
                        <div class="shimmerBG" id="shimmerTitle"></div>
                        <div class="shimmerBG" id="shimmerSubtitle"></div>               
                    </div>
                </div>
            `
        }

        this.json = json

        this.selectedWallet = baseInfos.wallets[baseInfos.selectedWallet].wallet

        const expandClick = this.registerFunction(() => {
            const wrapper = _this.querySelector("#wrapper")
            if(wrapper.classList.contains("opened")) return

            _this.opened = true

            wrapper.classList.add("opened")
        })

        const closeClick = this.registerFunction(e => {
            _this.querySelector("#wrapper").classList.remove("opened")
            _this.opened = false
            e.stopPropagation()
        })

        return `
            <div class="row mt-2 ${this.getStatusClass(json)}" id="wrapper" onclick="${expandClick}">
                <div class="col-2 align-self-center">
                    <div id="icon">
                        ${this.getIcon(json)}
                        ${this.getProgressRing(json)}
                    </div>
                </div>
                <div class="col-10 d-flex" id="header-wrapper">
                    <div id="header-left">
                        <p id="title" class="text-base">${await this.getTitle(json)}</p>
                        <p id="subtitle" class="text-sm">${await this.getSubtitle(json)}</p>
                    </div>
                    <div id="header-right" class="pl-1" style="max-width: calc(100% - ${Math.max(this.getTitle(json).length, 8)}ch);">
                        <p id="amount" class="text-base">${await this.getAmount(json)}</p>
                    </div>
                </div>
                <div class="col-12 mt-2" id="details">
                    <div class="detail d-flex mt-2">
                        <p class="detailTitle">Status</p>
                        <p class="detailContent" id="status">${this.getStatus(json)}</p>
                    </div>
                    <div class="detail d-flex mt-2">
                        <p class="detailTitle">Date</p>
                        <p class="detailContent">${(new Date(parseInt(json.date))).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/(\d+) (\w+) (\d+), (\d+):(\d+)/, "$1 $2. $3 $4:$5")}</p>
                    </div>
                    ${await this.getChainIn(json)}
                    ${await this.getAmountIn(json)}
                    ${await this.getChainOut(json)}
                    ${await this.getAmountOut(json)}
                    ${this.getTo(json)}
                    <div class="detail d-flex mt-2 copy">
                        <p class="detailTitle">Hash</p>
                        <p class="detailContent">${json.hash}</p>
                        <p class="detailCopy text-sm"><i class="fa-regular fa-copy"></i></p>
                    </div>
                    ${this.getOrigin(json)}
                    ${await this.getFees(json)}
                    ${this.getBtns(json)}
                    <div class="text-center mt-2" id="close" onclick="${closeClick}">
                        <i class="fa-regular fa-chevron-up"></i>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const wrapper = this.querySelector("#wrapper")
        if(this.opened) wrapper.classList.add("opened")
    }

    style() {
        return `        
            #wrapper {
                padding: 0.75em 0;
                border-radius: 0.5em;
                transition: all 0.2s ease-in;
                cursor: pointer;
            }
            
            #wrapper:hover {
                background: var(--gray-50);
            }
            
            #wrapper p {
                margin: 0;
            }
            
            #shimmer {
                height: 57px;
                width: 100%;
            }
            
            progress-ring {
                position: relative;
                top: -36px;
                left: 0;
            }
            
            #shimmerIcon {
                height: 36px;
                width: 36px;
                border-radius: 100%;
                animation-duration: 35s;
            }
            
            #shimmerTitle {
                border-radius: 0.5em;
                height: 1em;
                width: 12ch;
                margin-bottom: 0.5em;
                animation-duration: 15s;
            }
            
            #shimmerSubtitle {
                border-radius: 0.5em;
                height: 0.875em;
                width: 8ch;
                animation-duration: 20s;
            }
            
            #header-wrapper {
                white-space: nowrap;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: center;
                align-items: center;
            }
            
            #header-left {
                flex: 1 2 12ch;
                overflow: hidden;
            }
            
            #header-right {
                flex: 1 0 0%;
                text-align: right;
            }
            
            #title {
                color: var(--gray-700);
            }
            
            #subtitle, #subtitleAmount, #subtitleTicker {
                color: var(--gray-400);
                text-overflow: ellipsis;
                overflow: hidden;
            }
            
            #subtitleAmount, #amountAmount {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #subtitleTicker, #amountTicker {
                flex: 0 2 fit-content;
                min-width: fit-content;
                padding-left: 0.25em;
            }
            
            #amount {
                color: var(--gray-700);
            }
            
            #icon {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                background: var(--gray-100);
                color: var(--gray-600);
                border-radius: 100%;
            }
            
            .opened {
                background: var(--gray-50)!important;
                cursor: default!important;
            }
            
            #details {
                display: none;
            }

            .opened #details {
                display: block;
            }
            
            .detailTitle {
                color: var(--gray-400);
                flex: 0 2 fit-content;
                overflow: hidden;
                min-width: fit-content;
                margin-right: 3em !important;
            }
            
            .detailContent {
                flex: 1 0 0%;
                text-align: right;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .copy .detailContent {
                cursor: pointer;
            }
            
            .detailCopy {
                margin-left: 0.5em !important;
                color: var(--gray-400);
                cursor: pointer;
            }
            
            #status {
                color: var(--gray-500);
            }
            
            #amountAmount, #amountTicker, #wrapper.confirmed #status {
                color: var(--green-500);
            }
            
            #wrapper.confirmed #icon {
                background: var(--green-100);
                color: var(--green-600);
            }
            
            #wrapper.failed #icon {
                background: var(--red-100);
                color: var(--red-600);
            }
            
            #wrapper.failed #status {
                color: var(--red-500);
            }
            
            #close {
                cursor: pointer;
                transition: all 0.2s ease-in;
            }
            
            #close:hover {
                background: var(--gray-100);
                border-radius: 0.5em;
            }
            
        `;
    }

    open(){
        const wrapper = this.querySelector("#wrapper")
        wrapper.classList.add("opened")
        this.opened = true
    }

    async getTitle(json){
        if(json.contractAddr == "UNWRAP") return "Unwrap token"
        if(json.contractAddr == "WRAP") return "Wrap token"
        if(json.contractAddr == "WEB3_CALL") return "Web3 Interaction"
        if(json.contractAddr == "ATOMICSWAP") return "Atomic Swap"
        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP" || json.contractAddr == "SIMPLESWAP") return "Swap"
        if(json.contractAddr == "TRANSAK") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenB, json.swapInfos.chainB)
            return "Buy " + tokenInfos.ticker
        }
        return "Transfer"
    }

    async getSubtitle(json){
        if(json.contractAddr == "UNWRAP"){
            const tokenInfos = await getTokenDetailsCross(json.recipient, this.selectedWallet.chainID)

            return `
                <div class="d-flex text-sm">
                    <span id="subtitleAmount">-${Utils.formatAmount(json.amount, tokenInfos.decimals)}</span>
                    <span id="subtitleTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "WRAP") {
            return `
                <div class="d-flex text-sm">
                    <span id="subtitleAmount">-${Utils.formatAmount(json.amount, this.selectedWallet.decimals)}</span>
                    <span id="subtitleTicker">${this.selectedWallet.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "WEB3_CALL") return new URL(json.origin).hostname

        if(json.contractAddr == "ATOMICSWAP") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tickerA, json.swapInfos.chainIdA)
            return `
                <div class="d-flex text-sm">
                    <span id="subtitleAmount">-${Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)}</span>
                    <span id="subtitleTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenIn, this.selectedWallet.chainID)
            return `
                <div class="d-flex text-sm">
                    <span id="subtitleAmount">-${Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)}</span>
                    <span id="subtitleTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "SIMPLESWAP"){
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenA, json.swapInfos.chainA)
            return `
                <div class="d-flex text-sm">
                    <span id="subtitleAmount">-${Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)}</span>
                    <span id="subtitleTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "TRANSAK"){
            return `
                <div class="d-flex text-sm">
                    <span id="subtitleAmount">-${json.swapInfos.amountIn}</span>
                    <span id="subtitleTicker">${json.swapInfos.tokenA}</span>
                </div>
            `
        }

        return "To " + json.recipient
    }

    async getAmount(json){
        if(json.contractAddr == "UNWRAP") {
            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.amount, this.selectedWallet.decimals)}</span>
                    <span id="amountTicker">${this.selectedWallet.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "WRAP"){
            const tokenInfos = await getTokenDetailsCross(json.recipient, this.selectedWallet.chainID)

            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.amount, tokenInfos.decimals)}</span>
                    <span id="amountTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "WEB3_CALL") {
            if(json.amount == 0) return ""

            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.amount, this.selectedWallet.ticker)}</span>
                    <span id="amountTicker">${this.selectedWallet.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "ATOMICSWAP") {
            if(json.swapInfos.amountOut == undefined) return ""

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tickerB, json.swapInfos.chainIdB)

            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.swapInfos.amountOut, tokenInfos.decimals)}</span>
                    <span id="amountTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") {
            if(json.swapInfos.amountOut == undefined) return ""

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenOut, this.selectedWallet.chainID)

            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.swapInfos.amountOut, tokenInfos.decimals)}</span>
                    <span id="amountTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        if(json.contractAddr == "SIMPLESWAP" || json.contractAddr == "TRANSAK") {
            if(json.swapInfos.amountOut == undefined) return ""

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenB, json.swapInfos.chainB)

            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.swapInfos.amountOut, tokenInfos.decimals)}</span>
                    <span id="amountTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        const tokenInfos = await getTokenDetailsCross(json.contractAddr, this.selectedWallet.chainID)

        return "-" + Utils.formatAmount(json.amount, tokenInfos.decimals) + " " + tokenInfos.ticker
    }

    getIcon(json){
        if(json.contractAddr == "UNWRAP") return `<i class="fa-regular fa-box-open"></i>`

        if(json.contractAddr == "WRAP") return `<i class="fa-regular fa-box-taped"></i>`

        if(json.contractAddr == "WEB3_CALL") return `<i class="fa-regular fa-globe-pointer"></i>`

        if(json.contractAddr == "ATOMICSWAP") return `<i class="fa-regular fa-right-left-large"></i>`

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP" || json.contractAddr == "SIMPLESWAP") return `<i class="fa-regular fa-arrow-right-arrow-left"></i>`

        if(json.contractAddr == "TRANSAK") return `<i class="fa-regular fa-cart-shopping"></i>`

        return `<i class="fa-solid fa-arrow-up"></i>`
    }

    getProgressRing(json){
        if(!(json.status === undefined || json.status)) return ""

        let confirmations = 0
        if(json.confirmations) confirmations = json.confirmations

        let progress = Math.min(100, (confirmations+1)/13*100)

        if(json.contractAddr == "ATOMICSWAP" || json.contractAddr == "SIMPLESWAP" || json.contractAddr == "TRANSAK") progress = Math.min(100, (json.swapInfos.status+1)/4*100)

        if(progress == 100) return ""

        return `<progress-ring stroke="4" radius="24" progress="${progress}" data-progress=""></progress-ring>`
    }

    getStatus(json){
        if(json.contractAddr == "ATOMICSWAP"){
            if(json.swapInfos.status == 3) return "Completed"
            if(json.swapInfos.status == -1) return "Failed"
            return "Pending"
        }

        if(json.contractAddr == "SIMPLESWAP")
            return json.swapInfos.ssStatus

        if(json.contractAddr == "TRANSAK")
            return json.swapInfos.trStatus

        if(json.status === undefined) return "Pending";
        if(json.status) return "Confirmed";
        if(!json.status && json.canceling) return "Canceled";
        return "Failed";
    }

    getStatusClass(json){
        if(json.contractAddr == "ATOMICSWAP" || json.contractAddr == "SIMPLESWAP" || json.contractAddr == "TRANSAK"){
            if(json.swapInfos.status == 3) return "confirmed"
            if(json.swapInfos.status == -1) return "failed"
            return "pending"
        }

        if(json.status === undefined || (json.status && json.confirmations < 12)) return "pending";
        if(json.status) return "confirmed";
        return "failed";
    }

    async getAmountIn(json){
        let amount = ""
        let ticker = ""

        if(json.contractAddr == "UNWRAP"){
            const tokenInfos = await getTokenDetailsCross(json.recipient, this.selectedWallet.chainID)

            amount = Utils.formatAmount(json.amount, tokenInfos.decimals)
            ticker = tokenInfos.ticker
        }

        if(json.contractAddr == "WEB3_CALL" || json.contractAddr == "WRAP") {
            if(json.amount == 0) return ""

            amount = Utils.formatAmount(json.amount, this.selectedWallet.ticker)
            ticker = this.selectedWallet.ticker
        }

        if(json.contractAddr == "ATOMICSWAP") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tickerA, json.swapInfos.chainIdA)
            amount = Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)
            ticker = tokenInfos.ticker
        }

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenIn, this.selectedWallet.chainID)
            amount = Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)
            ticker = tokenInfos.ticker
        }

        if(json.contractAddr == "SIMPLESWAP") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenA, json.swapInfos.chainA)
            amount = Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)
            ticker = tokenInfos.ticker
        }

        if(json.contractAddr == "TRANSAK") {
            amount = json.swapInfos.amountIn
            ticker = json.swapInfos.tokenA
        }

        if(amount == ""){
            const tokenInfos = await getTokenDetailsCross(json.contractAddr, this.selectedWallet.chainID)
            amount = Utils.formatAmount(json.amount, tokenInfos.decimals)
            ticker = tokenInfos.ticker
        }

        return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Sent</p>
                    <p class="detailContent">${amount}</p>
                    <p class="pl-1">${ticker}</p>
                </div>
            `
    }

    async getAmountOut(json){
        if(json.contractAddr == "ATOMICSWAP") {
            if(json.swapInfos.amountOut == undefined) return ""

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tickerB, json.swapInfos.chainIdB)

            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Received</p>
                    <p class="detailContent">${Utils.formatAmount(json.swapInfos.amountOut, tokenInfos.decimals)}</p>
                    <p class="pl-1">${tokenInfos.ticker}</p>
                </div>
            `
        }

        if(json.contractAddr == "SIMPLESWAP" || json.contractAddr == "TRANSAK") {
            if(json.swapInfos.amountOut == undefined) return ""

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenB, json.swapInfos.chainB)

            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Received</p>
                    <p class="detailContent">${Utils.formatAmount(json.swapInfos.amountOut, tokenInfos.decimals)}</p>
                    <p class="pl-1">${tokenInfos.ticker}</p>
                </div>
            `
        }

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") {
            if(json.swapInfos.amountOut == undefined) return ""

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenOut, this.selectedWallet.chainID)

            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Received</p>
                    <p class="detailContent">${Utils.formatAmount(json.swapInfos.amountOut, tokenInfos.decimals)}</p>
                    <p class="pl-1">${tokenInfos.ticker}</p>
                </div>
            `
        }

        return ""
    }

    getTo(json){
        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP" || json.contractAddr == "ATOMICSWAP" || json.contractAddr == "WRAP" || json.contractAddr == "ATOMICSWAP" || json.contractAddr == "SIMPLESWAP" || json.contractAddr == "TRANSAK") return ""

        return `
            <div class="detail d-flex mt-2 copy">
                <p class="detailTitle">To</p>
                <p class="detailContent">${json.recipient}</p>
                <p class="detailCopy text-sm"><i class="fa-regular fa-copy"></i></p>
            </div>
        `
    }

    async getFees(json){
        if(json.contractAddr == "TRANSAK") return ""

        if(json.contractAddr == "ATOMICSWAP" && json.swapInfos.gasUsed != undefined){
            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Fees</p>
                    <p class="detailContent">${Utils.formatAmount(json.gasPrice * json.swapInfos.gasUsed, this.selectedWallet.decimals)}</p><p class="pl-1">${this.selectedWallet.ticker}</p>
                </div>
            `
        }

        if(json.contractAddr == "SIMPLESWAP"){
            const chainInfos = await getChainInfos(json.swapInfos.chainA)
            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Fees</p>
                    <p class="detailContent">${Utils.formatAmount(json.gasPrice * json.gasLimit, chainInfos.wallet.decimals)}</p><p class="pl-1">${chainInfos.wallet.ticker}</p>
                </div>
            `
        }

        if(json.gasUsed === undefined){
            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Max fees</p>
                    <p class="detailContent">${Utils.formatAmount(json.gasPrice * json.gasLimit, this.selectedWallet.decimals)}</p><p class="pl-1">${this.selectedWallet.ticker}</p>
                </div>
            `
        }

        return `
            <div class="detail d-flex mt-2">
                <p class="detailTitle">Fees</p>
                <p class="detailContent">${Utils.formatAmount(json.gasPrice * json.gasUsed, this.selectedWallet.decimals)}</p><p class="pl-1">${this.selectedWallet.ticker}</p>
            </div>
        `
    }

    getOrigin(json){
        if(json.origin == undefined || json.contractAddr == "WEB3_CALL") return ""

        let origin = json.origin

        try {
            origin = new URL(origin).hostname
        }catch (e) {}

        return `
            <div class="detail d-flex mt-2">
                <p class="detailTitle">Origin</p>
                <p class="detailContent">${origin}</p>
            </div>
        `
    }

    getBtns(json){
        const _this = this

        if(json.contractAddr == "TRANSAK") return ""

        if(json.status === undefined){
            const speedupClick = this.registerFunction(() => {
                const elem = document.createElement("speedup-transaction")
                elem.hash = json.hash
                elem.updateHash = newHash => {
                    _this.setAttribute("id", newHash.substring(1))
                }
                document.body.appendChild(elem)
            })

            const cancelClick = this.registerFunction(() => {
                const elem = document.createElement("cancel-transaction")
                elem.hash = json.hash
                elem.updateHash = newHash => {
                    _this.setAttribute("id", newHash.substring(1))
                }
                document.body.appendChild(elem)
            })

            return `
                <div class="row mt-3">
                    <div class="col-6 pr-2">
                        <button class="button w-100 button-red" onclick="${cancelClick}">Cancel</button>
                    </div>
                    <div class="col-6 pl-2">
                        <button class="button w-100 button-green" onclick="${speedupClick}">Speed up</button>
                    </div>
                </div>
            `
        }

        if(json.contractAddr == "ATOMICSWAP" || json.contractAddr == "SIMPLESWAP") return ""

        const openExplorer = this.registerFunction(() => {
            browser.windows.create({
                url: _this.selectedWallet.explorer + json.hash
            })
        })

        return `<button class="button w-100 mt-3" onclick="${openExplorer}">Open in explorer</button>`
    }

    async getChainIn(json){
        if(json.contractAddr != "SIMPLESWAP") return ""

        const chainInfos = await getChainInfos(json.swapInfos.chainA)

        return `
            <div class="detail d-flex mt-2">
                <p class="detailTitle">Chain In</p>
                <p class="detailContent">${chainInfos.wallet.name}</p>
            </div>
        `
    }

    async getChainOut(json){
        if(json.contractAddr != "SIMPLESWAP" && json.contractAddr != "TRANSAK") return ""

        const chainInfos = await getChainInfos(json.swapInfos.chainB)

        return `
            <div class="detail d-flex mt-2">
                <p class="detailTitle">Chain Out</p>
                <p class="detailContent">${chainInfos.wallet.name}</p>
            </div>
        `
    }

}

Stateful.define("transaction-card", TransactionCard)
