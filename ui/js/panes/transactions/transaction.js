class TransactionCard extends StatefulElement {

    render() {
        return `
            <div class="row mt-1" id="wrapper"></div>
        `;
    }

    style() {
        return `
            #wrapper {
                padding: 0.75em 0;
                border-radius: 0.5em;
                transition: all 0.2s ease-in;
                cursor: pointer;
                background: gray;
                height: 300px;
            }
        `;
    }

}

Stateful.define("transaction-card", TransactionCard)