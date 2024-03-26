class SettingsImportMnemonic extends StatefulElement {

    constructor() {
        super();
    }

    render() {
        const [mnemonic, setMnemonic] = this.useState("mnemonic", false)

        if(mnemonic && !this.bypassWarning){
            return this.confirm(mnemonic, setMnemonic)
        }

        return this.form(mnemonic, setMnemonic)
    }

    form(mnemonic, setMnemonic){
        const _this = this

        const [error, setError] = this.useState("error", false)

        const back = this.registerFunction(() => {
            if(mnemonic) return
            _this.remove()
        })

        const onInput = this.registerFunction(() => {
            _this.querySelector("#confirm").disabled = _this.querySelector("#input").value.split(" ").length < 12
        })

        const onClick = this.registerFunction(e => {
            e.target.disabled = true
            isMnemonicValid(_this.querySelector("#input").value).then(res => {
                if(!res){
                    setError(true)
                    return
                }

                if(_this.bypassWarning){
                    _this.restoreMnemonic(_this.querySelector("#input").value)
                }

                setMnemonic(_this.querySelector("#input").value)
            })
        })

        const onFocus = this.registerFunction(() => {
            if(error) setError(false)
        })

        let label = `<p class="label text-left text-sm">Seed phrase</p>`

        if(error) label = `<p class="label text-left text-sm" id="error">Invalid seed phrase</p>`

        let button = `<button class="button w-100" id="confirm" disabled onclick="${onClick}">Recover wallet</button>`
        if(mnemonic) button = `<button class="button w-100" id="confirm" disabled><i class="fa-solid fa-spinner-third fa-spin"></i></button>`

        const pasteClick = this.registerFunction(async () => {
            const input = _this.querySelector("#input")

            try {
                const text = await navigator.clipboard.readText()
                input.value = text
                input.onfocus()
                input.oninput()
                console.log("pasted")
            } catch (error) {
                console.log(error)
                input.focus()
                document.execCommand('paste')
                console.log("pasted")
            }
        })

        return `
            <div class="fullpageSection">
                <section-header title="Recover a wallet" backfunc="${back}"></section-header>
                <div id="content" class="text-center">
                    ${label}
                    <textarea rows="4" class="input w-100 ${error ? 'is-invalid' : ''}" onfocus="${onFocus}" id="input" oninput="${onInput}"></textarea>
                    <p id="pasteBtn" onclick="${pasteClick}">Paste</p>
                    <p class="mt-2 text-gray-400 text-sm">Generally a 12 words (sometimes 18, 24) sentence without special characters.</p>
                </div>
                <div id="nextWrapper">
                    ${button}
                </div>
            </div>
        `;
    }

    confirm(mnemonic, setMnemonic){
        const _this = this

        const [loading, setLoading] = this.useState("loading", false)

        const back = this.registerFunction(() => {
            if(loading) return
            setMnemonic(false)
        })

        const onClick = this.registerFunction(() => {
            _this.restoreMnemonic(mnemonic)
            setLoading(true)
        })

        let button = `<button class="button w-100" id="confirm" onclick="${onClick}">I understand, proceed</button>`

        if(loading) button = `<button class="button w-100" id="confirm" disabled><i class="fa-solid fa-spinner-third fa-spin"></i></button>`

        return `
            <div class="fullpageSection">
                <section-header title="Recover a wallet" backfunc="${back}"></section-header>
                <div id="content" class="text-center">
                    <div class="text-center"><i class="fa-solid fa-circle-exclamation text-red-400 text-7xl"></i></div>
                    <h3 class="m-3">Warning</h3>
                    <p>Restoring this wallet will erase your current wallet, be sure to have
                        saved your seed phrase!</p>
                </div>
                <div id="nextWrapper">
                    ${button}
                </div>
            </div>
        `

    }

    restoreMnemonic(mnemonic){
        const _this = this

        restoreFromMnemonic(mnemonic).then(function(res) {
            setTimeout(function () {
                setPassword(_this.password).then(() => {
                    try {
                        document.querySelector("wallet-home").remove()
                    }catch (e) {}

                    const home = document.createElement("wallet-home")
                    document.getElementById("resumePane").innerHTML = ""
                    document.getElementById("resumePane").appendChild(home)
                    document.getElementById("mainPane").style.display = "block"

                    notyf.success("Wallet recovered!")

                    try {
                        document.querySelector("unlock-wallet").remove()
                    }catch (e) {}

                    try {
                        document.querySelector("settings-menu").remove()
                    }catch (e) {}

                    try {
                        document.querySelector("security-settings").remove()
                    }catch (e) {}

                    try {
                        document.querySelector("wallet-setup").remove()
                    }catch (e) {}

                    try {
                        document.querySelector("account-selector").remove()
                    }catch (e) {}

                    _this.remove()
                })
            }, 2000)
        })
    }

    style() {
        return `
            .fullpageSection {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
        
            #content {
                padding: 1em;
            }
        
            #nextWrapper {
                padding: 1em;
            }
            
            .label {
                font-size: 0.85em;
            }
            
            textarea {
                resize: none !important;
            }
            
            #error {
                color: #dc3545;
            }
            
            img {
                width: 100%;
                margin-bottom: 1em;
                margin-top: 2em;
            }
            
            #pasteBtn {
                text-align: right;
                position: relative;
                top: -2.5em;
                color: var(--main-700);
                font-weight: 600;
                margin-bottom: 0;
                width: fit-content;
                float: right;
                right: 1em;
                cursor: pointer;
                user-select: none;
            }
        `;
    }

}

Stateful.define("settings-import-mnemonic", SettingsImportMnemonic)
