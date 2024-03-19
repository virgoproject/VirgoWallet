class SettingsNewPassword extends StatefulElement {

    constructor() {
        super();
    }

    render() {

        const _this = this

        const [show, setShow] = this.useState("show", false)

        if(!this.bypassShow && !show && !this.import){
            isEncrypted().then(res => {
                if(res){
                    setShow(true)
                    return
                }

                const elem = document.createElement("settings-backup-seed")
                elem.forwardToNewPassword = true
                if(_this.setup) elem.setup = true
                document.body.appendChild(elem)

                _this.remove()
            })
            return
        }

        const [error, setError] = this.useState("error", false)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onInput = this.registerFunction(() => {
            _this.querySelector("#confirm").disabled = _this.querySelector("#input1").value.length < 8 || _this.querySelector("#input2").value.length < 8 || !_this.querySelector("#warn1").checked || !_this.querySelector("#warn2").checked
        })

        const onClick = this.registerFunction(() => {
            const input1 = _this.querySelector("#input1")
            const input2 = _this.querySelector("#input2")

            if(input1.value != input2.value){
                setError(true)
                return
            }

            if(_this.import){
                const elem = document.createElement("settings-import-mnemonic")
                elem.password = input1.value
                if(_this.bypassWarning) elem.bypassWarning = true
                document.body.appendChild(elem)
                _this.remove()
                return
            }

            setPassword(input1.value).then(() => {
                notyf.success("Password set!")
                if(_this.setup){
                    try {
                        document.querySelector("wallet-home").remove()
                    }catch (e) {}

                    const home = document.createElement("wallet-home")
                    document.getElementById("resumePane").innerHTML = ""
                    document.getElementById("resumePane").appendChild(home)
                    document.getElementById("mainPane").style.display = "block"
                }
                _this.remove()
            })

        })

        const onFocus = this.registerFunction(() => {
            if(error) setError(false)
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Setup your password" backfunc="${back}"></section-header>
                    <div id="content" class="px-3">
                        <p class="text-gray-400 text-center mt-3">This password will unlock your wallet only on this service</p>
                        <div>
                            <div class="mt-3">
                                <p class="label text-left text-sm mb-2">New password</p>
                                <input type="password" class="input col-12 ${error ? 'is-invalid' : ''}" id="input1" oninput="${onInput}" onfocus="${onFocus}">
                            </div>
                            <div class="mt-3">
                                <p class="label text-left text-sm mb-2">Confirm password</p>
                                <input type="password" class="input col-12 ${error ? 'is-invalid' : ''}" id="input2" oninput="${onInput}" onfocus="${onFocus}">
                                <p class="label text-left mt-2 text-sm">Must be at least 8 characters long</p>
                            </div>
                            ${error ? "<div class='mt-3 text-center'><p class='text-danger'>Passwords don't match</p></div>" : ""}
                        </div>
                        <div>
                            <div class="form-check">
                                  <input class="form-check-input" type="checkbox" value="" id="warn1" onchange="${onInput}">
                                  <label class="form-check-label text-gray-700" for="flexCheckDefault">
                                    I understand that Virgo cannot recover this password for me.
                                  </label>
                            </div>
                            <div class="form-check mt-3">
                                  <input class="form-check-input" type="checkbox" value="" id="warn2" onchange="${onInput}">
                                  <label class="form-check-label text-gray-700" for="flexCheckDefault">
                                    I have read and accept the <span id="tos">product terms of service.</span>
                                  </label>
                            </div>
                            <div class="py-3 mt-3">
                                <button class="button w-100" id="confirm" disabled onclick="${onClick}">Confirm</button>
                            </div>
                        </div>
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
                height: 100%;
            }
        
            #content {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
            }
            
            #tos {
                color: var(--main-700);
                cursor: pointer;
            }
            
            label {
                font-weight: 600;
            }
        `;
    }

}

Stateful.define("settings-new-password", SettingsNewPassword)
