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
                <div id="loading">
                    <i class="fas fa-spinner fa-pulse"></i>
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
                <div id="list">
                    ${rows.length > 0 ? '<p class="title">Active airdrops</p>' : ''}
                    ${rows}
                    <p class="title">Ended airdrops</p>
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
            
            .title {
                margin-top: 0.5em;
                font-size: 1em;
                margin-bottom: 0.5em;
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
                padding: 0em 2em 15em;
            }
            
            #headerWrapper {
                padding: 1em 2em;
            }
        `;
    }

}

Stateful.define("airdrops-pane", AirdropsPane)
