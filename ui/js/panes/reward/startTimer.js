class RewardStartTimer extends StatefulElement {

    eventHandlers() {
        const date = this.getAttribute("date")

        const days = this.querySelector("#days")
        const hours = this.querySelector("#hours")
        const minutes = this.querySelector("#minutes")
        const seconds = this.querySelector("#seconds")

        const calcLeft = () => {

            const timeLeft = date-Date.now()

            const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
            const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
            const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000)

            days.innerHTML = daysLeft
            hours.innerHTML = hoursLeft
            minutes.innerHTML = minutesLeft
            seconds.innerHTML = secondsLeft

        }

        setInterval(calcLeft, 1000)
        calcLeft()
    }

    async render() {
        return `
            <div class="text-center d-flex flex-column justify-content-around h-100">
                <img src="../images/logoGradient.png" id="logo">
                <div id="titleWrapper">
                    <img src="../images/reward/timerTitle.png" class="w-100">
                </div>
                <div id="timerWrapper">
                    <div class="timerCell">
                        <p class="timerCellValue text-3xl" id="days">27</p>
                        <p class="timerCellTitle text-sm text-gray-400">DAYS</p>
                    </div>
                    <div class="timerCell">
                        <p class="timerCellValue text-3xl" id="hours">7</p>
                        <p class="timerCellTitle text-sm text-gray-400">HOURS</p>
                    </div>
                    <div class="timerCell">
                        <p class="timerCellValue text-3xl" id="minutes">33</p>
                        <p class="timerCellTitle text-sm text-gray-400">MINUTES</p>
                    </div>
                    <div class="timerCell">
                        <p class="timerCellValue text-3xl" id="seconds">12</p>
                        <p class="timerCellTitle text-sm text-gray-400">SECONDS</p>
                    </div>
                </div>
                <p class="text-xl">Before the <span class="text-main-700">${Stateful.t("hello")}</span> season!</p>
            </div>
        `;
    }

    style() {
        return `
            #logo {
                width: 33%;
                margin: 0 auto
            }
            
            #titleWrapper {
                margin-left: -1.1em;
                margin-right: -1.1em;
            }
            
            #timerWrapper {
                display: flex;
                justify-content: space-around;
            }
            
            .timerCell {
                width: auto;
                background: var(--gray-50);
                padding: 0.5em;
                flex: 1;
                margin: 0.25em;
                border-radius: 0.5em;
            }
            
            .timerCellValue {
                color: var(--main-700);
                margin-bottom: 0;
                font-weight: bold;
            }
            
            .timerCellTitle {
                font-weight: 600;
                margin-bottom: 0;
            }
            
        `;
    }

}

Stateful.define("reward-start-timer", RewardStartTimer)
