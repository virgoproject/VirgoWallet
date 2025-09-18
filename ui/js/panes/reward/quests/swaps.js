class swapRewards extends StatefulElement {

    async render() {

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const res = await fetch("https://airdrops.virgo.net:2083/api/reward/swap/get/"+infos.addresses[0].address)
            return await res.json()
        })

        if(loading) return `
            <div class="shimmerBG mt-3" id="shimmer"></div>
        `

        const ctaClick = this.registerFunction(() => {
            document.querySelector("quests-pane").remove()
            document.getElementById("footerSwapBtn").click()
        })

        console.log(data)

        return `
            <div id="wrapper" class="mt-3 p-3 text-gray-700">
                <p id="title" style="font-weight: 600;">${Stateful.t("rewardSwapTitle1")} ${data.max} ${Stateful.t("rewardSwapTitle2")}</p>
                <p class="text-sm text-gray-400 mb-2">${Stateful.t("rewardSwapTodayTitle")}</p>
                <div id="progress">
                    <div id="progressInner" style="width: ${Math.max(5, data.current/data.max*100).toFixed(0)}%"></div>
                </div>
                <div class="d-flex justify-content-between">
                    <p class="text-sm text-gray-400 mt-2 mb-0">${data.xpPerUSD} XP/USD</p>
                    <p class="text-sm text-gray-400 mt-2 mb-0 text-right">${data.current}/${data.max}</p>
                </div>
                <button class="button w-100 mt-3" onclick="${ctaClick}">${Stateful.t("rewardSwapCTABtn")}</button>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                background: var(--gray-50);
                border-radius: 0.5em;
            }
            
            #progress {
                height: 6px;
                background: var(--main-100);
                border-radius: 1em;
            }
            
            #progressInner {
                background: var(--main-700);
                height: 6px;
                border-radius: 1em;
                width: 40%;
            }
            
            #shimmer {
                border-radius: 0.5em;
                height: 190px;
            }
        `;
    }

}

Stateful.define("swap-rewards", swapRewards)
