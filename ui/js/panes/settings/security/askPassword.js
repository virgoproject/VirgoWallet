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
            _this.remove()
        })

        const onKeyDown = this.registerFunction(e => {
            if(e.which != 13) return
            const target = _this.querySelector("#submit")
            if(target.disabled) return
            target.onclick()
        })

        let button = `<button class="button w-100" id="submit" onclick="${onClick}" disabled>${Stateful.t("askPasswordConfirmBtn")}</button>`

        if(loading){
            button = `<button class="button w-100" id="submit" disabled><i class="fas fa-spinner fa-pulse"></i></button>`
        }

        let label = `<p class="label text-left mb-1 text-sm">${Stateful.t("askPasswordLabel")}</p>`

        if(error) label = `<p class="label text-left mb-1 text-sm text-red-400">${Stateful.t("askPasswordErrorLabel")}</p>`

        const eyeClick = this.registerFunction(e => {
            if(e.currentTarget.checked){
                e.currentTarget.checked = false
                e.currentTarget.innerHTML = `<i class="fa-regular fa-eye"></i>`
                _this.querySelector("#"+e.currentTarget.getAttribute("data-target")).type = "password"
            }else{
                e.currentTarget.checked = true
                e.currentTarget.innerHTML = `<i class="fa-regular fa-eye-slash"></i>`
                _this.querySelector("#"+e.currentTarget.getAttribute("data-target")).type = "text"
            }
        })

        return `
            <bottom-popup onclose="${onClose}">
                <section-header title="${Stateful.t("askPasswordTitle")}" no-padding></section-header>
                <div class="mb-4 mt-3">
                    ${label}
                    <div class="btnInputWrapper">
                    <input type="password" id="password" class="input"
                           placeholder="${Stateful.t("askPasswordInputPlaceholder")}" data-inputTarget="#submit" oninput="${onInput}" onfocus="${onFocus}" ${loading? "disabled" : ""} onkeydown="${onKeyDown}">
                        <div class="inputBtn text-xl" onclick="${eyeClick}" id="eye" data-target="password">
                            <i class="fa-regular fa-eye"></i>
                        </div>
                    </div>
                </div>
                ${button}
            </bottom-popup>
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
