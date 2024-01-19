class ManageNetworks extends StatefulElement {

    constructor() {
        super();
    }

    eventHandlers() {
        this.querySelector("#addBtn").onclick = () => {
            const elem = document.createElement("settings-add-network")
            document.body.appendChild(elem)
        }
    }

    render() {
        const _this = this

        const {data: data, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()

            return {
                wallets: baseInfos.wallets,
                selectedWallet: baseInfos.selectedWallet
            }
        }, 1000)

        if(loading) {
            return
        }

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const rows = []

        let i = 0
        for(const network of data.wallets){
            rows.push(`<settings-network-row
                            name="${network.wallet.name}"
                            ticker="${network.wallet.ticker}"
                            tracked="${network.wallet.tracked}"
                            chainID="${network.wallet.chainID}"
                            index="${i}"
                            current="${i == data.selectedWallet}"
                            class="d-block my-2"
                        ></settings-network-row>`)
            i++
        }

        return `
            <div class="fullpageSection">
                <section-header title="Manage Networks" backfunc="${back}"></section-header>
                <div id="content">
                    <div id="list">
                        ${rows}    
                    </div>
                </div>
                <div class="row" id="addRow">
                    <button class="button tab" id="addBtn">Add custom network</button>
                </div>
            </div>
        `
    }

    style() {
        return `
            #content {
                padding: 0em 2em;
                overflow: auto;
                height: 100%;
            }
        
            #list {
                padding-bottom: 10em;
            }
            
            #addRow {
                background: white;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 1em 2em;
            }
            
        `;
    }

}

Stateful.define("networks-settings", ManageNetworks)
