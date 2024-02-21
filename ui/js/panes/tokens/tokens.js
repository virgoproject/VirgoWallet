class TokensList extends StatefulElement {

    render() {
        const _this = this

        const [reset, setReset] = this.useState("reset", false)

        const {data, loading} = this.useInterval(async () => {
            const infos = await getBaseInfos()
            return infos.wallets[infos.selectedWallet].wallet.tokens
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
            if(_this.boxNumber >= data.length) return

            const oldBoxNum = _this.boxNumber
            _this.boxNumber = Math.min(_this.boxNumber+5, data.length)

            const scroll = _this.querySelector("#inner")

            for(const row of _this.getRows(data, oldBoxNum, _this.boxNumber)){
                scroll.insertAdjacentHTML("beforeend", row)
            }

        })

        if(this.boxNumber > data.length) this.boxNumber = data.length

        const rows = this.getRows(data, 0, this.boxNumber)

        const onSearch = this.registerFunction(val => {
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
                        <h4>Not found!</h4>
                        <p>Really want this asset? <br><span id="notFoundAdd">Add it now!</span></p>
                    </div>
                `
                return
            }

            const rows = _this.getRows(result, 0, result.length)
            _this.querySelector("#inner").innerHTML = rows
        })

        const addTokenClick = this.registerFunction(() => {
            const elem = document.createElement("add-token")
            elem.resetParent = () => {
                _this.runIntervals()
            }
            document.body.appendChild(elem)
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Manage tokens" backfunc="${back}"></section-header>
                    <search-bar inputhandler="${onSearch}"></search-bar>
                    <scroll-view id="scroll" onnearend="${onNearEnd}">
                        <div id="inner">
                            ${rows}
                        </div>
                    </scroll-view>
                    <div class="p-3">
                        <button class="button w-100" onclick="${addTokenClick}">Add a new token</button>              
                    </div>
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
            
            token-card {
                margin-top: 0.5rem;
                display: block;
            }
            
            token-card:first-child {
                margin-top: 0;
            }
            
            #notFoundAdd {
                color: var(--mainColor);
                cursor: pointer;
            }
        `;
    }

    getRows(data, min, max) {
        const rows = []

        for (let i = min; i < max; i++) {
            try {
                rows.push(`<token-card address="${data[i].contract}"></token-card>`)
            }catch (e) {}
        }

        return rows
    }
}

Stateful.define("tokens-list", TokensList)