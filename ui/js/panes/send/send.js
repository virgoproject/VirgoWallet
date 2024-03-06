class SendToken extends StatefulElement {

    render() {

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

            for(const transaction of baseInfos.wallets[baseInfos.selectedWallet].wallet.transactions){
                if(recent.length >= 5) break
                if(recent.includes(transaction.recipient)) continue
                if(transaction.contractAddr != MAIN_ASSET.ticker && !await validateAddress(transaction.contractAddr)) continue

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

        return `
            <div id="wrapper">
                <section-header title="Send tokens"></section-header>
                <div class="row m-0">
                    <div class="col-4 p-0 pr-2">
                        <button class="button w-100" id="send"><i class="fa-solid fa-arrow-up"></i> Send</button>
                    </div>
                    <div class="col-4 px-1">
                        <button class="button w-100" id="receive"><i class="fa-solid fa-arrow-down"></i> Receive</button>
                    </div>
                    <div class="col-4 p-0 pl-2">
                        <button class="button w-100" id="buy"><i class="fa-solid fa-dollar-sign"></i> Buy</button>
                        <span id="soon">soon!</span>
                    </div>
                </div>
                <p class="mt-3 mb-0 label">To</p>
                <div id="recipientWrapper">
                    <div id="contacts" onclick="${contactsClick}">
                        <i class="fa-solid fa-address-book text-xl"></i>
                    </div>
                    <input type="text" placeholder="Recipient address" id="recipient">
                    <div id="nextWrapper">
                        <button id="next" class="button"><i class="fa-regular fa-arrow-right"></i></button>
                    </div>
                </div>
                <scroll-view id="scroll" class="d-block mt-3">
                    <div class="mb-5 pb-5">
                        ${this.getRows(data.favoriteContacts, "Favorite")}
                        <div class="pt-3">
                            ${this.getRows(data.recent, "Recent")}    
                        </div>
                    </div>
                </scroll-view>
            </div>
        `;
    }

    getRows(list, label){
        if(list.length == 0) return ""

        const rows = []

        for(const item of list){
            if(item.name !== undefined){
                rows.push(`
                    <div class="contact mb-2 px-3" address="${item.address}">
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
                    <div class="contact mb-2 px-3" address="${item.address}">
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
            
            #buy {
                color: var(--mainColor);
                background: #F3F3F3;
                opacity: 0.6;
                cursor: default;
            }
            
            #receive {
                color: var(--mainColor);
                background: #F3F3F3;
                transition: all ease-in 0.1s;
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
        `;
    }

}

Stateful.define("send-token", SendToken)
