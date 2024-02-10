class TransactionCard extends StatefulElement {

    async render() {
        const _this = this

        const json = JSON.parse(this.getAttribute("data"))

        console.log(json)

        const expandClick = this.registerFunction(() => {
            const wrapper = _this.querySelector("#wrapper")
            if(wrapper.classList.contains("opened")){
                wrapper.classList.remove("opened")
                return
            }

            wrapper.classList.add("opened")
        })

        return `
            <div class="row mt-2 transferOut ${this.getStatusClass(json)}" id="wrapper" onclick="${expandClick}">
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
                    <div id="header-right" class="pl-1">
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
                        <p class="detailContent">${(new Date(parseInt(json.date))).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/(\d+) (\w+) (\d+)/, "$1 $2. $3")}</p>
                    </div>
                    <div class="detail d-flex mt-2">
                        <p class="detailTitle">Hash</p>
                        <p class="detailContent">${json.hash}</p>
                        <p class="detailCopy text-sm"><i class="fa-regular fa-copy"></i></p>
                    </div>
                    <button class="button w-100 mt-3">Open in explorer</button>
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
                background: var(--whiteBackground);
            }
            
            #wrapper p {
                margin: 0;
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
                min-width: 6ch;
            }
            
            #header-right {
                flex: 1 0 0%;
                text-align: right;
                max-width: 70%;
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
                background: var(--bs-teal);
                border-radius: 100%;
            }
            
            .transferOut #icon {
                background: var(--green-100);
                color: var(--green-600);
            }
            
            .opened {
                background: var(--gray-50);
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
                margin-right: 1em !important;
            }
            
            .detailContent {
                flex: 1 0 0%;
                text-align: right;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .detailCopy {
                margin-left: 0.5em !important;
                color: var(--gray-400);
            }
            
            #amountAmount, #amountTicker, #wrapper.confirmed #status {
                color: var(--green-500);
            }
            
        `;
    }

    getTitle(json){
        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") return "Swap"

        return "Transfer"
    }

    async getSubtitle(json){
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
        if(json.contractAddr == "SWAP" || json.contractAddr == "WEB3_SWAP") return `<i class="fa-regular fa-arrow-right-arrow-left"></i>`

        return `<i class="fa-solid fa-arrow-up"></i>`
    }

    getStatus(json){
        if(json.status === undefined) return "Pending";
        if(json.status) return "Confirmed";
        if(!json.status && json.canceling) return "Canceled";
        return "Failed";
    }

    getStatusClass(json){
        if(json.status === undefined) return "pending";
        if(json.status) return "confirmed";
        return "failed";
    }

}

Stateful.define("transaction-card", TransactionCard)
