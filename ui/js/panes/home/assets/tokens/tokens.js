class HomeTokens extends StatefulElement {

    async render() {

        const {data, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()

            const selectedAddress = baseInfos.addresses[baseInfos.selectedAddress]

            const tokens = []

            for(const contractAddr of Object.keys(selectedAddress.balances)) {
                const balance = selectedAddress.balances[contractAddr]

                if (!balance.tracked) continue;

                tokens.push(contractAddr)
            }

            return tokens
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