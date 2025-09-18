class EditNetwork extends StatefulElement {

    async render() {
        const _this = this

        const [view, setView] = this.useState("view", "edit")

        const {data, loading} = this.useFunction(async () => {
            const baseInfos = await getBaseInfos()
            return baseInfos.wallets[_this.index].wallet
        })

        if(loading) return ""

        const back = this.registerFunction(() => {
            _this.remove()
        })

        let content
        if(view == "edit") content = this.editView(data, setView)
        if(view == "delete") content = this.deleteView(data, setView)

        return `
            <bottom-popup onclose="${back}">
                ${content}
            </bottom-popup>
        `;
    }

    editView(data, setView){
        const _this = this

        const validateInputs = this.registerFunction(async () => {
            const name = _this.querySelector("#name")
            const symbol = _this.querySelector("#symbol")

            let disabled = false
            if(name.value.trim() == "") disabled = true
            if(symbol.value.trim() == "") disabled = true

            _this.querySelector("#confirm").disabled = disabled
        })

        const deleteClick = this.registerFunction(() => {
            setView("delete")
        })

        let buttons

        if(data.official){
            buttons = `<div class="mt-3 row">
                            <div class="col-12"><button class="w-100 button" id="confirm" disabled>${Stateful.t("networkEditSaveBtn")}</button></div>
                       </div>`
        }else{
            buttons = `<div class="mt-3 row">
                            <div class="col-6"><button class="w-100 buttonEmpty text-red-600" id="delete" onclick="${deleteClick}">${Stateful.t("networkEditDeleteBtn")}</button></div>
                            <div class="col-6"><button class="w-100 button" id="confirm" disabled>${Stateful.t("networkEditSaveBtn")}</button></div>
                       </div>`
        }

        return `
            <section-header title="${Stateful.t("networkEditTitle")}" no-padding></section-header>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("networkEditNameLabel")}</p>
                <input type="text" class="input col-12" id="name" value="${data.name}" oninput="${validateInputs}">
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("networkEditSymbolLabel")}</p>
                <input type="text" class="input col-12" id="symbol" value="${data.ticker}" oninput="${validateInputs}">
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("networkEditRPCLabel")}</p>
                <input type="text" class="input col-12" id="rpc" value="${data.RPC}" oninput="${validateInputs}">
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("networkEditExplorerLabel")}</p>
                <input type="text" class="input col-12" id="explorer" value="${data.explorer}" oninput="${validateInputs}">
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("networkEditChainIDLabel")}</p>
                <input type="text" class="input col-12 disabled" value="${data.chainID}" disabled>
            </div>
            ${buttons}
        `
    }

    deleteView(data, setView){

        const backClick = this.registerFunction(() => {
            setView("edit")
        })

        return `
            <section-header title="${Stateful.t("networkDeleteTitle")}" no-padding backfunc="${backClick}"></section-header>
            <div class="mt-3 mb-3 text-center">
                <div><i class="fa-solid fa-circle-exclamation text-red-400 text-7xl"></i></div>
                <p class="deleteWarn mt-3 text-gray-700">${Stateful.t("networkDeleteWarnTitle")}</p>
                <p class="deleteWarn text-gray-700">${Stateful.t("networkDeleteWarnSub")}</p>
            </div>
            <div class="mt-4 row">
                <div class="col-6"><button class="w-100 buttonEmpty" onclick="${backClick}">${Stateful.t("networkDeleteCancelBtn")}</button></div>
                <div class="col-6"><button class="w-100 button button-red">${Stateful.t("networkDeleteConfirmBtn")}</button></div>
            </div>
        `
    }

    editValidate(){

        const name = this.querySelector("#name");
        const rpc = this.querySelector("#rpc");
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

Stateful.define("edit-network", EditNetwork)
