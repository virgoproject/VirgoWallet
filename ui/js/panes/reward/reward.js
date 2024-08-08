class RewardPane extends StatefulElement {

    render() {

        const {data, loading: dataLoading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const res = await fetch("http://localhost:2053/api/reward/stats/"+infos.addresses[0].address)
            return await res.json()
        })

        if(dataLoading) return `
            <div id="content" class="px-3 pt-3">
                <div>
                    <div id="titleShimmer" class="mb-3 shimmerBG"></div>
                    <div id="subtitleShimmer" class="shimmerBG"></div>
                </div>
                <div class="d-flex mt-3">
                    <div class="flex-grow-1 mr-2 shimmerBG" id="rankShimmer">
                    </div>
                    <div class="flex-grow-1 ml-2">
                        <div class="rightBoxShimmer mb-3 shimmerBG">
                        </div>
                        <div class="rightBoxShimmer shimmerBG">
                        </div>
                    </div>
                </div>
                <div class="shimmerBG buttonShimmer mt-4"></div>
                <div class="shimmerBG buttonShimmer mt-4"></div>
                <div class="shimmerBG buttonShimmer mt-4"></div>
            </div>
        `

        const airdropsClick = this.registerFunction(() => {
            const elem = document.createElement("airdrops-pane")
            document.body.appendChild(elem)
        })

        const questsClick = this.registerFunction(() => {
            const elem = document.createElement("quests-pane")
            document.body.appendChild(elem)
        })

        const referralClick = this.registerFunction(() => {
            const elem = document.createElement("referral-pane")
            document.body.appendChild(elem)
        })

        const rulesClick = this.registerFunction(() => {
            const elem = document.createElement("reward-rules-pane")
            document.body.appendChild(elem)
        })

        return `
            <div id="content" class="px-3 pt-3">
                <div>
                    <p id="seasonTitle" class="text-xl mb-1 text-gray-700">Season 1</p>
                    <p id="seasonSubtitle" class="text-gray-400 text-sm">End in 154 days</p>
                </div>
                <div class="d-flex">
                    <div class="flex-grow-1 mr-2 pb-3 d-flex flex-column justify-content-end" id="rankBox" onclick="${rulesClick}" style='background-image: url("../images/reward/ranks/${data.rank.rank.name}.png");'>
                        <div id="rankBoxInner">
                            <p id="rankName" class="text-xl m-0">${data.rank.rank.name.toUpperCase()}</p>
                            <p class="text-sm mb-2">My Season rank</p>
                            <div id="rankProgress">
                                <div id="rankProgressInner" style="width: ${(data.rank.progress*100).toFixed(0)}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-grow-1 ml-2">
                        <div class="rightBox mb-3">
                            <div class="d-flex align-items-center">
                                 <p class="xpIcon">XP</p>
                                 <p id="totalXP" class="text-lg m-0 pl-2  text-gray-700">${data.totalXP}</p>
                            </div>
                            <p id="totalXPTitle" class="m-0  text-gray-700">Total XP</p>
                        </div>
                        <div class="rightBox">
                            <div class="d-flex align-items-center">
                                 <img src="https://raw.githubusercontent.com/virgoproject/tokens/main/56/0xfb526228ff1c019e4604c7e7988c097d96bd5b70/logo.png" class="vgoIcon">
                                 <p id="estReward" class="text-lg m-0 pl-2  text-gray-700">${data.estReward} VGO</p>
                            </div>
                            <p id="estRewardTitle" class="m-0  text-gray-700">Estimated reward</p>
                        </div>
                    </div>
                </div>
                <div class="sectionButton mt-4" onclick="${airdropsClick}" id="airdropsBtn">
                    <div class="buttonsInner p-3">
                        <p class="title m-0 text-gray-700 text-xl">Airdrops</p>
                        <p class="subtitle m-0">Enter to earn free tokens and XP</p>        
                    </div>
                </div>
                <div class="sectionButton mt-4" onclick="${questsClick}" id="questsBtn">
                    <div class="buttonsInner p-3">
                        <p class="title m-0 text-gray-700 text-xl">Quests</p>
                        <p class="subtitle m-0">Complete tasks to gain XP</p>    
                    </div>
                </div>
                <div class="sectionButton mt-4" onclick="${referralClick}" id="questsBtn">
                    <div class="buttonsInner p-3">
                        <p class="title m-0 text-gray-700 text-xl">Referral</p>
                        <p class="subtitle m-0">Invite your friends to earn XP</p>    
                    </div>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #content {
                height: 100%;
                overflow: auto;
                padding-bottom: 5em;
            }
        
            #seasonTitle {
                font-weight: bold;
            }
            
            #rankBox, .rightBox {
                background-color: var(--gray-50);
                border-radius: 0.5em;
                padding: 0.5em 1em;
            }
            
            #rankBox {
                cursor: pointer;
                transition: all 0.2s ease-in;
                background-size: contain;
                background-repeat: no-repeat;
            }
            
            #rankBoxInner {
                background: #fafafa03;
                backdrop-filter: blur(2px);
            }
            
            #rankBox:hover {
                background-color: var(--gray-100);
            }
            
            #totalXP, #estReward {
                font-weight: 600;
            }
            
            #airdropsBtn, #questsBtn {
                background-repeat: no-repeat;
                background-position: center;
                background-position-x: left;
                background-size: contain;
            }
            
            .buttonsInner {
                background: linear-gradient(270deg, var(--gray-50) 33%, transparent 120%);
                border-radius: 0.5em;
            }
            
            .subtitle {
                mix-blend-mode: difference;
                color: #757575 !important;
                font-weight: 600;
            }
            
            #airdropsBtn {
                background-image: url(../images/reward/airdropBtn.png);
            }
            
            #questsBtn {
                background-image: url(../images/reward/questBtn.png);
            }
            
            .xpIcon {
                margin: 0;
                color: var(--green-600);
                background: var(--green-100);
                border-radius: 50%;
                height: 20px;
                width: 20px;
                line-height: 21px;
                font-size: 0.75em;
                text-align: center;
                font-weight: 600;
            }
            
            .vgoIcon {
                height: 19px;
                width: 19px;
                border-radius: 50%;
                background-color: var(--gray-100);
            }
            
            #rankName {     
                font-weight: bold;
            }
            
            #rankProgress {
                height: 6px;
                background: var(--green-100);
                border-radius: 1em;
            }
            
            #rankProgressInner {
                background: var(--green-600);
                height: 6px;
                border-radius: 1em;
                width: 40%;
                min-width: 10%;
            }
            
            .sectionButton {
                background: var(--gray-50);
                text-align: right;
                border-radius: 0.5em;
                cursor: pointer;
                transition: all 0.2s ease-in;
            }
            
            .sectionButton:hover {
                background: var(--gray-100);
            }
            
            .sectionButton:hover .buttonsInner {
                background: linear-gradient(270deg, var(--gray-100) 33%, transparent 120%);
            }
            
            .sectionButton .title {
                font-weight: 600;
            }
            
            #titleShimmer {
                width: 8ch;
                height: 1em;
                border-radius: 0.5em;
            }
            
            #subtitleShimmer {
                width: 16ch;
                height: 0.85em;
                border-radius: 0.5em;
            }
            
            #rankShimmer {
                border-radius: 0.5em;
            }
            
            .rightBoxShimmer {
                border-radius: 0.5em;
                height: 4em;
            }
            
            .buttonShimmer {
                border-radius: 0.5em;
                height: 6em;
            }
        `;
    }

}

Stateful.define("reward-pane", RewardPane)
