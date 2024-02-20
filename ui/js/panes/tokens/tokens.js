class TokensList extends StatefulElement {

    render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            return infos.wallets[infos.selectedWallet].wallet.tokens
        })

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

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Manage tokens" backfunc="${back}"></section-header>
                    <search-bar></search-bar>
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
            
            token-card {
                margin-top: 0.5rem;
                display: block;
            }
            
            token-card:first-child {
                margin-top: 0;
            }
        `;
    }

    getRows(data, min, max) {
        const rows = []

        for (let i = min; i < max; i++) {
            try {
                console.log(data[i])
                rows.push(`<token-card address="${data[i].contract}"></token-card>`)
            }catch (e) {}
        }

        return rows
    }
}

Stateful.define("tokens-list", TokensList)