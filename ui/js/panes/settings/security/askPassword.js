class AskPassword extends StatefulElement {

    render() {

        const _this = this

        const [loading, setLoading] = this.useState("loading", false)
        const [error, setError] = this.useState("error", false)

        const onInput = this.registerFunction(e => {
            _this.querySelector("#submit").disabled = e.target.value.length < 8
        })

        const onClick = this.registerFunction(e => {
            const val = _this.querySelector("#password").value

            setLoading(true)
            passwordMatch(val).then(res => {
                if(res){
                    _this.remove()
                    if(_this.callback) _this.callback(true)

                    return
                }
                setError(true)
                setLoading(false)
            })
        })

        const onFocus = this.registerFunction(() => {
            if(error) setError(false)
        })

        const onClose = this.registerFunction(() => {
            if(_this.callback) _this.callback(false)
        })

        const onKeyDown = this.registerFunction(e => {
            if(e.which != 13) return
            const target = _this.querySelector("#submit")
            if(target.disabled) return
            target.onclick()
        })

        let button = `<button class="button w-100" id="submit" onclick="${onClick}" disabled>Confirm</button>`

        if(loading){
            button = `<button class="button w-100" id="submit" disabled><i class="fas fa-spinner fa-pulse"></i></button>`
        }

        let label = `<p class="label text-left mb-1">Enter your password</p>`

        if(error) label = `<p class="label text-left mb-1" id="error">Wrong password</p>`

        return `
            <bottom-popup onclose="${onClose}">
                <p class="text-center" id="title">Authentication required</p>
                <div class="mb-4">
                    ${label}
                    <input type="password" id="password" class="input w-100"
                           placeholder="Password" data-inputTarget="#submit" oninput="${onInput}" onfocus="${onFocus}" ${loading? "disabled" : ""} onkeydown="${onKeyDown}">
                </div>
                ${button}
            </bottom-popup>
        `;
    }

    style() {
        return `
            
            #title {
                font-size: 1.25em;
            }
            
            #password {
                padding: 0.5em 2em 0.5em 0.75em;
                background: #F9F9F9;
                border: none;
                color: #545454;
                border-radius: 0.5em;
            }
            
            .label {
                font-size: 0.85em;
            }
            
            #error {
                color: var(--red-400);
            }
        `;
    }

}

Stateful.define("ask-password", AskPassword)


function askPassword(){
    return new Promise((resolve, reject) => {
        isEncrypted().then(isEncrypted => {
            if(!isEncrypted){
                resolve(true)
                return
            }

            const elem = document.createElement("ask-password")
            elem.callback = res => {
                resolve(res)
            }
            document.body.appendChild(elem)
        })
    });
}
