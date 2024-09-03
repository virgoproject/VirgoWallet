class ReferralPane extends StatefulElement {

    async render() {

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const req = await fetch("https://airdrops.virgo.net:2083/api/reward/referral/get/"+infos.addresses[0].address)
            return await req.json()
        })

        const {data: invites, loading: invitesLoading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const req = await fetch("https://airdrops.virgo.net:2083/api/reward/referral/invites/get/"+infos.addresses[0].address)
            return await req.json()
        })

        if(loading || invitesLoading) return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="${Stateful.t("rewardReferralTitle")}" backfunc="${back}"></section-header>
                    <div id="content">
                        <scroll-view>
                            <div class="px-3" style="padding-bottom: 85px">
                                <div class="row shimmerBG" id="statsShimmer">
                                </div>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <p class="text-lg mb-1" id="codeTitle">${Stateful.t("referralCodeTitle")}</p>
                                        <p class="text-gray-400 mb-1">${Stateful.t("referralCodeSub")}</p>
                                        <p id="referralCodeShimmer" class="text-3xl mb-1 shimmerBG"></p>
                                        <p class="text-sm text-gray-400">${Stateful.t("referralCodeAfter")}</p>
                                    </div>
                                    <img src="../images/reward/referralRewards.png" id="rewardImg">
                                </div>      
                                <p class="mt-3 mb-2 label">${Stateful.t("referralInvitesTitle")}</p>
                                <div id="invitesContainer">
                                    <div class="shimmerBG inviteShimmer mt-3 mb-3"></div>
                                    <div class="shimmerBG inviteShimmer mt-3 mb-3"></div>
                                    <div class="shimmerBG inviteShimmer mt-3 mb-3"></div>
                                </div>     
                            </div>
                        </scroll-view>
                    </div>
                </div>
            </div>
        `

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

        let rows = []

        this.boxNumber = 5

        if(invites.length == 0){
            rows.push(`
                <div class="text-center">
                    <img src="../images/noContact.png" class="w-100">
                    <p class="text-lg mt-3 mb-1 weight-600 text-gray-700">${Stateful.t("referralNoInvitesTitle")}</p>    
                    <p class="text-gray-400">${Stateful.t("referralNoInvitesSub")}</p>
                </div>
            `)
        }else{
            rows = this.getRows(invites, 0, this.boxNumber)
        }

        const onNearEnd = this.registerFunction(() => {
            if(_this.boxNumber >= invites.length) return

            const oldBoxNum = _this.boxNumber
            _this.boxNumber = Math.min(_this.boxNumber+5, invites.length)

            const scroll = _this.querySelector("#invitesContainer")

            for(const row of _this.getRows(invites, oldBoxNum, _this.boxNumber)){
                scroll.insertAdjacentHTML("beforeend", row)
            }
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="${Stateful.t("referralTitle")}" backfunc="${back}"></section-header>
                    <div id="content">
                        <scroll-view onnearend="${onNearEnd}">
                            <div class="px-3" style="padding-bottom: 85px">
                                <div class="row" id="stats">
                                    <div class="col-6 text-center">
                                        <p class="text-gray-700 text-xl m-0">${data.invited}</p>
                                        <p class="text-gray-400 m-0">${Stateful.t("referralInvitesCountTitle")}</p>
                                    </div>
                                    <div class="col-6 text-center">
                                        <p class="text-gray-700 text-xl m-0">${data.earned}</p>
                                        <p class="text-gray-400 m-0">${Stateful.t("referralXPTitle")}</p>
                                    </div>
                                </div>
                                ${data.referred ? "" : `
                                <div id="codeEntryWrapper" class="mt-3 mb-3">
                                    <input type="text" placeholder="${Stateful.t("referralCodeInput")}" id="codeInput" oninput="${onInput}" ${codeLoading ? "disabled" : ""}>
                                    <div id="codeNextWrapper">
                                        ${button}
                                    </div>
                                </div>
                                `}
                                <div class="d-flex align-items-center">
                                    <div>
                                        <p class="text-lg mb-1" id="codeTitle">${Stateful.t("referralCodeTitle")}</p>
                                        <p class="text-gray-400 mb-1">${Stateful.t("referralCodeSub")}</p>
                                        <p id="referralCode" class="text-3xl mb-1">${data.code}</p>
                                        <p class="text-sm text-gray-400">${Stateful.t("referralCodeAfter")}</p>
                                    </div>
                                    <img src="../images/reward/referralRewards.png" id="rewardImg">
                                </div>
                                <p class="mt-3 mb-2 label">${Stateful.t("referralInvitesTitle")}</p>
                                <div id="invitesContainer">
                                    ${rows}
                                </div>                
                            </div>
                        </scroll-view>
                    </div>
                </div>
            </div>
        `
    }

    getRows(data, min, max){
        const rows = []

        for (let i = min; i < max; i++){
            const invite = data[i]
            rows.push(`
                <div class="d-flex justify-content-between align-items-center mt-3 mb-3">
                    <div class="d-flex align-items-center">
                        <div class="inviteIcon ${invite.status == 1 ? "confirmed" : ""}">
                            <i class="fa-regular fa-user"></i>
                        </div>
                        <p class="mb-0 ml-2 text-gray-700 weight-600">${invite.address}</p>           
                    </div>
                    <p class="mb-0 text-gray-400">${invite.status == 1 ? "+100 XP" : Stateful.t("referralPending")}</p>
                </div>
            `)
        }

        return rows
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
            
            .inviteIcon {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                font-size: 18px;
                border-radius: 50%;
                background-color: var(--gray-100);
                color: var(--gray-600);
            }
            
            .inviteIcon.confirmed {
                background-color: var(--green-100);
                color: var(--green-600);
            }
            
            #statsShimmer {
                border-radius: 0.5em;
                height: 5em;
                margin: 0 0 0.5em;
            }
            
            #referralCodeShimmer {
                border-radius: 0.5em;
                width: 5ch;
                height: 1em;
            }
            
            .inviteShimmer {
                border-radius: 0.5em;
                height: 3em;
            }
            
        `;
    }

}

Stateful.define("referral-pane", ReferralPane)
