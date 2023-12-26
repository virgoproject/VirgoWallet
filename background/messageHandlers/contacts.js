class ContactsHandlers {

    static register(){
        addBgMessageHandler("addContact", this.addContact)
        addBgMessageHandler("deleteContact", this.deleteContact)
        addBgMessageHandler("deleteFavorite", this.deleteFavorite)
        addBgMessageHandler("updateContact", this.updateContact)
        addBgMessageHandler("getContacts", this.getContacts)
    }

    static addContact(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res){

            const newContact = {
                name : request.name,
                address : request.address,
                note : request.note,
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
                    sendResponse("already")
                }

            }
        })
    }

    static deleteContact(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res) {

            for (var i=0 ; i < res.contactList.length ; i++)
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

    static deleteFavorite(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res) {
            for (var i=0 ; i < res.contactList.length ; i++) {
                if (res.contactList[i].address === request.address) {

                    if (res.contactList[i].favorite !== false) {
                        res.contactList[i].favorite = false
                    } else {
                        res.contactList[i].favorite = true
                    }
                }

            }
            browser.storage.local.set({"contactList": res.contactList})
        })
        return false
    }

    static updateContact(request, sender, sendResponse){
        browser.storage.local.get('contactList').then(function(res) {

            let nameSetter = ''
            let noteSetter = ''

            if (request.name === '')
                nameSetter = res.contactList[request.contactIndex].name
            else
                nameSetter = request.name


            if (request.note === ''){
                noteSetter = res.contactList[request.contactIndex].note
            } else {
                noteSetter = request.note

            }

            const updateContact = {
                name : nameSetter,
                address : res.contactList[request.contactIndex].address,
                note : noteSetter,
                favorite : res.contactList[request.contactIndex].favorite
            }

            res.contactList.splice(request.contactIndex, 1)
            res.contactList.splice(request.contactIndex, 0,updateContact)
            browser.storage.local.set({"contactList": res.contactList})

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

}

ContactsHandlers.register()
