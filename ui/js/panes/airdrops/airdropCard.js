class AirdropCard extends StatefulElement {

    render() {
        const data = JSON.parse(this.getAttribute("data"))



        return `
        <div class="row">
            <div class="col-2 justify-content-center align-self-center">
                <img src=""/>
            </div>
            <div class="col-8">
                <p id="name"></p>
            </div>
            <div class="col-2">
                
            </div>
        </div>
        `;
    }

}

Stateful.define("airdrop-card", AirdropCard)
