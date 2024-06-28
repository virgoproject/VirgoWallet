class DailyReward extends StatefulElement {

    render(){
        const _this = this

        const {data, loading: dataLoading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const res = await fetch("http://localhost:2053/api/reward/daily/get/"+infos.addresses[0].address)
            return await res.json()
        })

        if(dataLoading) return ""

        const rows = []

        let day = data.streak

        let firstClaimed = false

        if(day > 0){
            day--
            firstClaimed = true
            if(data.alreadyClaimed)
                day--
        }

        for(let i = 0; i < 4; i++){

            let reward = data.rewardList[data.rewardList.length]
            if(day <= data.rewardList.length-1) reward = data.rewardList[day]

            if(i == 0 && firstClaimed || i == 1 && data.alreadyClaimed){
                rows.push(`
                    <div class="dayWrapper text-center ${i == 0 ? 'mr-2' : i == 3 ? 'ml-2' : 'mx-2'}">
                        <div class="dayBox claimed px-3 py-2">
                            <i class="fa-regular fa-check text-2xl"></i>
                        </div>              
                        <p class="dayName m-0 mt-1 text-sm">Day ${day+1}</p>
                    </div>
                `)
            }else{
                rows.push(`
                    <div class="dayWrapper text-center ${i == 0 ? 'mr-2' : i == 3 ? 'ml-2' : 'mx-2'}">
                        <div class="dayBox px-3 py-2">
                            <p class="xpIcon m-auto mb-1">XP</p>
                            <p class="rewardAmount m-0 text-lg">${reward}</p>
                        </div>              
                        <p class="dayName m-0 mt-1 text-sm">Day ${day+1}</p>
                    </div>
                `)
            }

            day++
        }

        const [loading, setLoading] = this.useState("loading", false)

        const onClick = this.registerFunction(() => {

            setLoading(true)

            claimDailyReward().then(res => {
                setLoading(false)
                _this.runFunctions()
                if(res === true)
                    notyf.success("Airdrop successfully joined!")
                else
                    notyf.error("Error: " + res.message)
            })

        })

        let button = `<button class="button w-100 mt-3" ${data.alreadyClaimed ? "disabled" : ""} id="join" onclick="${onClick}">Claim reward</button>`

        if(loading) button = `<button class="button w-100 mt-3" id="join" disabled><i class="fas fa-spinner fa-pulse"></i></button>`

        return `
            <div id="wrapper" class="mt-1 p-3 text-gray-700">
                <p id="title" style="font-weight: 600;">Log in every day and receive free XP!</p>
                <div id="days">
                    ${rows}
                </div>
                ${button}
            </div>
        `

    }

    style() {
        return `
            #wrapper {
                background: var(--gray-50);
                border-radius: 0.5em;
            }
            
            .xpIcon {
                margin: 0;
                color: var(--green-600);
                background: var(--green-100);
                border-radius: 50%;
                height: 24px;
                width: 24px;
                line-height: 25px;
                font-size: 0.8em;
                text-align: center;
                font-weight: 600;
            }
            
            #days {
                display: flex;
                flex-wrap: nowrap;
                justify-content: space-evenly;
            }
            
            .dayBox {
                background: var(--gray-200);
                border-radius: 0.5em;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .dayBox.claimed {
                background: var(--main-700);
                color: white;
            }
            
            .dayBox.claimed i {
                font-weight: 600;
            }
            
            .rewardAmount {
                font-weight: bold;
                line-height: 1em !important;
            }
            
            .dayName {
                font-weight: 600;
            }
            
            .dayWrapper {
                display: flex;
                flex-flow: column;
                width: 25%;
            }
        `;
    }

}

Stateful.define("daily-reward", DailyReward)
