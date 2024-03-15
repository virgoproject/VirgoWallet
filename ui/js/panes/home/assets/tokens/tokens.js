class HomeTokens extends StatefulElement {

    async render() {

        const {data, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()

            const selectedAddress = baseInfos.addresses[baseInfos.selectedAddress]

            const tokens = []

            for(const contractAddr of Object.keys(selectedAddress.balances)) {
                const balance = selectedAddress.balances[contractAddr]

                if (!balance.tracked) continue;

                let sortVal
                if(contractAddr == baseInfos.wallets[baseInfos.selectedWallet].wallet.ticker)
                    sortVal = 9999999999999999999
                else
                    sortVal = balance.price == 0 ? balance.balance/10**balance.decimals*2 : balance.price*balance.balance/10**balance.decimals

                tokens.push({
                        contractAddr,
                        sortVal
                    })
            }

            tokens.sort((a, b) => b.sortVal - a.sortVal);

            const res = []

            for(const token of tokens){
                res.push(token.contractAddr)
            }

            return res
        }, 1000)

        if(loading) return ""

        const rows = []

        for(const address of data){
            rows.push(`<home-token address="${address}"></home-token>`)
        }

        return `
            ${rows}
        `;
    }

}

Stateful.define("home-tokens", HomeTokens)
