class RewardPane extends StatefulElement {

    render() {

        const airdropsClick = this.registerFunction(() => {
            const elem = document.createElement("airdrops-pane")
            document.body.appendChild(elem)
        })

        const questsClick = this.registerFunction(() => {
            const elem = document.createElement("quests-pane")
            document.body.appendChild(elem)
        })

        const rulesClick = this.registerFunction(() => {
            const elem = document.createElement("reward-rules-pane")
            document.body.appendChild(elem)
        })

        return `
            <section-header title="Reward center"></section-header>
            <div id="content" class="px-3">
                <div>
                    <p id="seasonTitle" class="text-xl mb-1 text-gray-700">Season 1</p>
                    <p id="seasonSubtitle" class="text-gray-400 text-sm">End in 154 days</p>
                </div>
                <div class="d-flex">
                    <div class="flex-grow-1 mr-2 pb-3 d-flex flex-column justify-content-end" id="rankBox" onclick="${rulesClick}">
                        <p id="rankName" class="text-xl m-0">GOLD</p>
                        <p class="text-sm mb-2">My Season rank</p>
                        <div id="rankProgress">
                            <div id="rankProgressInner"></div>
                        </div>
                    </div>
                    <div class="flex-grow-1 ml-2">
                        <div class="rightBox mb-3">
                            <div class="d-flex align-items-center">
                                 <p class="xpIcon">XP</p>
                                 <p id="totalXP" class="text-lg m-0 pl-2  text-gray-700">1,400</p>
                            </div>
                            <p id="totalXPTitle" class="m-0  text-gray-700">Total XP</p>
                        </div>
                        <div class="rightBox">
                            <div class="d-flex align-items-center">
                                 <img src="https://raw.githubusercontent.com/virgoproject/tokens/main/56/0xfb526228ff1c019e4604c7e7988c097d96bd5b70/logo.png" class="vgoIcon">
                                 <p id="estReward" class="text-lg m-0 pl-2  text-gray-700">500 VGO</p>
                            </div>
                            <p id="estRewardTitle" class="m-0  text-gray-700">Estimated reward</p>
                        </div>
                    </div>
                </div>
                <div class="sectionButton mt-4 p-3" onclick="${airdropsClick}">
                    <p class="title m-0 text-gray-700 text-xl">Airdrops</p>
                    <p class="subtitle m-0 text-gray-400">Enter to earn free tokens and XP</p>
                </div>
                <div class="sectionButton mt-4 p-3" onclick="${questsClick}">
                    <p class="title m-0 text-gray-700 text-xl">Quests</p>
                    <p class="subtitle m-0 text-gray-400">Complete tasks to gain XP</p>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #seasonTitle {
                font-weight: bold;
            }
            
            #rankBox, .rightBox {
                background: var(--gray-50);
                border-radius: 0.5em;
                padding: 0.5em 1em;
            }
            
            #rankBox {
                cursor: pointer;
                transition: all 0.2s ease-in;
            }
            
            #rankBox:hover {
                background: var(--gray-100);
            }
            
            #totalXP, #estReward {
                font-weight: 600;
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
            
            .sectionButton .title {
                font-weight: 600;
            }
        `;
    }

}

Stateful.define("reward-pane", RewardPane)