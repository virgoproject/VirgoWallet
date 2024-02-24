class TokenDetailsSimple extends StatefulElement {

    render() {

        const _this = this

        const {data, loading} = this.useFunction(async () => {
            return await getTokenDetails(_this.getAttribute("address"))
        })

        const backClick = this.registerFunction(() => {
            _this.onclose()
        })

        if(loading){
            return `
                <section-header title="" backfunc="${backClick}"></section-header>
            `;
        }

        const removeClick = this.registerFunction(() => {
            removeToken(data.contract)
            document.getElementById("bal"+data.contract).remove()
            notyf.success("Removed " + data.name + "!")
            _this.onclose()
        })

        return `
            <section-header title="${data.name}" backfunc="${backClick}"></section-header>
            <div id="wrapper">
                <div class="mt-3">
                    <p class="label text-left text-sm">Name</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.name}">
                </div>
                <div class="mt-3">
                    <p class="label text-left text-sm">Symbol</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.ticker}">
                </div>
                <div class="mt-3">
                    <p class="label text-left text-sm">Decimals</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.decimals}">
                </div>
                <div class="mt-3">
                    <p class="label text-left text-sm">Contract address</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.contract}">
                </div>
                <button class="button w-100 mt-3" onclick="${removeClick}">Remove ${data.ticker}</button>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                padding: 0 2em;
            }
            
            .label {
                color: var(--gray-400);
            }
        `;
    }

}

Stateful.define("token-details-simple", TokenDetailsSimple)
