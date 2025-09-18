class ContactDetails extends StatefulElement {

    render() {

        const _this = this

        const [view, setView] = this.useState("view", "details")

        const {data, loading} = this.useFunction(async () => {
            return await getContact(_this.address)
        })

        if(loading) return ""

        let content;
        if(view == "details") content = this.details(data, setView)
        if(view == "edit") content = this.edit(data, setView)
        if(view == "delete") content = this.delete(data, setView)

        return `
            <bottom-popup>
                ${content}
            </bottom-popup>
        `;
    }

    details(data, setView){
        const _this = this

        const editClick = this.registerFunction(() => {
            setView("edit")
        })

        const copyAddress = this.registerFunction(() => {
            copyToClipboard(data.address);
            notyf.success(Stateful.t("contactAddressCopied"));
        })

        const sendClick = this.registerFunction(() => {
            const elem = document.createElement("send-token-amount")
            elem.address = data.address
            document.body.appendChild(elem)
            _this.closeParent()
            _this.remove()
        })

        return `
            <section-header title="Contact details" no-padding></section-header>
            <div class="mt-3">
                <p class="label text-left text-sm" id="addressLabel">${Stateful.t("contactDetailsAddressLabel")}</p>
                <div class="input-copiable" onclick="${copyAddress}">
                    <p class="input">${data.address}</p>
                    <i class="fa-regular fa-copy"></i>
                </div>
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm"></p>
                <input type="text" class="input col-12" disabled value="${data.name}">
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <p class="label text-left text-sm">${Stateful.t("contactDetailsFavoriteLabel")}</p>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" disabled ${data.favorite ? "checked" : ""}>
                </div>
            </div>
            <div class="mt-3 row">
                <div class="col-6"><button class="w-100 buttonEmpty" onclick="${editClick}">${Stateful.t("contactDetailsEditBtn")}</button></div>
                <div class="col-6"><button class="w-100 button" onclick="${sendClick}">${Stateful.t("contactDetailsSendBtn")}</button></div>
            </div>
        `
    }

    edit(data, setView){
        const _this = this

        const deleteClick = this.registerFunction(() => {
            setView("delete")
        })

        const onBack = this.registerFunction(() => {
            setView("details")
        })

        const validateInputs = this.registerFunction(async () => {
            const name = _this.querySelector("#name")

            _this.querySelector("#confirm").disabled = name.value.trim() == ""
        })

        const saveClick = this.registerFunction(e => {
            const name = _this.querySelector("#name")
            const checkbox = _this.querySelector("#checkbox")

            name.disabled = checkbox.disabled = e.currentTarget.disabled = true

            updateContact(data.address, name.value, checkbox.checked).then(() => {
                notyf.success(Stateful.t("contactEditUpdatedNotif"))
                _this.resetParent()
                _this.remove()
            })
        })

        return `
            <section-header title="Edit contact" backfunc="${onBack}" no-padding></section-header>
            <div class="mt-3">
                <p class="label text-left text-sm">${Stateful.t("contactEditNameLabel")}</p>
                <input type="text" class="input col-12" id="name" value="${data.name}" oninput="${validateInputs}">
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <p class="label text-left text-sm">${Stateful.t("contactEditFavoriteLabel")}</p>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="checkbox" ${data.favorite ? "checked" : ""} onchange="${validateInputs}">
                </div>
            </div>
            <div class="mt-3 row">
                <div class="col-6"><button class="w-100 buttonEmpty" id="delete" onclick="${deleteClick}">${Stateful.t("contactEditDeleteBtn")}</button></div>
                <div class="col-6"><button class="w-100 button" id="confirm" onclick="${saveClick}" disabled>${Stateful.t("contactEditSaveBtn")}</button></div>
            </div>
        `
    }

    delete(data, setView){

        const _this = this

        const onBack = this.registerFunction(() => {
            setView("edit")
        })

        const confirmClick = this.registerFunction(() => {
            deleteContact(data.address).then(() => {
                notyf.success(Stateful.t("contactDeletedNotif"))
                _this.resetParent()
                _this.remove()
            })
        })

        return `
            <section-header title="Delete contact" backfunc="${onBack}" no-padding></section-header>
            <div class="mt-3 mb-3">
                <div class="text-center"><i class="fa-solid fa-circle-exclamation text-red-400 text-7xl"></i></div>
                <p class="deleteWarn mt-3">${Stateful.t("contactDeleteWarnTitle")}</p>
                <p class="deleteWarn">${Stateful.t("contactDeleteWarnSub")}</p>
            </div>
            <div class="mt-4 row">
                <div class="col-6"><button class="w-100 buttonEmpty" onclick="${onBack}"></button>${Stateful.t("contactDeleteCancelBtn")}</div>
                <div class="col-6"><button class="w-100 button button-red" onclick="${confirmClick}">${Stateful.t("contactDeleteConfirmBtn")}</button></div>
            </div>
        `
    }

    style() {
        return `
            #delete {
                color: var(--red-600);
            }
            
            .deleteWarn {
                color: var(--gray-700);
                text-align: center;
            }
            
        `;
    }

}

Stateful.define("contact-details", ContactDetails)
