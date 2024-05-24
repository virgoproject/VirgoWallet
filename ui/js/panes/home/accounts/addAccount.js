class AddAccount extends StatefulElement {

    render() {
        const _this = this

        const [menu, setMenu] = this.useState("menu", 0)

        const back = this.registerFunction(() => {
            if(menu != 0){
                setMenu(0)
                return
            }

            _this.remove()
        })

        const popupBack = this.registerFunction(() => {
            _this.remove()
        })

        let content;
        if(menu == 0) content = this.main()
        if(menu == 1) content = this.add()
        if(menu == 2) content = this.import()

        return `
            <bottom-popup onclose="${popupBack}">
                <section-header title="Add an account" no-padding backfunc="${back}"></section-header>
                <div id="content">
                    ${content}
                </div>
            </bottom-popup>
        `;
    }

    main(){
        const _this = this

        const [menu, setMenu] = this.useState("menu", 0)

        const addClick = this.registerFunction(() => {
            setMenu(1)
        })

        const importClick = this.registerFunction(() => {
            setMenu(2)
        })

        return `
            <div class="setupBtn mt-3" onclick="${addClick}">
                <div class="btnIcon">
                    <i class="fa-regular fa-plus"></i>
                </div>
                <div class="btnText ml-2">
                    <p class="btnTitle">Create or restore an account</p>
                    <p class="btnSubtitle text-sm">From your current seed phrase</p>
                </div>
            </div>
            <div class="setupBtn mt-3" onclick="${importClick}">
                <div class="btnIcon">
                    <i class="fa-regular fa-arrow-down"></i>
                </div>
                <div class="btnText ml-2">
                    <p class="btnTitle">Import an account</p>
                    <p class="btnSubtitle text-sm">From a raw private key</p>
                </div>
            </div>
        `

    }

    add(){
        const {data, loading} = this.useFunction(async () => {
            return await getHiddenAccounts()
        })

        if(loading) return ""

        const _this = this

        const addClick = this.registerFunction(() => {
            addAccount().then(() => {
                _this.parent.skipAnimation = true
                _this.parent.runFunctions()
                notyf.success("Added account!")
            })
            _this.remove()
        })

        const rows = []

        const restoreClick = this.registerFunction(e => {
            unhideAccount(e.currentTarget.getAttribute("address")).then(() => {
                _this.parent.skipAnimation = true
                _this.parent.runFunctions()
                notyf.success("Account restored!")
            })
            _this.remove()
        })

        for(const address of data){
            rows.push(`
                <div class="setupBtn mt-3" address="${address.address}" onclick="${restoreClick}">
                    <div class="btnIcon">
                        <i class="fa-regular fa-arrow-turn-left"></i>
                    </div>
                    <div class="btnText ml-2">
                        <p class="btnTitle">${address.name}</p>
                        <p class="btnSubtitle text-sm">${address.address}</p>
                    </div>
                </div>
            `)
        }

        return `
            ${rows}
            <div class="setupBtn mt-3" onclick="${addClick}">
                <div class="btnIcon">
                    <i class="fa-regular fa-plus"></i>
                </div>
                <div class="btnText ml-2">
                    <p class="btnTitle">New account</p>
                    <p class="btnSubtitle text-sm">From your current seed phrase</p>
                </div>
            </div>
        `
    }

    import(){
        const _this = this

        const [value, setValue] = this.useState("value", "")

        const onInput = this.registerFunction(e => {
            _this.querySelector("#confirm").disabled = !(/^0x[0-9a-fA-F]{64}$/.test(e.currentTarget.value))
        })

        const onClick = this.registerFunction(() => {
            const pKey = _this.querySelector("#input").value
            addAccountFromPrivateKey(pKey).then(res => {
                if(res){
                    notyf.success("Account successfully imported!")
                    _this.remove()
                    return
                }

                notyf.error("Account already exists!")
                setValue("")
            })
            setValue(pKey)
        })

        let button;
        if(value != "") button = `<button class="button w-100 mt-3" disabled><i class="fa-solid fa-spinner-third fa-spin"></i></button>`
        else button = `<button class="button w-100 mt-3" id="confirm" disabled onclick="${onClick}">Confirm</button>`

        return `
            <div class="mt-3">
                <p class="label text-left text-sm">Private key</p>
                <input type="text" class="input col-12" placeholder="0x35bcd4af32.." id="input" oninput="${onInput}" value="${value}" ${value != "" ? "disabled" : ""}>
            </div>
            ${button}
        `
    }

    style() {
        return `
            #content {
                flex-grow: 1;
                min-height: 0;
                overflow: auto;
            }
            
            .setupBtn {
                display: flex;
                background: transparent;
                padding: 1em;
                border-radius: 0.5em;
                cursor: pointer;
                transition: all 0.1s ease-in;
                align-items: center;
            }
            
            .setupBtn:hover {
                background: var(--gray-50);
            }
            
            .setupBtn p {
                margin-bottom: 0;
            }
            
            .btnIcon {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                background-color: var(--main-50);
                border-radius: 100%;
                color: var(--main-700);
            }
            
            .btnText {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }
            
            .btnTitle {
                color: var(--gray-700);
            }
            
            .btnSubtitle {
                color: var(--gray-400);
                text-overflow: ellipsis;
                overflow: hidden;
            }
        `;
    }

}

Stateful.define("add-account", AddAccount)
