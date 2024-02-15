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
            console.log(elem)
            if(elem) elem.open()
        }

        try {
            this.querySelector("#scroll").setScroll(this.scrollPos)
        }catch (e) {}

    }

    render() {

        const _this = this

        const {data, loading} = this.useInterval(async () => {
            const infos = await getBaseInfos()
            let selectedWallet = infos.wallets[infos.selectedWallet].wallet
            let transactions = selectedWallet.transactions
            return transactions
        }, 5000)

        if(loading){
            return `
                <div id="loading">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
            `
        }

        let [boxNumber, setBoxNumber] = this.useState("boxNumber", 15)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onNearEnd = this.registerFunction(() => {
            if(boxNumber >= data.length) return
            setBoxNumber(Math.min(boxNumber+5, data.length))
        })

        if(boxNumber > data.length) boxNumber = data.length

        const rows = []

        const dates = []

        for(let i = 0; i < boxNumber; i++){
            try {
                const date = (new Date(data[i].date)).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/(\d+) (\w+) (\d+)/, "$1 $2. $3")
                const today = (new Date(Date.now())).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/(\d+) (\w+) (\d+)/, "$1 $2. $3")
                const yesterday = (new Date(Date.now()-86400000)).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/(\d+) (\w+) (\d+)/, "$1 $2. $3")

                let displayedDate = date

                if(date == today)
                    displayedDate = "Today"

                if(date == yesterday)
                    displayedDate = "Yesterday"

                if(!dates.includes(displayedDate)){
                    dates.push(displayedDate)
                    rows.push(`<p class="date text-sm">${displayedDate.replace(", " + new Date().getFullYear(), "")}</p>`)
                }

                let displayed = false

                if(this.cards)
                    displayed = this.cards.includes("x"+data[i].hash.replace("0x", ""))


                rows.push(`<transaction-card id='${"x"+data[i].hash.replace("0x", "")}' data='${JSON.stringify(data[i])}' displayed="${displayed}"></transaction-card>`)
            }catch (e) {}
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
                padding: 0 2em 2em;
            }
            
            .date {
                margin-bottom: -0.25em;
                margin-top: 1em;
            }
        `;
    }

}

Stateful.define("transactions-pane", TransactionsHistory);
