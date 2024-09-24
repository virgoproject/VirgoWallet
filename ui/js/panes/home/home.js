class WalletHome extends StatefulElement {
    render() {

        const {data, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()
            if(baseInfos.locked) location.reload()
            return baseInfos
        }, 10000)

        if(loading){
            return `<wallet-loading simple="true"></wallet-loading>`
        }

        const resetAssets = this.registerFunction(() => {
            this.querySelector("#assets").forceUpdate()
            this.querySelector("#mainBalance").runIntervals()
        })

        return `
            <div id="wrapper">
                <home-header resetassets="${resetAssets}"></home-header>
                <div id="scroll">
                    <home-main-balance id="mainBalance"></home-main-balance>
                    <home-banners></home-banners>
                    <home-assets id="assets"></home-assets>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            #scroll {
                overflow: auto;
                padding-bottom: 15em;
            }
        `;
    }

}

Stateful.define("wallet-home", WalletHome)
