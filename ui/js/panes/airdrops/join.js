class JoinAirdrop extends StatefulElement {

    render() {
        if(this.conditions == undefined) return

        const [step, setStep] = this.useState("step", 0)

        let content;

        if(step == 0) content = this.step1(setStep)
        if(step == 1) content = this.step2()

        return `
            <bottom-popup>
                ${content}
            </bottom-popup>
        `;
    }

    step1(setStep) {
        const conditions = JSON.parse(this.conditions)

        const rows = []

        const onClick = this.registerFunction(() => {
            setStep(1)
        })

        for(const accName in conditions){
            rows.push(`<div class="row rule">
                <div class="col-2"><i class="fa-regular fa-user-plus"></i></div>
                <div class="col-8 text-center p-0 align-self-center"><p>Follow <a href="${conditions[accName]}" target="_blank">${accName}</a> on Twitter</p></div>
                <div class="col-2"></div>
            </div>`)

        }

        rows.push(`<div class="row rule">
                <div class="col-2"><i class="fa-regular fa-retweet"></i></div>
                <div class="col-8 text-center p-0 align-self-center"><p>RT the airdrop tweet</p></div>
                <div class="col-2"></div>
            </div>`)

        rows.push(`<div class="row rule">
                <div class="col-2 align-self-center justify-content-center"><i class="fa-regular fa-check"></i></div>
                <div class="col-8 text-center align-self-center"><p>Agree with our <a href="https://www.virgo.net/terms-and-conditions" target="_blank">terms and conditions</a></p></div>
                <div class="col-2"></div>
            </div>`)

        return `
            <p class="text-center" id="title">Participation rules</p>
            <div>${rows}</div>
            <button class="button w-100 mt-3" onclick="${onClick}">I agree, continue</button>
        `
    }

    step2(){
        const _this = this

        const [loading, setLoading] = this.useState("loading", false)

        const onClick = this.registerFunction(() => {
            const val = _this.querySelector("#input").value

            setLoading(true)
            getBaseInfos().then(function (infos) {
                const address = infos.addresses[0].address

                setAirdropJoined(address,_this.airdropId).then(function (infos) {

                    if(infos){

                        let userInfos = {
                            airdropID : _this.airdropId,
                            address,
                            username: val
                        }
                        fetch('https://airdrops.virgo.net:2053/api/airdropsetplay',{
                            method : "POST",
                            body : JSON.stringify(userInfos),
                            headers: {'Content-Type': 'application/json'}
                        }).then(res => {
                            setTimeout(() => {
                                try {
                                    document.querySelector("airdrops-pane").remove()
                                }catch (e){}
                                const elem = document.createElement("airdrops-pane")
                                document.querySelector("#airdropPane").appendChild(elem)
                                notyf.success("Airdrop successfully joined!")
                                _this.remove()
                            }, 1000)
                        })
                    }
                })
            })
        })

        const onInput = this.registerFunction(e => {
            this.querySelector("#join").disabled = !e.target.value.replace("@", "").match("^[A-Za-z0-9_]{4,15}$")
        })

        let button = `<button class="button w-100 mt-3" disabled id="join" onclick="${onClick}">Join airdrop</button>`

        if(loading) button = `<button class="button w-100 mt-3" id="join" disabled><i class="fas fa-spinner fa-pulse"></i></button>`

        return `
            <p class="text-center" id="title">Participate</p>
            <p class="label">Enter your <span>Twitter Username</span> to <br>verify your eligibility</p>
            <input type="text" class="input col-12" placeholder="Twitter Username" oninput="${onInput}" id="input">
            ${button}
        `
    }

    style() {
        return `
            #title {
                font-size: 1.25em;
            }
            
            .rule {
                background-color: var(--whiteBackground);
                padding: 0.5em;
                margin: 1em 0!important;
                border-radius: 0.5em;
            }
            
            .rule p {
                margin-bottom: 0 !important;
            }
            
            .rule i {
                color: var(--mainColor);
                background: white;
                height: 2.5em;
                width: 2.5em;
                line-height: 2.5em;
                text-align: center;
                border-radius: 0.5em;
            }
            
            .rule a {
                color: var(--mainColor);
            }
            
            .label {
                font-size: 0.875em;
                margin-bottom: 0.25em;
            }
            
            .label span {
                color: var(--mainColor);
            }
        `;
    }

}

Stateful.define("join-airdrop", JoinAirdrop)
