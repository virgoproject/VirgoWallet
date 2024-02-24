class TokenDetailsFull extends StatefulElement {

    async render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            return await getTokenDetails(_this.getAttribute("address"))
        })

        return `
            
        `;
    }

}

Stateful.define("token-details-full", TokenDetailsFull)
