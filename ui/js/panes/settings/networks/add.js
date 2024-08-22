class AddNetwork extends StatefulElement {

    constructor() {
        super();
    }

    eventHandlers() {
        const _this = this

        const name = this.querySelector("#name");
        const rpc = this.querySelector("#rpc");
        const chainID = this.querySelector("#id");
        const symbol = this.querySelector("#symbol");
        const explorer = this.querySelector("#explorer");
        const button = this.querySelector("#btn");
        const errorText = this.querySelector("#error");

        name.oninput = () => {
            _this.settingsNetworkAddValidate()
        }

        rpc.oninput = () => {
            _this.settingsNetworkAddValidate()
        }

        chainID.oninput = () => {
            _this.settingsNetworkAddValidate()
        }

        symbol.oninput = () => {
            _this.settingsNetworkAddValidate()
        }

        explorer.oninput = () => {
            _this.settingsNetworkAddValidate()
        }

        button.onclick = () => {
            addNetwork(name.value, rpc.value.replace(/\s/g,''), chainID.value.replace(/\s/g,''), symbol.value.replace(/\s/g,''), explorer.value.replace(/\s/g,'')).then(res => {
                if(res.status == 0){
                    errorText.style.display = "block"
                    errorText.innerHTML = Stateful.t("networkAddCantConnectErr")
                    rpc.classList.add("is-invalid")
                }

                if(res.status == 1){
                    errorText.style.display = "block"
                    chainID.classList.add("is-invalid")
                    errorText.innerHTML = Stateful.t("networkAddInvalidNetId")
                }

                if(res.status == 2){
                    _this.remove()
                    notyf.success(Stateful.t("networkAddSuccessNotif") + name.value.replace(/\s/g,'') + "!")
                }

                enableLoadBtn($(button))
            })
        }
    }

    render() {
        const _this = this

        const [loading, setLoading] = this.useState("loading", false)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        let addBtn = `
            <button class="button w-100 mt-4" disabled="disabled" id="btn">${Stateful.t("networkAddNextBtn")}</button>
        `

        if(loading){
            addBtn = `
            <button class="button w-100 mt-4" disabled="disabled">
                <i class="fas fa-spinner fa-pulse"></i>
            </button>
            `
        }

        return `
            <div class="fullpageSection">
                <section-header title="${Stateful.t("networkAddTitle")}" backfunc="${back}"></section-header>
                <div id="content">
                    <div class="mt-3">
                        <p class="label text-left">${Stateful.t("networkAddNameLabel")}</p>
                        <input type="text" class="input col-12" placeholder="Ethereum" id="name">
                    </div>
                    <div class="mt-3">
                        <p class="label text-left">${Stateful.t("networkAddUrlLabel")}</p>
                        <input type="text" class="input col-12" placeholder="https://mysuperrpc.com" id="rpc">
                    </div>
                    <div class="mt-3">
                        <p class="label text-left">${Stateful.t("networkAddChainIdLabel")}</p>
                        <input type="number" class="input col-12" placeholder="1" id="id">
                    </div>
                    <div class="mt-3">
                        <p class="label text-left">${Stateful.t("networkAddSymbolLabel")}</p>
                        <input type="text" class="input col-12" placeholder="ETH" id="symbol">
                    </div>
                    <div class="mt-3">
                        <p class="label text-left">${Stateful.t("networkAddBlockExplorerLabel")}</p>
                        <input type="text" class="input col-12" placeholder="https://etherscan.io" id="explorer">
                    </div>
                    ${addBtn}
                    <p class="text-danger mt-2 text-center" style="display: none" id="error"></p>
                </div>
            </div>
        `

    }

    style() {
        return `
            #content {
                padding: 0em 1em;
                overflow: auto;
                height: 100%;
                padding-bottom: 5em;
            }
            
            #error {
                font-size: 0.8em;
            }
        `;
    }

    settingsNetworkAddValidate(){

        const name = this.querySelector("#name");
        const rpc = this.querySelector("#rpc");
        const chainID = this.querySelector("#id");
        const symbol = this.querySelector("#symbol");
        const explorer = this.querySelector("#explorer");
        const button = this.querySelector("#btn");
        const errorText = this.querySelector("#error");

        let err = false

        if(name.value.length == 0)
            err = true

        if(name.value.length > 12){
            name.classList.add("is-invalid")
            err = true
        }else{
            name.classList.remove("is-invalid")
        }

        if(rpc.value.replace(/\s/g,'') == "")
            err = true

        if(rpc.value.replace(/\s/g,'') != "" && !Utils.isValidUrl(rpc.value.replace(/\s/g,''))){
            rpc.classList.add("is-invalid")
            err = true
        }else{
            rpc.classList.remove("is-invalid")
        }

        if(chainID.value.replace(/\s/g,'') == "")
            err = true

        if(chainID.value.replace(/\s/g,'') != "" && chainID.value.replace(/\s/g,'') >>> 0 !== parseFloat(chainID.value.replace(/\s/g,''))){
            chainID.classList.add("is-invalid")
            err = true
        }else{
            chainID.classList.remove("is-invalid")
        }

        if(symbol.value.length == 0)
            err = true

        if(symbol.value.length > 8){
            symbol.classList.add("is-invalid")
            err = true
        }else{
            symbol.classList.remove("is-invalid")
        }

        if(explorer.value.replace(/\s/g,'') != "" && !Utils.isValidUrl(explorer.value.replace(/\s/g,''))){
            explorer.classList.add("is-invalid")
            err = true
        }else{
            explorer.classList.remove("is-invalid")
        }

        button.disabled = err
        errorText.style.display = "none"
    }

}

Stateful.define("settings-add-network", AddNetwork)
