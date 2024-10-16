class SendToken extends StatefulElement {

    render() {

        const _this = this

        const {data, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()
            const contacts = await getContacts()

            const contactsByAddress = {}
            const favoriteContacts = []

            for(const contact of contacts){
                contactsByAddress[contact.address.toLowerCase()] = contact
                if(contact.favorite) favoriteContacts.push(contact)
            }

            const recent = []
            const recentFilter = []

            for(const transaction of baseInfos.wallets[baseInfos.selectedWallet].wallet.transactions){
                if(recent.length >= 5) break
                if(recentFilter.includes(transaction.recipient.toLowerCase())) continue
                if(transaction.contractAddr != baseInfos.wallets[baseInfos.selectedWallet].wallet.ticker && !await validateAddress(transaction.contractAddr)) continue

                recentFilter.push(transaction.recipient.toLowerCase())

                const item = {
                    address: transaction.recipient
                }

                if(contactsByAddress[transaction.recipient.toLowerCase()] !== undefined)
                    item.name = contactsByAddress[transaction.recipient.toLowerCase()].name

                recent.push(item)
            }

            return {
                recent,
                contactsByAddress,
                favoriteContacts
            }

        }, 10000)

        if(loading) return ""

        const contactsClick = this.registerFunction(() => {
            const elem = document.createElement("contacts-list")
            document.body.appendChild(elem)
        })

        const onInput = this.registerFunction(async e => {
            _this.querySelector("#next").disabled = !await validateAddress(e.currentTarget.value)
        })

        const onNext = this.registerFunction(e => {
            const elem = document.createElement("send-token-amount")
            elem.address = _this.querySelector("#recipient").value
            _this.querySelector("#recipient").value = ""
            e.currentTarget.disabled = true
            document.body.appendChild(elem)
        })

        const receiveClick = this.registerFunction(() => {
            const elem = document.createElement("receive-popup")
            document.body.appendChild(elem)
        })

        const buyClick = this.registerFunction(() => {
            document.getElementById("footerSwapBtn").click()
        })

        let recent = `
            ${this.getRows(data.favoriteContacts, Stateful.t("sendFavoriteLabel"))}
            <div class="pt-3">
                ${this.getRows(data.recent, Stateful.t("sendRecentLabel"))}    
            </div>
        `

        if(data.favoriteContacts.length == 0 && data.recent.length == 0){
            recent = `
                <div class="text-center mt-5">
                    <img src="../images/noRecent.png" id="nothingImg">
                    <p id="nothingTitle" class="mt-3 text-lg mb-1">${Stateful.t("sendNoRecentTitle")}</p>
                    <p id="nothingSubtitle">${Stateful.t("sendNoRecentSub")}</p>      
                </div>
            `
        }

        return `
            <div id="wrapper">
                <section-header title="${Stateful.t("sendTitle")}"></section-header>
                <div class="d-flex m-0">
                    <div class="p-0 pr-2">
                        <button class="button w-100" id="send"><i class="fa-solid fa-arrow-up"></i> ${Stateful.t("sendSendBtn")}</button>
                    </div>
                    <div class="px-1">
                        <button class="button w-100" id="receive" onclick="${receiveClick}"><i class="fa-solid fa-arrow-down"></i> ${Stateful.t("sendReceiveBtn")}</button>
                    </div>
                    <div class="p-0 pl-2">
                        <button class="button w-100" id="buy" onclick="${buyClick}"><i class="fa-solid fa-dollar-sign"></i> ${Stateful.t("sendBuyBtn")}</button>
                    </div>
                </div>
                <p class="mt-3 mb-0 label">${Stateful.t("sendRecipientLabel")}</p>
                <div id="recipientWrapper">
                    <div id="contacts" onclick="${contactsClick}">
                        <i class="fa-solid fa-address-book text-xl"></i>
                    </div>
                    <input type="text" placeholder="${Stateful.t("sendRecipientPlaceholder")}" id="recipient" oninput="${onInput}">
                    <div id="nextWrapper">
                        <button id="next" class="button" onclick="${onNext}" disabled><i class="fa-regular fa-arrow-right"></i></button>
                    </div>
                </div>
                <scroll-view id="scroll" class="d-block mt-3">
                    <div class="mb-5 pb-5">
                        ${recent}
                    </div>
                </scroll-view>
            </div>
        `;
    }

    getRows(list, label){
        if(list.length == 0) return ""

        const _this = this

        const rows = []

        const onClick = this.registerFunction(e => {
            const elem = document.createElement("send-token-amount")
            elem.address = e.currentTarget.getAttribute("address")
            document.body.appendChild(elem)
        })

        for(const item of list){
            if(item.name !== undefined){
                rows.push(`
                    <div class="contact mb-2 px-3" address="${item.address}" onclick="${onClick}">
                        <div class="contactWrapper">
                            <div class="contactLogo">${jdenticon.toSvg(item.address, 36)}</div>
                            <div class="contactText">
                                <p class="contactName">${item.name}</p>
                                <p class="contactAddress text-sm">${item.address}</p>
                            </div>
                        </div>
                    </div>
                `)
            }else{
                rows.push(`
                    <div class="contact mb-2 px-3" address="${item.address}" onclick="${onClick}">
                        <div class="contactWrapper">
                            <div class="contactLogo">${jdenticon.toSvg(item.address, 36)}</div>
                            <div class="contactText">
                                <p class="contactName">${item.address}</p>
                            </div>
                        </div>
                    </div>
                `)
            }
        }

        return `
            <p class="mb-0 label">${label}</p>
            ${rows}
        `
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100vh;
            }
        
            #scroll {
                flex-grow: 1;
                min-height: 0;
            }
            
            #soon {
                position: absolute;
                margin-left: -3ch;
                margin-top: -0.5em;
                font-style: italic;
                color: var(--mainColor);
                font-size: 0.75em;
                font-weight: 700;
            }
            
            #receive, #buy {
                color: var(--mainColor);
                background: var(--gray-50);;
                transition: all ease-in 0.1s;
            }
            
            #receive:hover, #buy:hover {
                background: var(--gray-100);
            }
            
            #send {
                cursor: default;
            }
            
            #send:hover {
                background: var(--mainColor);
            }
            
            #recipientWrapper {
                display: flex;
                justify-content: space-between;
                background: var(--gray-50);
                border-radius: 0.5em;
            }
            
            #contacts {
                width: 4em;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 0.5em;
                transition: all 0.1s ease-in 0s;
                cursor: pointer;
                border-top-left-radius: 0.5em;
                border-bottom-left-radius: 0.5em;
                color: var(--gray-400);
            }
            
            #contacts:hover {
                background-color: var(--gray-100);
            }
            
            #recipient {
                flex: 1;
                background: transparent;
                border: none;
                color: var(--gray-700);
                font-weight: 500;
                outline: none;
            }
            
            #recipient::placeholder {
                color: var(--gray-400);
            }
            
            #nextWrapper {
                padding: 0.5em;
            }
            
            .contact {
                display: flex;
                padding: 0.75em 0px;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s ease-in;
                border-radius: 0.5em;
            }
            
            .contact:hover {
                background: var(--gray-100);
            }
            
            .contactWrapper {
                display: flex;
                flex-flow: row;
                align-items: center;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                width: 100%;
            }
            
            .contactText {
                margin-left: 1em;
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }
            
            .contactName {
                margin: 0;
                color: var(--gray-700);
                font-weight: 600;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .contactLogo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
                overflow: hidden;
            }
            
            .contactAddress {
                margin: 0;
                color: var(--gray-400);
                text-overflow: ellipsis;
                overflow: hidden;
            }
            
            #nothingImg {
                height: 64px;
            }
        
            #nothingTitle {
                color: var(--gray-700);
                font-weight: 600;
            }
            
            #nothingSubtitle {
                color: var(--gray-400);
            }
        `;
    }

}

Stateful.define("send-token", SendToken)
