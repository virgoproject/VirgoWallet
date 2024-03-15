class UnlockWallet extends StatefulElement {

    eventHandlers() {
        const _this = this

        if(this.inputVal != null){
            this.querySelector("#input").value = this.inputVal
        }

        if(this.baseInfos.biometricsEnabled && !this.displayedBiometrics){
            this.displayedBiometrics = true
            reactMessaging.isBiometricsAvailable().then(res => {
                if(res.success){
                    reactMessaging.getPassword().then(res => {
                        if(res.password === undefined) return

                        _this.querySelector("#input").value = res.password
                        _this.querySelector("#btn").onclick()
                    })
                }
            })
        }
    }

    render() {
        const _this = this

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(baseInfosLoading) return ""

        this.baseInfos = baseInfos

        const [loading, setLoading] = this.useState("loading", false)
        const [error, setError] = this.useState("error", false)

        const onFocus = this.registerFunction(() => {
            setError(false)
        })

        const onInput = this.registerFunction(e => {
            this.inputVal = e.currentTarget.value
            _this.querySelector("#btn").disabled = e.currentTarget.value.length <= 6
        })

        const unlockClick = this.registerFunction(() => {
            setLoading(true)
            browser.runtime.sendMessage({command: 'unlockWallet', password: this.inputVal})
                .then(resp => {
                    this.inputVal = ""

                    if(resp){
                        const home = document.createElement("wallet-home")
                        document.getElementById("resumePane").appendChild(home)
                        document.getElementById("mainPane").style.display = "block"
                        this.remove()
                        return
                    }

                    setError(true)
                    setLoading(false)
                })
        })

        const onKeyDown = this.registerFunction(e => {
            if(e.which != 13) return
            const target = _this.querySelector("#btn")
            if(target.disabled) return
            target.onclick()
        })

        const recoverClick = this.registerFunction(() => {
            if(loading) return
            const e = document.createElement("settings-import-mnemonic")
            document.body.appendChild(e)
        })

        let button = `<button class="button w-100" disabled onclick="${unlockClick}" id="btn">Unlock</button>`
        if(loading) button = `<button class="button w-100" disabled id="btn"><i class="fa-solid fa-spinner-third fa-spin"></i></button>`

        return `
            <div class="fullpageSection" id="wrapper">
                <div class="text-center">
                    <img src="../images/logoGradient.png" id="logo">
                    <p id="title" class="mt-3 text-xl">Welcome</p>    
                </div>
                <div class="px-3 w-100">
                    <div>
                        ${error ? `<p class="label text-left text-sm" id="error">Wrong password</p>` : `<p class="label text-left text-sm">Password</p>`}
                        <input type="password" class="input col-12" placeholder="Enter your password" oninput="${onInput}" onfocus="${onFocus}" onkeydown="${onKeyDown}" id="input" ${loading? "disabled" : ""}>
                    </div>
                    <div class="mt-3">
                        ${button}
                    </div>
                </div>
                <div class="text-center">
                    <p id="recoverText">Can't connect? You can restore your<br>current wallet from your seed phrase.</p>
                    <p id="recover" onclick="${recoverClick}">Recover Wallet</p>
                </div>
            </div>
        `;
    }

    style(){
        return `
            #title {
                font-weight: 600;
            }
        
            #wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-around;
                padding-top: 10vh;
            }
        
            #logo {
                width: 33%;
            }
            
            #recoverText {
                color: var(--gray-400);
            }
            
            #recover {
                color: var(--main-700);
                cursor: pointer;
            }
            
            #error {
                color: var(--red-400);
            }
        `
    }

}

Stateful.define("unlock-wallet", UnlockWallet)
