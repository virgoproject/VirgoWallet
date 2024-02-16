class SpeedupTransaction extends StatefulElement {

    render() {
        return `
            <bottom-popup>
                <p class="text-center" id="title">Participate</p>
            </bottom-popup>
        `
    }

    style() {
        return `
            #title {
                font-size: 1.25em;
            }
        `;
    }

}

Stateful.define("speedup-transaction", SpeedupTransaction)
