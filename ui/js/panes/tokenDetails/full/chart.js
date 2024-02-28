class TokenChart extends StatefulElement {

    async render() {

        const _this = this

        const [period, setPeriod] = this.useState("period", "1")

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const res = await fetch("https://api.coingecko.com/api/v3/coins/"+_this.getAttribute("cgid")+"/ohlc?vs_currency="+infos.selectedCurrency+"&days="+period)
            const json = await res.json()

            const line = []

            for(let row of json){
                line.push([
                    row[0],
                    row[1]
                ])
            }

            return line
        })

        if(loading){
            return `loading`
        }

        return ``
    }

}

Stateful.define("token-chart", TokenChart)