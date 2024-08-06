class ReferralPane extends StatefulElement {

    async render() {

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const req1 = await fetch("http://localhost:2053/api/reward/referral/get/"+infos.addresses[0].address)
            return await req1.json()
        })

        if(loading) return ""

        const [codeLoading, setCodeLoading] = this.useState("loading", false)

        const onInput = this.registerFunction(async e => {
            _this.querySelector("#next").disabled = e.currentTarget.value.length != 5
        })

        const onClick = this.registerFunction(e => {
            const code = _this.querySelector("#codeInput").value
            setCodeLoading(true)
            e.currentTarget.disabled = true
            useReferralCode(code).then(res => {
                setCodeLoading(false)
                _this.runFunctions()
                if(res.status == 1)
                    notyf.success(res.message)
                else
                    notyf.error(res.message)
            })
        })

        let button = `<button id="next" class="button" disabled onclick="${onClick}"><i class="fa-regular fa-arrow-right"></i></button>`

        if(codeLoading) button = `<button id="next" class="button" disabled><i class="fas fa-spinner fa-pulse"></i></button>`

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Referral" backfunc="${back}"></section-header>
                    <div id="content">
                        <div id="list" class="px-3">
                            <div class="row" id="stats">
                                <div class="col-6 text-center">
                                    <p class="text-gray-700 text-xl m-0">${data.invited}</p>
                                    <p class="text-gray-400 m-0">invites</p>
                                </div>
                                <div class="col-6 text-center">
                                    <p class="text-gray-700 text-xl m-0">${data.earned}</p>
                                    <p class="text-gray-400 m-0">XP earned</p>
                                </div>
                            </div>
                            <div id="codeEntryWrapper" class="mt-3 mb-3">
                                <input type="text" placeholder="Apply a friend's code" id="codeInput" oninput="${onInput}" ${codeLoading ? "disabled" : ""}>
                                <div id="codeNextWrapper">
                                    ${button}
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <div>
                                    <p class="text-lg mb-1" id="codeTitle">Invite your friends</p>
                                    <p class="text-gray-400 mb-1">Refer them with your code and both earn bonus XP:</p>
                                    <p id="referralCode" class="text-3xl mb-1">${data.code}</p>
                                    <p class="text-sm text-gray-400">You'll receive your reward once your friend reach silver.</p>
                                </div>
                                <img src="../images/reward/referralRewards.png" id="rewardImg">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            #content {
                height: 100%;
            }
            
            #list {
                height: 100%;
                overflow: auto;
                padding-bottom: 15em;
            }
            
            #codeTitle {
                text-wrap: nowrap;
                font-weight: 600;
            }
            
            #referralCode {
                color: var(--main-700);
                font-weight: 900;
            }
            
            #rewardImg {
                max-width: 33%;
            }
            
            #stats {
                background: var(--gray-50);
                padding: 0.5em;
                border-radius: 0.5em;
                margin: 0;
                margin-bottom: 0.5em;
            }
            
            #codeEntryWrapper {
                display: flex;
                justify-content: space-between;
                background: var(--gray-50);
                border-radius: 0.5em;
                padding-left: 0.5em;
                margin-top: 0.5em;
            }
            
            #codeInput {
                flex: 1;
                background: transparent;
                border: none;
                color: var(--gray-700);
                font-weight: 500;
                outline: none;
            }
            
            #codeInput::placeholder {
                color: var(--gray-400);
            }
            
            #codeNextWrapper {
                padding: 0.5em;
            }
            
        `;
    }

}

Stateful.define("referral-pane", ReferralPane)
