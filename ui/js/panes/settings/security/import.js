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

        return `
            <div class="fullpageSection">
                <section-header title="Recover a wallet" backfunc="${back}"></section-header>
                <div id="content" class="text-center">
                    ${label}
                    <textarea rows="4" class="input w-100 ${error ? 'is-invalid' : ''}" onfocus="${onFocus}"
                              id="input" oninput="${onInput}"></textarea>
                    <p class="mt-2 text-gray-400 text-sm">Generally a 12 words (sometimes 18, 24) sentence without special characters.</p>
                    <div id="nextWrapper">
                        ${button}
                    </div>
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
                    <img src="../images/warning.png">
                    <h3>Warning</h3>
                    <p>Restoring this wallet will erase your current wallet, be sure to have
                        saved your seed phrase!</p>
                    <div id="nextWrapper">
                        ${button}
                    </div>
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
            #content {
                padding: 1em;
            }
        
            #nextWrapper {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
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
        `;
    }

}

Stateful.define("settings-import-mnemonic", SettingsImportMnemonic)
