class ContactsHandlers {

    static register(){
        addBgMessageHandler("addContact", this.addContact)
        addBgMessageHandler("deleteContact", this.deleteContact)
        addBgMessageHandler("updateContact", this.updateContact)
        addBgMessageHandler("getContacts", this.getContacts)
        addBgMessageHandler("getContact", this.getContact)
    }

    static addContact(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res){

            const newContact = {
                name : request.name,
                address : request.address,
                favorite : request.favorite
            }

            if(res.contactList === undefined) {
                browser.storage.local.set({"contactList": [newContact]})
                sendResponse(true)
            } else {
                const result = res.contactList.filter(record =>
                    record.address === request.address)

                if (result.length <= 0){
                    res.contactList.push(newContact)
                    browser.storage.local.set({"contactList": res.contactList})
                    sendResponse(true)
                } else {
                    sendResponse(false)
                }
            }
        })
    }

    static deleteContact(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res) {

            for (let i = 0; i < res.contactList.length; i++)
            {
                if (res.contactList[i].address === request.address) {
                    res.contactList.splice(i, 1)
                    browser.storage.local.set({"contactList": res.contactList})
                    sendResponse(true)
                    break
                }
            }

        })
    }

    static updateContact(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res) {

            for (let i = 0; i < res.contactList.length; i++) {
                if (res.contactList[i].address === request.address) {

                    if(request.name != "")
                        res.contactList[i].name = request.name

                    res.contactList[i].favorite = request.favorite
                    browser.storage.local.set({"contactList": res.contactList})
                    sendResponse(true)
                    break
                }

            }
        })
        return false
    }

    static getContacts(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res) {
            if(res.contactList !== undefined){
                sendResponse(res.contactList)
            }else {
                sendResponse([])
            }

        })
    }

    static getContact(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res) {
            for (let i = 0; i < res.contactList.length; i++) {
                if (res.contactList[i].address === request.address) {
                    sendResponse(res.contactList[i])
                    break
                }
            }
        })
    }

}

ContactsHandlers.register()
