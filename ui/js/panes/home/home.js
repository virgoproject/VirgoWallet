class WalletHome extends StatefulElement {
    render() {

        return `
            <div id="wrapper" class="pt-3">
                <home-header></home-header>
                <div id="scroll">
                    <home-main-balance></home-main-balance>
                    <home-banners></home-banners>
                    
                    <home-assets></home-assets>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            #scroll {
                overflow: auto;
                padding-bottom: 15em;
            }
        `;
    }

}

Stateful.define("wallet-home", WalletHome)