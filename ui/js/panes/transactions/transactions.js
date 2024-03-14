class TransactionsHistory extends StatefulElement {

    beforeRender() {
        if(this.firstRendered === undefined){
            return
        }

        this.openedCards = []
        this.cards = []

        for(const elem of this.querySelectorAll("transaction-card")){
            this.cards.push(elem.id)
            if(elem.opened) this.openedCards.push(elem.id)
        }

        try {
            this.scrollPos = this.querySelector("#scroll").getScroll()
        }catch (e) {}

    }

    afterRender() {
        if(this.firstRendered === undefined){
            if(!this.querySelector("#scroll")) return
            this.firstRendered = true
            return
        }

        for(const elemId of this.openedCards){
            const elem = this.querySelector("#"+elemId)
            if(elem) elem.open()
        }

        try {
            this.querySelector("#scroll").setScroll(this.scrollPos)
        }catch (e) {}

    }

    render() {

        const _this = this

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            let selectedWallet = infos.wallets[infos.selectedWallet].wallet
            let transactions = selectedWallet.transactions
            return transactions
        })

        //just to reset the view if a new transaction arrived
        const {data: d, loading: l} = this.useInterval(async () => {
            const infos = await getBaseInfos()
            let selectedWallet = infos.wallets[infos.selectedWallet].wallet
            let transactions = selectedWallet.transactions
            return transactions.length
        }, 5000)

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
            if(_this.boxNumber >= data.length) return

            const oldBoxNum = _this.boxNumber
            _this.boxNumber = Math.min(_this.boxNumber+5, data.length)

            const scroll = _this.querySelector("#inner")

            for(const row of _this.getRows(data, oldBoxNum, _this.boxNumber)){
                scroll.insertAdjacentHTML("beforeend", row)
            }

        })

        if(this.boxNumber > data.length) this.boxNumber = data.length

        this.dates = []

        const rows = this.getRows(data, 0, this.boxNumber)

        if(rows.length == 0){
            rows.push(`
                <div class="text-center mt-4">
                    <img src="../images/noContact.png" id="emptyImg">
                    <p id="emptyTitle" class="text-lg mt-3 mb-1">No transactions yet!</p>
                    <p id="emptySubtitle">Your transaction history will appear here.</p>
                </div>
            `)
        }

        return `
           <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="History" backfunc="${back}"></section-header>
                    <scroll-view id="scroll" onnearend="${onNearEnd}">
                        <div id="inner">
                            ${rows}
                        </div>
                    </scroll-view>
                </div>
           </div>
        `;
    }

    getRows(data, min, max){
        const rows = []

        for(let i = min; i < max; i++){
            try {
                const date = (new Date(data[i].date)).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/(\d+) (\w+) (\d+)/, "$1 $2. $3")
                const today = (new Date(Date.now())).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/(\d+) (\w+) (\d+)/, "$1 $2. $3")
                const yesterday = (new Date(Date.now()-86400000)).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/(\d+) (\w+) (\d+)/, "$1 $2. $3")

                let displayedDate = date

                if(date == today)
                    displayedDate = "Today"

                if(date == yesterday)
                    displayedDate = "Yesterday"

                if(!this.dates.includes(displayedDate)){
                    this.dates.push(displayedDate)
                    rows.push(`<p class="date text-sm">${displayedDate.replace(", " + new Date().getFullYear(), "")}</p>`)
                }

                rows.push(`<transaction-card id='${"x"+data[i].hash.replace("0x", "")}'></transaction-card>`)
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
            
            #inner {
                padding: 0px 2rem 2em;
            }
            
            .date {
                margin-bottom: -0.25em;
                margin-top: 1em;
            }
            
            #emptyImg {
                width: 100%;
            }
            
            #emptyTitle {
                color: var(--gray-700);
                font-weight: 600;
            }
            
            #emptySubtitle {
                color: var(--gray-400);
            }
        `;
    }

}

Stateful.define("transactions-pane", TransactionsHistory);
