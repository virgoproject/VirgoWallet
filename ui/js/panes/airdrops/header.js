class AirdropsHeader extends StatefulElement {

    render() {
        return `
            <div class="row" id="stats">
                <div class="col-6 text-center">
                    <p class="value">10</p>
                    <p class="title">participations</p>
                </div>
                <div class="col-6 text-center">
                    <p class="value">2</p>
                    <p class="title">wins</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12 p-0">
                    <button class="button w-100">Claim rewards</button>
                </div>
            </div>
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
