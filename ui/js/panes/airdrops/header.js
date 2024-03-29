class AirdropsHeader extends StatefulElement {

    render() {
        const participations = this.getAttribute("participations")
        const wins = this.getAttribute("wins")
        let toWithdraw = parseInt(this.getAttribute("withdraw"))

        const [claimed, setClaimed] = this.useState("claimed", false)

        const onClick = this.registerFunction(() => {
            getBaseInfos().then(function (infos) {
                fetch('https://airdrops.virgo.net:2053/api/getreward',{
                    method: "POST",
                    body: JSON.stringify({address: infos.addresses[0].address}),
                    headers: {'Content-Type': 'application/json'}
                }).then( res => {
                    setClaimed(true)
                    notyf.success("Successfully claimed! You'll receive your coins in 24-48h!")
                })
            })
        })

        let claimBtn = `<div class="row mt-3">
                <div class="col-12 p-0">
                    <button class="button w-100" onclick="${onClick}">Claim rewards</button>
                </div>
            </div>`

        if(toWithdraw == 0 || claimed) claimBtn = ""


        return `
            <div class="row" id="stats">
                <div class="col-6 text-center">
                    <p class="text-gray-700 text-xl">${participations}</p>
                    <p class="text-gray-400">participations</p>
                </div>
                <div class="col-6 text-center">
                    <p class="text-gray-700 text-xl">${wins}</p>
                    <p class="text-gray-400">wins</p>
                </div>
            </div>
            ${claimBtn}
        `;
    }

    style() {
        return `
            p {
                margin-bottom: 0!important;
            }
            
            #stats {
                background: var(--gray-50);
                padding: 0.5em;
                border-radius: 0.5em;
            }
            
        `;
    }

}

Stateful.define("airdrops-header", AirdropsHeader)
