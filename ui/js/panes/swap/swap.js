class SwapTokens extends StatefulElement {

    render() {

        const _this = this

        const onInput = this.registerFunction(e => {
            const span = _this.querySelector("#inputCalcSpan")
            span.innerHTML = e.currentTarget.value
            e.currentTarget.style.maxWidth = span.offsetWidth + "px"
        })

        return `
            <div id="wrapper">
                <section-header title="Swap"></section-header>
                <div id="content">
                    <div class="labelWrapper text-sm mb-1">
                         <p class="m-0">You send</p>
                         <div class="balanceWrapper">
                            <p class="m-0">Available: </p>
                            <p class="m-0 balance">0.0151</p>
                            <p class="m-0"> BNB</p>
                         </div>
                    </div>
                    <div class="tokenWrapper">
                        <div class="amountWrapper">
                            <input type="text" placeholder="0.0" class="amount text-2xl" oninput="${onInput}">
                            <p id="max">Max</p>
                        </div>
                        <div class="select">
                            <div class="selectHeight"></div>
                            <div class="shimmerBG shimmerIcon"></div>
                            <img style="display: none" class="selectLogo">
                            <div class="defaultSelectLogo" style="display: none"><p class="m-auto">B</p></div>
                            <p class="selectName text-lg">BNB</p>
                            <i class="selectIcon fa-solid fa-caret-down"></i>
                        </div>
                    </div>
                    <div id="switch" class="text-2xl mt-4 mb-2"><i class="fas fa-sync-alt"></i></div>
                    <div class="labelWrapper text-sm mb-1">
                         <p class="m-0">You get</p>
                         <div class="balanceWrapper">
                            <p class="m-0">Available: </p>
                            <p class="m-0 balance">0.0151</p>
                            <p class="m-0"> BNB</p>
                         </div>
                    </div>
                    <div class="tokenWrapper">
                        <div class="amountWrapper">
                            <input type="text" placeholder="0.0" class="amount disabled text-2xl" disabled>
                        </div>
                        <div class="select">
                            <div class="selectHeight"></div>
                            <div class="shimmerBG shimmerIcon"></div>
                            <img style="display: none" class="selectLogo">
                            <div class="defaultSelectLogo" style="display: none"><p class="m-auto">B</p></div>
                            <p class="selectName text-lg">BNB</p>
                            <i class="selectIcon fa-solid fa-caret-down"></i>
                        </div>
                    </div>
                </div>
                <button class="button w-100">Next</button>
            </div>
            <span id="inputCalcSpan" class="text-2xl"></span>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100vh;
                justify-content: space-between;
            }
            
            #content {
                margin-top: -35px;
            }
            
            #inputCalcSpan {
                visibility: hidden;
                position: absolute;
                top: -100vh;
            }
            
            .tokenWrapper {
                display: flex;
                background: var(--gray-100);
                border-radius: 0.5em;
                justify-content: space-between;
                padding: 0.5em;
            }
            
            .amountWrapper {
                display: flex;
                align-items: center;
                min-width: 0;
            }
            
            .amount {
                width: 100%;
                background: transparent;
                border: none;
                min-width: 4ch;
                max-width: 0;
                outline: 0;
            }
            
            .amount.disabled {
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #max {
                margin: 0 0.5em;
                cursor: pointer;
                color: var(--mainColor);
            }
            
            .shimmerIcon {
                height: 36px;
                width: 36px;
                border-radius: 100%;
                animation-duration: 35s;
            }
            
            .selectLogo {
                height: 36px;
                width: 36px;
                border-radius: 100%;
            }
            
            .defaultSelectLogo {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                border-radius: 100%;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
            }
            
            .select {
                display: flex;
                width: fit-content;
                align-items: center;
                background: white;
                padding: 0.5em 1em;
                border-radius: 0.5em;
                cursor: pointer;
                transition: 0.1s ease-in all;
                font-weight: 600;
            }
            
            .select:hover {
                background: var(--gray-50);
            }
            
            .selectName {
                margin: 0 0.5em;
                color: var(--gray-700);
            }
            
            .selectedHeight {
                height: 36px;
            }
            
            .selectIcon {
                color: var(--gray-400);
                padding-bottom: 4px;
            }
            
            .labelWrapper {
                display: flex;
                justify-content: space-between;
                white-space: nowrap;
                color: var(--gray-400);
            }
            
            .balanceWrapper {
                display: flex;
                white-space: pre;
                min-width: 0;
                margin-left: 2em;
            }
            
            .balance {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #switch {
                background-color: var(--gray-50);
                width: fit-content;
                margin: 0 auto;
                padding: 0.5em;
                line-height: 1em;
                border-radius: 50%;
                color: var(--mainColor);
                cursor: pointer;
                transition: all 0.1s ease-in;
            }
            
            #switch:hover {
                background-color: var(--gray-100);
            }
            
            .button {
                margin-bottom: 70px;
            }
        `;
    }

}

Stateful.define("swap-tokens", SwapTokens)
