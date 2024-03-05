class ContactsList extends StatefulElement {

    async render() {

        const _this = this

        const [reset, setReset] = this.useState("reset", false)

        const {data, loading} = this.useFunction(async () => {
            return await getContacts()
        })

        if(loading) return ""

        this.boxNumber = 15

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onNearEnd = this.registerFunction(() => {
            if(_this.boxNumber >= data.length) return

            const oldBoxNum = _this.boxNumber
            _this.boxNumber = Math.min(_this.boxNumber+5, data.length)

            const scroll = _this.querySelector("#inner")

            for(const row of _this.getRows(data, oldBoxNum, _this.boxNumber)){
                scroll.insertAdjacentHTML("beforeend", row)
            }

        })

        if(this.boxNumber > data.length) this.boxNumber = data.length

        const rows = this.getRows(data, 0, this.boxNumber)

        const onSearch = this.registerFunction(async val => {
            if(val == ""){
                setReset(!reset)
                return
            }

            let result
            if(await validateAddress(val)){
                result = data.filter(record =>
                    record.address.toLowerCase().includes(val.toLowerCase()) ||
                    record.name.toLowerCase().includes(val.toLowerCase())
                )
            }else{
                result = data.filter(record =>
                    record.name.toLowerCase().includes(val.toLowerCase())
                )
            }

            if(result.length == 0){
                _this.querySelector("#inner").innerHTML = `
                    <div class="text-center mt-5 mb-5">
                        <img src="../images/notFound.png" class="img-fluid" />
                        <h4>Contact not found!</h4>
                    </div>
                `
                return
            }

            const rows = _this.getRows(result, 0, result.length)
            _this.querySelector("#inner").innerHTML = this.sanitizeHTML(rows)
        })

        const onScrollUp = this.registerFunction(() => {
            _this.querySelector("#search").show()
        })

        const onScrollDown = this.registerFunction(() => {
            _this.querySelector("#search").hide()
        })

        const addContactClick = this.registerFunction(() => {
            const elem = document.createElement("add-contact")
            elem.resetParent = () => {
                _this.runFunctions()
            }
            document.body.appendChild(elem)
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Contacts" backfunc="${back}"></section-header>
                    <search-bar inputhandler="${onSearch}" id="search" placeholder="Search for a contact"></search-bar>
                    <scroll-view id="scroll" onnearend="${onNearEnd}" onscrollup="${onScrollUp}" onscrolldown="${onScrollDown}">
                        <div id="inner" class="px-3">
                            ${rows}
                        </div>
                    </scroll-view>
                    <div class="p-3">
                        <button class="button w-100" onclick="${addContactClick}">Add a contact</button>              
                    </div>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            #scroll {
                flex-grow: 1;
                min-height: 0;
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
            
            .contact.selected {
                background: var(--gray-100);
                cursor: default;
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
                margin-right: 1em;
            }
            
            .contactName {
                margin: 0;
                color: var(--gray-700);
                font-weight: 600;
            }
            
            .contactLogo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
                overflow: hidden;
            }
            
            .contactRightIcon {
                padding-top: 4px;
                color: var(--gray-400);
            }
            
            .contactAddress {
                margin: 0;
                color: var(--gray-400);
                text-overflow: ellipsis;
                overflow: hidden;
            }
        `;
    }

    getRows(data, min, max) {
        const rows = []

        for (let i = min; i < max; i++) {
            const contact = data[i]

            try {
                rows.push(`
                    <div class="contact mb-2 px-3">
                        <div class="contactWrapper">
                            <div class="contactLogo">${jdenticon.toSvg(contact.address, 36)}</div>
                            <div class="contactText">
                                <p class="contactName">${contact.name}</p>
                                <p class="contactAddress text-sm">${contact.address}</p>
                            </div>
                            <i class="fa-regular fa-chevron-right text-xl contactRightIcon"></i>
                        </div>
                    </div>
                `)
            }catch (e) {}
        }

        return rows
    }

}

Stateful.define("contacts-list", ContactsList)
