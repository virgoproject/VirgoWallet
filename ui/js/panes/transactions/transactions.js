class TransactionsHistory extends StatefulElement {

    beforeRender() {
        if(this.firstRendered === undefined){
            return
        }

        this.scrollPos = this.querySelector("#scroll").getScroll()
    }

    afterRender() {
        if(this.firstRendered === undefined){
            this.firstRendered = true
            return
        }

        this.querySelector("#scroll").setScroll(this.scrollPos)

    }

    render() {

        const _this = this

        const [boxNumber, setBoxNumber] = this.useState("boxNumber", 6)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onNearEnd = this.registerFunction(() => {
            if(boxNumber > 20) return
            setBoxNumber(boxNumber+3)
        })

        const rows = []

        for(let i = 0; i < boxNumber; i++){
            rows.push(`<transaction-card></transaction-card>`)
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