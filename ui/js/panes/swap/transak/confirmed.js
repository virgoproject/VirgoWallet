class TransakConfirmed extends StatefulElement {

    async render() {
        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="${Stateful.t("transakDoneTitle")}" backfunc="${back}"></section-header>
                    <div id="content" class="px-3">
                        <img src="../images/done.gif" class="w-75">
                        <p class="text-xl text-gray-700">${Stateful.t("transakDoneTitle2")}</p>
                        <p class="mt-3 text-gray-400">${Stateful.t("transakDoneSub1")}<br>${Stateful.t("transakDoneSub2")}</p>
                    </div>
                    <div class="p-3">
                         <button class="button w-100" onclick="${back}">${Stateful.t("transakDoneCloseBtn")}</button>
                    </div>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            #content {
                flex-grow: 1;
                min-height: 0;
                text-align: center;
            }
        `;
    }

}

Stateful.define("transak-confirmed", TransakConfirmed)
