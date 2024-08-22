class RewardRulesPane extends StatefulElement {

    async render() {

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const {data, loading} = this.useFunction(async () => {
            const req = await fetch("http://localhost:2053/api/reward/ranks/get")
            return await req.json()
        })

        const texts = []

        if(loading){
            for(let i = 0; i < 6; i++){
                texts.push(`<div class="shimmerBG shimmerXP"></div>`)
            }
        }else{
            for(const rank of data){
                texts.push(`<p class="text-gray-400 mb-0">${rank.minXP}+</p>`)
            }
        }

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="${Stateful.t("rewardRulesTitle")}" backfunc="${back}"></section-header>
                    <div id="content" class="px-3">
                        <scroll-view>
                            <p class="title text-gray-700 text-xl text-left m-0">${Stateful.t("rewardRulesTitle2")}</p>
                            <p class="subtitle text-gray-400 text-sm text-left">${Stateful.t("rewardRulesIntro1")}<br>${Stateful.t("rewardRulesIntro2")}</p>
                            <div class="d-flex align-items-center">
                                <img src="https://raw.githubusercontent.com/virgoproject/tokens/main/56/0xfb526228ff1c019e4604c7e7988c097d96bd5b70/logo.png" class="vgoIcon mr-2">
                                <div class="text-left ml-2 flex-1">
                                   <p id="activityTitle" class="mb-1 text-lg">${Stateful.t("rewardRulesActivityTitle")}</p>
                                   <p class="text-gray-400 text-sm mb-0">${Stateful.t("rewardRulesActivitySub")}</p>         
                                </div>
                            </div>
                            <div class="d-flex align-items-center mt-3">
                                <p class="xpIcon mr-2">XP</p>
                                <div class="text-left ml-2 flex-1">
                                   <p id="xpTitle" class="mb-1 text-lg">${Stateful.t("rewardRulesXPTitle")}</p>
                                   <p class="text-gray-400 text-sm mb-0">${Stateful.t("rewardRulesXPSub")}</p>         
                                </div>
                            </div>
                            <p class="title text-gray-700 text-xl text-left m-1 mt-3">${Stateful.t("rewardRulesRanksTitle")}</p>
                            <div>
                                <div class="d-flex mb-3">
                                    <div>
                                        <img src="../images/reward/ranks/bronze.png" class="w-100">
                                        <p class="weight-600 mb-0" style="color: #5E4C2A">${Stateful.t("rewardRulesBronzeTitle")}</p>
                                        ${texts[0]}
                                    </div>
                                    <div>
                                        <img src="../images/reward/ranks/silver.png" class="w-100">
                                        <p class="weight-600 mb-0" style="color: #5D6B76">${Stateful.t("rewardRulesSilverTitle")}</p>
                                        ${texts[1]}
                                    </div>
                                    <div>
                                        <img src="../images/reward/ranks/gold.png" class="w-100">
                                        <p class="weight-600 mb-0" style="color: #F4A04F">${Stateful.t("rewardRulesGoldTitle")}</p>
                                        ${texts[2]}
                                    </div>
                                </div>
                                <div class="d-flex mb-3">
                                    <div>
                                        <img src="../images/reward/ranks/platinum.png" class="w-100">
                                        <p class="weight-600 mb-0" style="color: #728AA2">${Stateful.t("rewardRulesPlatinumTitle")}</p>
                                        ${texts[3]}
                                    </div>
                                    <div>
                                        <img src="../images/reward/ranks/diamond.png" class="w-100">
                                        <p class="weight-600 mb-0" style="color: #45AFF8">${Stateful.t("rewardRulesDiamondTitle")}</p>
                                        ${texts[4]}
                                    </div>
                                    <div>
                                        <img src="../images/reward/ranks/master.png" class="w-100">
                                        <p class="weight-600 mb-0" style="color: #8A56D6">${Stateful.t("rewardRulesMasterTitle")}</p>
                                        ${texts[5]}
                                    </div>
                                </div>
                            </div>          
                        </scroll-view>
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
                width: 100%;
                height: 100%;
            }
            
            #content {
                flex-grow: 1;
                min-height: 0;
                text-align: center;
            }
            
            .title {
                font-weight: 600;
            }
            
            .vgoIcon {
                height: 48px;
                width: 48px;
                border-radius: 50%;
                background-color: var(--gray-100);
            }
            
            .xpIcon {
                margin: 0;
                color: var(--green-600);
                background: var(--green-100);
                border-radius: 50%;
                height: 49px;
                width: 49px;
                line-height: 50px;
                font-size: 1.85em;
                text-align: center;
                font-weight: 600;
            }
            
            #activityTitle {
                color: var(--main-700);
            }
            
            #xpTitle {
                color: var(--green-700);
            }
            
            .shimmerXP {
                border-radius: 0.5em;
                width: 7ch;
                height: 1em;
                margin: auto;
            }
            
        `;
    }

}

Stateful.define("reward-rules-pane", RewardRulesPane)
