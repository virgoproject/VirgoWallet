class WalletHome extends StatefulElement {
    render() {

        return `
            <home-header></home-header>
            <home-main-balance></home-main-balance>
            <home-banners></home-banners>
            <home-assets></home-assets>
        `;
    }

}

Stateful.define("wallet-home", WalletHome)