class SettingsNewPassword extends StatefulElement {

    constructor() {
        super();
    }

    render() {

        const _this = this

        const [show, setShow] = this.useState("show", false)

        if(!show){
            isEncrypted().then(res => {
                if(res){
                    setShow(true)
                    return
                }

                const elem = document.createElement("settings-backup-seed")
                elem.forwardToNewPassword = true
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
            _this.querySelector("#confirm").disabled = _this.querySelector("#input1").value.length < 8 || _this.querySelector("#input2").value.length < 8
        })

        const onClick = this.registerFunction(() => {
            const input1 = _this.querySelector("#input1")
            const input2 = _this.querySelector("#input2")

            if(input1.value != input2.value){
                setError(true)
                return
            }

            setPassword(input1.value).then(() => {
                notyf.success("Password changed!")
                _this.remove()
            })

        })

        const onFocus = this.registerFunction(() => {
            if(error) setError(false)
        })

        return `
            <div class="fullpageSection">
                <section-header title="Setup your password" backfunc="${back}"></section-header>
                <div id="content" class="text-center">
                    <div>
                        <p class="label text-left">New password</p>
                        <input type="password" class="input col-12 ${error ? 'is-invalid' : ''}" placeholder="Enter your new password" id="input1" oninput="${onInput}" onfocus="${onFocus}">
                    </div>
                    <div class="mt-3">
                        <p class="label text-left">Repeat password</p>
                        <input type="password" class="input col-12 ${error ? 'is-invalid' : ''}" placeholder="Repeat your new password" id="input2" oninput="${onInput}" onfocus="${onFocus}">
                    </div>
                    ${error ? "<div class='mt-3 text-center'><p class='text-danger'>Passwords don't match</p></div>" : ""}
                    <div id="nextWrapper">
                        <button class="button w-100" id="confirm" disabled onclick="${onClick}">Confirm</button>
                    </div>
                </div>
            </div>
        `;
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
        `;
    }

}

Stateful.define("settings-new-password", SettingsNewPassword)
