class AirdropCard extends StatefulElement {

    eventHandlers() {
        const _this = this

        const json = JSON.parse(this.getAttribute("data"))

        const chainLogo = this.querySelector("#chainLogo")

        chainLogo.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#shimmerChainLogo").style.display = "none"
        }

        chainLogo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + json.chainID + "/logo.png"


        const logo = this.querySelector("#logo")

        logo.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#shimmerLogo").style.display = "none"
        }
        logo.onerror = e => {
            _this.querySelector("#defaultLogo").style.display = "flex"
            _this.querySelector("#shimmerLogo").style.display = "none"
        }

        logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + json.chainID + "/" + json.address + "/logo.png"

    }

    render() {
        const _this = this

        const json = JSON.parse(this.getAttribute("data"))

        const {data, loading} = this.useFunction(async () => {
            return await getTokenDetailsCross(json.address, json.chainID)
        })

        const joined = this.getAttribute("joined") == "true"

        if(loading) return ""

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

        let button = `<div class="col-12 mt-3"><button class="button w-100" onclick="${joinClick}" ${joined? "disabled" : ""}>Join and earn ${json.xpReward} XP!</button></div>`

        if(json.endDate < Date.now())
            button = ""

        return `
        <div class="mt-1 p-3 text-gray-700" id="wrapper" onclick="${expandClick}">
            <div id="topWrapper">
                <div id="logosWrapper">
                    <div class="shimmerBG" id="shimmerLogo"></div>
                    <div id="defaultLogo" style="display: none"><p class="m-auto">${data.name.charAt(0).toUpperCase()}</p></div>
                    <img id="logo" style="display: none">
                    <div class="shimmerBG" id="shimmerChainLogo"></div>
                    <img id="chainLogo" style="display: none">
                </div>
                <p id="name" class="weight-600">${data.name}</p>
                <div id="amountWrapper">
                    <p id="amount" class="text-gray-400">${Utils.formatAmount(json.reward/json.winnersCount, json.decimals)}</p>
                    <p id="ticker" class="text-gray-400"> ${data.ticker}</p>
                    <i class="fa-regular fa-chevron-right text-gray-400" id="expand"></i>
                </div>
            </div>
            <div class="mt-3" id="details">
                <div class="row">
                    <div class="col-4 text-center">
                        <p>${json.entryCount}</p>
                        <p class="text-gray-400 text-sm">Participants</p>
                    </div>
                    <div class="col-4 text-center">
                        <p>${json.winnersCount}</p>
                        <p class="text-gray-400 text-sm">Winners</p>
                    </div>
                    <div class="col-4 text-center">
                        <p>${timeLeft.value}</p>
                        <p class="text-gray-400 text-sm">${timeLeft.label} left</p>
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
                border-radius: 0.5em;
                transition: all 0.2s ease-in 0s;
                cursor: pointer;
            }
            
            #wrapper:hover {
                background: var(--gray-50);
            }

            p {
                margin-bottom: 0!important;
            }
            
            #topWrapper {
                display: flex;
                align-items: center;
            }
            
            #name {
                margin-left: 1em;
            }
            
            #amountWrapper {
                display: flex;
                white-space: pre;
                flex: 1 1 0%;
                justify-content: flex-end;
                margin-left: 1em;
                min-width: 0px;
                align-items: center;
            }
            
            #amount {
                overflow: hidden;
                text-overflow: ellipsis;
            }

            #logo, #shimmerLogo, #defaultLogo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
                background-size: cover;
                margin: auto;
                animation-duration: 30s;
            }
            
            #chainLogo, #shimmerChainLogo {
                position: relative;
                height: 16px;
                width: 16px;
                border-radius: 100%;
                left: 24px;
                top: -44px;
                border: 1px solid white;
                animation-duration: 80s;
            }
            
            #defaultLogo {
                text-align: center;
                line-height: 36px;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
            }
            
            #logosWrapper {
                height: 36px;
                width: 36px;
            }

            #expand {
                margin-left: 0.5em;
                cursor: pointer;
                transition: all 0.25s ease-in;
            }

            .opened {
                background: var(--gray-50);
            }

            .opened #expand {
                transform: rotate(90deg);
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
