class ManageNetworks extends StatefulElement {

    constructor() {
        super();
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
                padding-bottom: 5em;
            }
            
        `;
    }

}

Stateful.define("networks-settings", ManageNetworks)
