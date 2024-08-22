class TokenStatistics extends StatefulElement {

    render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            const baseInfos = await getBaseInfos()
            const res = await fetch("https://api.coingecko.com/api/v3/coins/"+_this.getAttribute("cgid")+"?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false")
            const json = await res.json()
            const tokenInfos = await getTokenDetailsCross(_this.getAttribute("address"), baseInfos.wallets[baseInfos.selectedWallet].wallet.chainID)

            const stats = []

            if(json.coingecko_rank != null){
                stats.push({
                    name: Stateful.t("tokenStatisticsRank"),
                    value: "#"+json.coingecko_rank
                })
            }else{
                stats.push({
                    name: Stateful.t("tokenStatisticsRank"),
                    value: "#-"
                })
            }

            stats.push({
                name: Stateful.t("tokenStatisticsMarketCap"),
                value: "$" + Utils.beautifyAmount(json.market_data.market_cap.usd)
            })

            stats.push({
                name: Stateful.t("tokenStatisticsVolume"),
                value: "$" + Utils.beautifyAmount(json.market_data.total_volume.usd)
            })

            stats.push({
                name: Stateful.t("tokenStatisticsCirculatingSupply"),
                value: Utils.beautifyAmount(json.market_data.circulating_supply) + " " + tokenInfos.ticker
            })

            stats.push({
                name: Stateful.t("tokenStatisticsTotalSupply"),
                value: Utils.beautifyAmount(json.market_data.total_supply) + " " + tokenInfos.ticker
            })

            if(json.market_data.max_supply != null){
                stats.push({
                    name: Stateful.t("tokenStatisticsMaxSupply"),
                    value: Utils.beautifyAmount(json.market_data.max_supply) + " " + tokenInfos.ticker
                })
            }

            stats.push({
                name: Stateful.t("tokenStatisticsATH"),
                value: "$" + Utils.beautifyAmount(json.market_data.ath.usd)
            })

            stats.push({
                name: Stateful.t("tokenStatisticsATL"),
                value: "$" + Utils.beautifyAmount(json.market_data.atl.usd)
            })

            return stats
        })

        if(loading){
            return `
                <div class="mx-3">
                    <p id="title">${Stateful.t("tokenDetailsFullStatisticsTitle")}</p>
                    <div class="stat">
                        <div class="shimmerTitle shimmerBG"></div>
                        <div class="shimmerValue shimmerBG"></div>
                    </div>
                    <div class="stat">
                        <div class="shimmerTitle shimmerBG"></div>
                        <div class="shimmerValue shimmerBG"></div>
                    </div>
                    <div class="stat">
                        <div class="shimmerTitle shimmerBG"></div>
                        <div class="shimmerValue shimmerBG"></div>
                    </div>
                    <div class="stat">
                        <div class="shimmerTitle shimmerBG"></div>
                        <div class="shimmerValue shimmerBG"></div>
                    </div>
                    <div class="stat">
                        <div class="shimmerTitle shimmerBG"></div>
                        <div class="shimmerValue shimmerBG"></div>
                    </div>
                </div>
            `
        }

        const rows = []

        for(const row of data){
            rows.push(`
                <div class="stat">
                    <p class="statTitle">${row.name}</p>
                    <p class="statValue">${row.value}</p>
                </div>
            `)
        }

        return `
            <div class="mx-3">
                <p id="title">${Stateful.t("tokenDetailsFullStatisticsTitle")}</p>
                ${rows}
            </div>
        `
    }

    style() {
        return `
            #title {
                color: var(--gray-700);
                border-bottom: 1px solid var(--gray-100);
                padding-bottom: 0.5em;
                font-weight: 600;
            }
            
            .stat {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1em;
            }
            
            .stat p {
                margin: 0;
            }
            
            .statTitle {
                color: var(--gray-400);
            }
            
            .statValue {
                color: var(--gray-700);
            }
            
            .shimmerTitle {
                height: 1em;
                width: 10ch;
                border-radius: 0.5em;
            }
            
            .shimmerValue {
                height: 1em;
                width: 6ch;
                border-radius: 0.5em;
            }
        `;
    }

}

Stateful.define("token-statistics", TokenStatistics)
