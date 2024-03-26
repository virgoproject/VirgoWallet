class AirdropsPane extends StatefulElement {

    render() {

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()

            const req1 = await fetch('https://airdrops.virgo.net:2053/api/user/stats',{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({address: infos.addresses[0].address})
            })
            const userStats = await req1.json()

            const req2 = await fetch('https://airdrops.virgo.net:2053/api/activedrops', {
                method : 'GET',
                headers: {'Content-Type': 'application/json'}
            })
            const activeAirdrops = await req2.json()

            const req3 = await fetch('https://airdrops.virgo.net:2053/api/endedairdrop', {
                method : 'GET',
                headers: {'Content-Type': 'application/json'}
            })
            const endedAirdrops = await req3.json()

            return {
                stats: userStats,
                activeAirdrops,
                endedAirdrops
            }
        })

        if(loading){
            return `
            <section-header title="Airdrops"></section-header>
            <div id="content">
                <div id="headerWrapper">
                    <div id="headerShimmer" class="shimmerBG row"></div>
                </div>
                <div class="px-3">
                    <div class="airdropShimmer mt-3">
                        <div class="d-flex align-items-center">
                            <div class="airdropShimmerLogo shimmerBG"></div>
                            <div class="airdropNameShimmer shimmerBG"></div>
                        </div>
                        <div class="airdropAmountShimmer shimmerBG"></div>
                    </div>
                    <div class="airdropShimmer mt-3">
                        <div class="d-flex align-items-center">
                            <div class="airdropShimmerLogo shimmerBG"></div>
                            <div class="airdropNameShimmer shimmerBG"></div>
                        </div>
                        <div class="airdropAmountShimmer shimmerBG"></div>
                    </div>
                    <div class="airdropShimmer mt-3">
                        <div class="d-flex align-items-center">
                            <div class="airdropShimmerLogo shimmerBG"></div>
                            <div class="airdropNameShimmer shimmerBG"></div>
                        </div>
                        <div class="airdropAmountShimmer shimmerBG"></div>
                    </div>
                    <div class="airdropShimmer mt-3">
                        <div class="d-flex align-items-center">
                            <div class="airdropShimmerLogo shimmerBG"></div>
                            <div class="airdropNameShimmer shimmerBG"></div>
                        </div>
                        <div class="airdropAmountShimmer shimmerBG"></div>
                    </div>
                </div>
            </div>
            `
        }

        const rows = []

        for(const airdrop of data.activeAirdrops){
            rows.push(`<airdrop-card data='${JSON.stringify(airdrop)}'></airdrop-card>`)
        }

        const endedRows = []

        for(const airdrop of data.endedAirdrops){
            endedRows.push(`<airdrop-card data='${JSON.stringify(airdrop)}'></airdrop-card>`)
        }

        return `
            <section-header title="Airdrops"></section-header>
            <div id="content">
                <div id="headerWrapper">
                    <airdrops-header participations="${data.stats[0].length}" wins="${data.stats[1].length}" withdraw="${data.stats[2].length}"></airdrops-header>
                </div>
                <div id="list" class="px-3">
                    ${rows.length > 0 ? '<p class="label mt-3">Active airdrops</p>' : ''}
                    ${rows}
                    <p class="label mt-3">Ended airdrops</p>
                    ${endedRows} 
                </div>
            </div>
        `;
    }

    style() {
        return `
            #content {
                height: 100%;
            }
            
            #loading {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25em;
            }
            
            #list {
                height: 100%;
                overflow: auto;
                padding-bottom: 15em;
            }
            
            #headerWrapper {
                padding: 1em 2em;
                padding-top: 0;
            }
            
            #headerShimmer {
                height: 65px;
                border-radius: 0.5em;
            }
            
            .airdropShimmer {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .airdropShimmerLogo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
            }
            
            .airdropNameShimmer {
                width: 10ch;
                height: 1em;
                margin-left: 1em;
                border-radius: 0.5em;
            }
            
            .airdropAmountShimmer {
                width: 6ch;
                height: 1em;
                margin-left: 1em;
                border-radius: 0.5em;
            }
        `;
    }

}

Stateful.define("airdrops-pane", AirdropsPane)
