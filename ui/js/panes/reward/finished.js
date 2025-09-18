class rewardFinished extends StatefulElement {

    async render() {

        const data = JSON.parse(atob(this.getAttribute("data")))

        return `
            <div class="text-center d-flex flex-column justify-content-around h-100">
                <div>
                    <img src="../images/reward/ranks/${data.rank.rank.name.toLowerCase()}.png" class="w-75 mx-auto">
                    <p id="rankName" class="text-xl m-0">Congratulations, you reached ${data.rank.rank.name.toUpperCase()}!</p>
                </div>
                <div>
                    <p id="reward" class="text-lg m-0 pl-2  text-gray-700">${Utils.cutToDecimals(data.estReward, 1)} VGO</p>
                    <p id="rewardTitle" class="text-gray-400">Your final reward</p>
                </div>
                <p class="text-gray-400 text-sm">Reward will be distributed on Wednesday, 15 January 2025</p>
            </div>
        `
    }

    style() {
        return `
            #rankName {
                font-weight: 600;
            }
        
            #reward {
                font-weight: 600;
            }
        `;
    }

}

Stateful.define("reward-finished", rewardFinished)