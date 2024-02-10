class TransactionsHistory extends StatefulElement {

    beforeRender() {
        if(this.firstRendered === undefined){
            return
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

        const [boxNumber, setBoxNumber] = this.useState("boxNumber", 15)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onNearEnd = this.registerFunction(() => {
            if(boxNumber > data.length) return
            setBoxNumber(Math.min(boxNumber+5, data.length))
        })

        const rows = []

        for(let i = 0; i < boxNumber; i++){
            rows.push(`<transaction-card data='${JSON.stringify(data[i])}'></transaction-card>`)
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
                padding: 0 2em;
            }
            
        `;
    }

}

Stateful.define("transactions-pane", TransactionsHistory);
