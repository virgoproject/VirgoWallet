class TransactionCard extends StatefulElement {

    eventHandlers() {
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

        const [shimmer, setShimmer] = this.useState("shimmer", false)

        if(!shimmer){
            setShimmer(true)
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

        const json = JSON.parse(this.getAttribute("data"))

        const expandClick = this.registerFunction(() => {
            const wrapper = _this.querySelector("#wrapper")
            if(wrapper.classList.contains("opened")) return

            wrapper.classList.add("opened")
        })

        const closeClick = this.registerFunction(e => {
            _this.querySelector("#wrapper").classList.remove("opened")
            e.stopPropagation()
        })

        return `
            <div class="row mt-2 ${this.getStatusClass(json)}" id="wrapper" onclick="${expandClick}">
                <div class="col-2 align-self-center">
                    <div id="icon">
                        ${this.getIcon(json)}
                    </div>
                </div>
                <div class="col-10 d-flex" id="header-wrapper">
                    <div id="header-left">
                        <p id="title" class="text-base">${this.getTitle(json)}</p>
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
                    ${await this.getAmountIn(json)}
                    ${await this.getAmountOut(json)}
                    ${this.getTo(json)}
                    <div class="detail d-flex mt-2 copy">
                        <p class="detailTitle">Hash</p>
                        <p class="detailContent">${json.hash}</p>
                        <p class="detailCopy text-sm"><i class="fa-regular fa-copy"></i></p>
                    </div>
                    ${this.getOrigin(json)}
                    ${this.getFees(json)}
                    <button class="button w-100 mt-3">Open in explorer</button>
                    <div class="text-center mt-2" id="close" onclick="${closeClick}">
                        <i class="fa-regular fa-chevron-up"></i>
                    </div>
                </div>
            </div>
        `;
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

    getTitle(json){
        if(json.contractAddr == "WEB3_CALL") return "Web3 Interaction"
        if(json.contractAddr == "ATOMICSWAP") return "Atomic Swap"
        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") return "Swap"

        return "Transfer"
    }

    async getSubtitle(json){
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
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenIn, MAIN_ASSET.chainID)
            return `
                <div class="d-flex text-sm">
                    <span id="subtitleAmount">-${Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)}</span>
                    <span id="subtitleTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        return "To " + json.recipient
    }

    async getAmount(json){
        if(json.contractAddr == "WEB3_CALL") {
            if(json.amount == 0) return ""

            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.amount, MAIN_ASSET.ticker)}</span>
                    <span id="amountTicker">${MAIN_ASSET.ticker}</span>
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

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenOut, MAIN_ASSET.chainID)

            return `
                <div class="d-flex">
                    <span id="amountAmount">+${Utils.formatAmount(json.swapInfos.amountOut, tokenInfos.decimals)}</span>
                    <span id="amountTicker">${tokenInfos.ticker}</span>
                </div>
            `
        }

        const tokenInfos = await getTokenDetailsCross(json.contractAddr, MAIN_ASSET.chainID)

        return "-" + Utils.formatAmount(json.amount, tokenInfos.decimals) + " " + tokenInfos.ticker
    }

    getIcon(json){
        if(json.contractAddr == "WEB3_CALL") return `<i class="fa-regular fa-globe-pointer"></i>`

        if(json.contractAddr == "ATOMICSWAP") return `<i class="fa-regular fa-right-left-large"></i>`

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") return `<i class="fa-regular fa-arrow-right-arrow-left"></i>`

        return `<i class="fa-solid fa-arrow-up"></i>`
    }

    getStatus(json){
        if(json.contractAddr == "ATOMICSWAP"){
            if(json.swapInfos.status == 3) return "Completed"
            if(json.swapInfos.status == -1) return "Failed"
            return "Pending"
        }

        if(json.status === undefined) return "Pending";
        if(json.status) return "Confirmed";
        if(!json.status && json.canceling) return "Canceled";
        return "Failed";
    }

    getStatusClass(json){
        if(json.contractAddr == "ATOMICSWAP"){
            if(json.swapInfos.status == 3) return "confirmed"
            if(json.swapInfos.status == -1) return "failed"
            return "pending"
        }

        if(json.status === undefined) return "pending";
        if(json.status) return "confirmed";
        return "failed";
    }

    async getAmountIn(json){
        let amount = ""
        let ticker = ""

        if(json.contractAddr == "WEB3_CALL") {
            if(json.amount == 0) return ""

            amount = Utils.formatAmount(json.amount, MAIN_ASSET.ticker)
            ticker = MAIN_ASSET.ticker
        }

        if(json.contractAddr == "ATOMICSWAP") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tickerA, json.swapInfos.chainIdA)
            amount = Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)
            ticker = tokenInfos.ticker
        }

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") {
            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenIn, MAIN_ASSET.chainID)
            amount = Utils.formatAmount(json.swapInfos.amountIn, tokenInfos.decimals)
            ticker = tokenInfos.ticker
        }

        if(amount == ""){
            const tokenInfos = await getTokenDetailsCross(json.contractAddr, MAIN_ASSET.chainID)
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

        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") {
            if(json.swapInfos.amountOut == undefined) return ""

            const tokenInfos = await getTokenDetailsCross(json.swapInfos.tokenOut, MAIN_ASSET.chainID)

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
        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP" || json.contractAddr == "ATOMICSWAP") return ""

        return `
            <div class="detail d-flex mt-2 copy">
                <p class="detailTitle">To</p>
                <p class="detailContent">${json.recipient}</p>
                <p class="detailCopy text-sm"><i class="fa-regular fa-copy"></i></p>
            </div>
        `
    }

    getFees(json){
        if(json.contractAddr == "ATOMICSWAP" && json.swapInfos.gasUsed != undefined){
            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Fees</p>
                    <p class="detailContent">${Utils.formatAmount(json.gasPrice * json.swapInfos.gasUsed, MAIN_ASSET.decimals)}</p><p class="pl-1">${MAIN_ASSET.ticker}</p>
                </div>
            `
        }

        if(json.gasUsed === undefined){
            return `
                <div class="detail d-flex mt-2">
                    <p class="detailTitle">Max fees</p>
                    <p class="detailContent">${Utils.formatAmount(json.gasPrice * json.gasLimit, MAIN_ASSET.decimals)}</p><p class="pl-1">${MAIN_ASSET.ticker}</p>
                </div>
            `
        }

        return `
            <div class="detail d-flex mt-2">
                <p class="detailTitle">Fees</p>
                <p class="detailContent">${Utils.formatAmount(json.gasPrice * json.gasUsed, MAIN_ASSET.decimals)}</p><p class="pl-1">${MAIN_ASSET.ticker}</p>
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

}

Stateful.define("transaction-card", TransactionCard)
