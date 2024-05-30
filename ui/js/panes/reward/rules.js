class RewardRulesPane extends StatefulElement {

    async render() {

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Rules and ranks" backfunc="${back}"></section-header>
                    <div id="content" class="px-3">
                        <p class="title text-gray-700 text-xl text-left m-0">Rules</p>
                        <p class="subtitle text-gray-400 text-sm text-left">Welcome to the Virgo reward centre rules.<br>There are two ways to earn rewards</p>
                        <div class="d-flex align-items-center">
                            <img src="https://raw.githubusercontent.com/virgoproject/tokens/main/56/0xfb526228ff1c019e4604c7e7988c097d96bd5b70/logo.png" class="vgoIcon mr-2">
                            <div class="text-left ml-2 flex-1">
                               <p id="activityTitle" class="mb-1 text-lg">Activity reward</p>
                               <p class="text-gray-400 text-sm mb-0">Each season, an amount of VGO to share is allocated to reward user activity. This amount varies for each user, the more crypto you swap and send, the more VGO you earn. </p>         
                            </div>
                        </div>
                        <div class="d-flex align-items-center mt-3">
                            <p class="xpIcon mr-2">XP</p>
                            <div class="text-left ml-2 flex-1">
                               <p id="xpTitle" class="mb-1 text-lg">Rank & XP</p>
                               <p class="text-gray-400 text-sm mb-0">Collect XP by taking part in quests. These XP will make you climb the rank to get rewards at the end of each season.</p>         
                            </div>
                        </div>
                        <p class="title text-gray-700 text-xl text-left m-0">Ranks</p>
                        
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
            
        `;
    }

}

Stateful.define("reward-rules-pane", RewardRulesPane)