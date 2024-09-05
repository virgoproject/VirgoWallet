class EditAccount extends StatefulElement {

    async render() {
        const _this = this

        const [view, setView] = this.useState("view", 0)

        const {data, loading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(loading) return ""

        const back = this.registerFunction(() => {
            _this.remove()
        })

        let content;
        if(view == 0) content = this.details(data, setView)
        if(view == 1) content = this.edit(data, setView)
        if(view == 2) content = this.delete(data, setView)

        return `
            <bottom-popup onclose="${back}">
                ${content}
            </bottom-popup>
        `;
    }

    details(data, setView){
        const account = data.addresses[this.accountID]

        const copyAddress = this.registerFunction(() => {
            copyToClipboard(account.address);
            notyf.success(Stateful.t("accountDetailsAddressCopiedNotif"));
        })

        const editClick = this.registerFunction(() => {
            setView(1)
        })

        return `
            <section-header title="${Stateful.t("accountDetailsTitle")}" no-padding></section-header>
            <div class="mt-3">
                <p class="label text-left text-sm" id="addressLabel">${Stateful.t("accountDetailsAddressLabel")}</p>
                <div class="input-copiable" onclick="${copyAddress}">
                    <p class="input">${account.address}</p>
                    <i class="fa-regular fa-copy"></i>
                </div>
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("accountDetailsNameLabel")}</p>
                <input type="text" class="input col-12" disabled value="${account.name}">
            </div>
            <button class="w-100 mt-3 button" onclick="${editClick}">${Stateful.t("accountDetailsEditBtn")}</button>
        `
    }

    edit(data, setView){
        const _this = this

        const account = data.addresses[this.accountID]

        const deleteClick = this.registerFunction(() => {
            setView(2)
        })

        const onBack = this.registerFunction(() => {
            setView(0)
        })

        const validateInputs = this.registerFunction(async () => {
            const name = _this.querySelector("#name")

            _this.querySelector("#confirm").disabled = name.value.trim() == ""
        })

        const saveClick = this.registerFunction(() => {
            changeAccountName(account.address, _this.querySelector("#name").value).then(() => {
                notyf.success(Stateful.t("accountEditUpdatedNotif"))
                _this.resetParent()
                _this.remove()
            })
        })

        return `
            <section-header title="${Stateful.t("accountEditTitle")}" no-padding backfunc="${onBack}"></section-header>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("accountEditNameLabel")}</p>
                <input type="text" class="input col-12" id="name" value="${account.name}" oninput="${validateInputs}">
            </div>
            <div class="mt-3 row">
                <div class="col-6"><button class="w-100 buttonEmpty text-red-600" id="delete" onclick="${deleteClick}" ${data.selectedAddress == this.accountID ? "disabled" : ""}>${Stateful.t("accountEditDeleteBtn")}</button></div>
                <div class="col-6"><button class="w-100 button" id="confirm" onclick="${saveClick}" disabled>${Stateful.t("accountEditSaveBtn")}</button></div>
            </div>
        `
    }

    delete(data, setView){
        const _this = this

        const account = data.addresses[this.accountID]

        const onBack = this.registerFunction(() => {
            setView(1)
        })

        const confirmClick = this.registerFunction(() => {
            deleteAccount(account.address).then(res => {
                if(!res){
                    notyf.error("Error: account doesn't exist")
                    return
                }
                notyf.success(Stateful.t("accountDeletedNotif"))
                _this.resetParent()
                _this.remove()
            })
        })

        return `
            <section-header title="${Stateful.t("accountDeleteTitle")}" no-padding backfunc="${onBack}"></section-header>
            <div class="mt-3 mb-3 text-center">
                <div><i class="fa-solid fa-circle-exclamation text-red-400 text-7xl"></i></div>
                <p class="deleteWarn mt-3 text-gray-700">${Stateful.t("accountDeleteWarnTitle")}</p>
                <p class="deleteWarn text-gray-700">${Stateful.t("accountDeleteWarnSub")}</p>
            </div>
            <div class="mt-4 row">
                <div class="col-6"><button class="w-100 buttonEmpty" onclick="${onBack}">${Stateful.t("accountDeleteCancelBtn")}</button></div>
                <div class="col-6"><button class="w-100 button button-red" onclick="${confirmClick}">${Stateful.t("accountDeleteConfirmBtn")}</button></div>
            </div>
        `
    }

}

Stateful.define("edit-account", EditAccount)
