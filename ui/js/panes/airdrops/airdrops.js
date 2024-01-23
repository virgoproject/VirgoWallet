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

            return {
                stats: userStats,
                activeAirdrops
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

        return `
            <section-header title="Airdrops"></section-header>
            <div id="content">
                <airdrops-header participations="${data.stats[0].length}" wins="${data.stats[1].length}" withdraw="${data.stats[2].length}"></airdrops-header>
                <p class="title">Active airdrops</p>
                ${rows}
            </div>
        `;
    }

    style() {
        return `
            #content {
                padding: 1em 2em;
            }
            
            .title {
                margin-top: 1em;
                font-size: 1.25em;
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
        `;
    }

}

Stateful.define("airdrops-pane", AirdropsPane)
