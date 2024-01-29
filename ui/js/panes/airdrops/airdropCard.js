class AirdropCard extends StatefulElement {

    eventHandlers() {
        const _this = this

        const json = JSON.parse(this.getAttribute("data"))

        this.querySelector("#logoPlaceholder").innerHTML = jdenticon.toSvg(json.address+json.chainID, 36)

        this.querySelector("#logo").onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#logoPlaceholder").style.display = "none"
        }

        this.querySelector("#logo").src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + json.chainID + "/" + json.address + "/logo.png"

        this.querySelector("#chainLogoPlaceholder").innerHTML = jdenticon.toSvg(json.chainID, 16)

        this.querySelector("#chainLogo").onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#chainLogoPlaceholder").style.display = "none"
        }

        this.querySelector("#chainLogo").src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + json.chainID + "/logo.png"

    }

    render() {
        const _this = this

        const json = JSON.parse(this.getAttribute("data"))

        const {data, loading} = this.useFunction(async () => {
            return await getTokenDetailsCross(json.address, json.chainID)
        })

        const {data: joined, loading: loading2} = this.useFunction(async () => {
            return await checkAirdropJoined(json.id)
        })

        if(loading || loading2) return

        const expandClick = this.registerFunction(() => {
            const wrapper = _this.querySelector("#wrapper")
            if(wrapper.classList.contains("opened")){
                wrapper.classList.remove("opened")
                return
            }

            wrapper.classList.add("opened")
        })

        const joinClick = this.registerFunction(e => {
            const elem = document.createElement("join-airdrop")
            elem.airdropId = json.id
            elem.conditions = json.conditions
            document.body.appendChild(elem)
            e.stopPropagation()
        })

        const timeLeft = this.calcTimeLeft(json.endDate-Date.now())

        let button = `<div class="col-12 mt-3"><button class="button w-100" onclick="${joinClick}" ${joined? "disabled" : ""}>Join this airdrop</button></div>`

        if(json.endDate < Date.now())
            button = ""

        return `
        <div class="row" id="wrapper" onclick="${expandClick}">
            <div class="col-2 logosWrapper">
                <img style="display: none" id="logo">
                <svg width="36" height="36" id="logoPlaceholder"></svg>
                <img style="display: none" id="chainLogo">
                <svg width="16" height="16" id="chainLogoPlaceholder"></svg>
            </div>
            <div class="col-4 justify-content-center align-self-center">
                <p id="name">${data.name}</p>
            </div>
            <div class="col-6 justify-content-center align-self-center text-right pl-0">
                <p id="amount">${json.reward/json.winnersCount} ${data.ticker} <i class="fa-regular fa-chevron-right" id="expand"></i></p>
            </div>
            <div class="col-12 mt-3" id="details">
                <div class="row">
                    <div class="col-4 text-center">
                        <p class="detailValue">${json.userJoined}</p>
                        <p class="detailTitle">Participants</p>
                    </div>
                    <div class="col-4 text-center">
                        <p class="detailValue">${json.winnersCount}</p>
                        <p class="detailTitle">Winners</p>
                    </div>
                    <div class="col-4 text-center">
                        <p class="detailValue">${timeLeft.value}</p>
                        <p class="detailTitle">${timeLeft.label} left</p>
                    </div>
                    ${button}
                </div>
            </div>
        </div>
        `;
    }

    style() {
        return `

            #wrapper {
                padding: 1em 0;
                border-radius: 0.5em;
                transition: all 0.2s ease-in;
                cursor: pointer;
            }
            
            #wrapper:hover {
                background: var(--whiteBackground);
            }

            p {
                margin-bottom: 0!important;
            }

            #logo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
                background-size: cover;
                margin: auto;
            }
            
            #chainLogo, #chainLogoPlaceholder {
                position: relative;
                height: 16px;
                border-radius: 100%;
                left: 24px;
                top: -44px;
                border: 1px solid white;
            }

            #logoPlaceholder {
                border-radius: 50%;
            }
            
            .logosWrapper {
                height: 36px;
            }

            #expand {
                margin-left: 0.5em;
                cursor: pointer;
                transition: all 0.25s ease-in;
            }

            .opened {
                background: var(--whiteBackground);
            }

            .opened #expand {
                transform: rotate(90deg);
            }

            .detailTitle {
                font-size: 0.875em;
                color: rgba(0, 0, 0, 0.6);
            }

            #details {
                display: none;
            }

            .opened #details {
                display: block;
            }
        `;
    }

    calcTimeLeft(durationInMilliseconds) {
        const millisecondsPerSecond = 1000;
        const secondsPerMinute = 60;
        const minutesPerHour = 60;
        const hoursPerDay = 24;

        // Calculate days, hours, minutes
        const minutes = Math.floor((durationInMilliseconds / (millisecondsPerSecond * secondsPerMinute)) % minutesPerHour);
        const hours = Math.floor((durationInMilliseconds / (millisecondsPerSecond * secondsPerMinute * minutesPerHour)) % hoursPerDay);
        const days = Math.floor(durationInMilliseconds / (millisecondsPerSecond * secondsPerMinute * minutesPerHour * hoursPerDay));

        // Create an array with non-zero values
        const nonZeroValues = [
            { label: 'Days', value: days },
            { label: 'Hours', value: hours },
            { label: 'Minutes', value: minutes }
        ];

        // Find the first non-zero value
        const firstNonZero = nonZeroValues.find(item => item.value > 0);

        // Return the result
        if (firstNonZero) {
            return firstNonZero;
        } else {
            return { label: 'Minutes', value: 0 }
        }
    }

}

Stateful.define("airdrop-card", AirdropCard)
