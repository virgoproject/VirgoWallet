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
                    <p class="value">${participations}</p>
                    <p class="title">participations</p>
                </div>
                <div class="col-6 text-center">
                    <p class="value">${wins}</p>
                    <p class="title">wins</p>
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
                background: var(--whiteBackground);
                padding: 0.5em;
                border-radius: 0.5em;
            }
            
            .value {
                font-size: 1.25em;
            }
            
            .title {
                color: rgba(0, 0, 0, 0.6)
            }
            
        `;
    }

}

Stateful.define("airdrops-header", AirdropsHeader)
