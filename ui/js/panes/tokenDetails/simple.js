class TokenDetailsSimple extends StatefulElement {

    render() {

        const _this = this

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(baseInfosLoading) return ""

        const {data, loading} = this.useFunction(async () => {
            return await getTokenDetailsCross(_this.getAttribute("address"), baseInfos.wallets[baseInfos.selectedWallet].wallet.chainID)
        })

        const backClick = this.registerFunction(() => {
            _this.onclose()
        })

        if(loading){
            return `
                <section-header title="" backfunc="${backClick}"></section-header>
                <div id="loading">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
            `;
        }

        const removeClick = this.registerFunction(() => {
            removeToken(data.contract)
            document.getElementById("bal"+data.contract).remove()
            notyf.success(Stateful.t("tokenDetailsRemovedNotif") + " " + data.name + "!")
            _this.onclose()
        })

        return `
            <section-header title="${data.name}" backfunc="${backClick}"></section-header>
            <div id="wrapper">
                <div class="mt-3">
                    <p class="label text-left text-sm">${Stateful.t("tokenDetailsNameLabel")}</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.name}">
                </div>
                <div class="mt-3">
                    <p class="label text-left text-sm">${Stateful.t("tokenDetailsSymbolLabel")}</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.ticker}">
                </div>
                <div class="mt-3">
                    <p class="label text-left text-sm">${Stateful.t("tokenDetailsDecimalsLabel")}</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.decimals}">
                </div>
                <div class="mt-3">
                    <p class="label text-left text-sm">${Stateful.t("tokenDetailsAddressLabel")}</p>
                    <input type="text" class="input col-12" id="contract" disabled value="${data.contract}">
                </div>
                <button class="button w-100 mt-3" onclick="${removeClick}">${Stateful.t("tokenDetailsRemoveBtn")} ${data.ticker}</button>
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
            
            #loading {
                height: 100%;
                align-items: center;
                display: flex;
                align-self: center;
                font-size: 1.25em;
            }
        `;
    }

}

Stateful.define("token-details-simple", TokenDetailsSimple)
