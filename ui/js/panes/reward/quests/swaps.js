class swapRewards extends StatefulElement {

    async render() {
        return `
            <div id="wrapper" class="mt-3 p-3 text-gray-700">
                <p id="title" style="font-weight: 600;">Swap on Virgo Wallet and receive up to 500 XP per day!</p>
                <p class="text-sm text-gray-400 mb-2">Today</p>
                <div id="progress">
                    <div id="progressInner" style="width: 10%"></div>
                </div>
                <p class="text-sm text-gray-400 mt-2 mb-0 text-right">120/500</p>
                <button class="button w-100 mt-3">Swap now!</button>
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
        `;
    }

}

Stateful.define("swap-rewards", swapRewards)
