class ContactsPane {

    static input = {
        userInput: $('contactUser'),
        setContactAddressInput: $('#contacts .addressInput'),
        setContactNameInput: $('#contacts .nameInput'),
        setContactNoteInput: $('#contacts .noteInput'),
        setContactFavoriteInput: $('#contacts .contactFavoriteInput'),
        setRecipentAddress: $('#body .send .sendForm .recipient'),
        changeContactName: $('#contacts .inputNameContact'),
        changeContactNote: $('#contacts .changeNote'),
        searchContact: $('#contactsSearch')
    }

    static div = {
        contacts: $('#contacts'),
        bodyContacts: $('#contacts #contactDiv'),
        contactsUsers: $('#contacts #contactDiv .contactUser'),
        formContact: $('#contacts #contactForm'),
        formContent: $('#contacts .contactFormContent'),
        noContactFound: $('#contacts .noContactFound'),
        contactList: $('#contacts #contactDiv .contactsList'),
        showMore : $('#contacts #contactDiv .showElements')
    }

    static loading = {
        loader: $('#contacts #contactDiv .loading')
    }

    static text = {
        title: $('#contacts .title'),
        addressText: $('#contacts #contactForm .addressText')
    }

    static buttons = {
        addContact: $('#contacts .addLogo'),
        goBack: $('#contacts .back'),
        addContactButtonForm: $('#contacts .addContactButton'),
        addItNow: $('#contacts #contactDiv .noContactFound span')

    }

    static extern = {
        payForm: $("#body .send .sendForm")
    }

    constructor() {

        ContactsPane.buttons.addContact.click(function (e) {
            $(this).hide()
            ContactsPane.div.bodyContacts.hide()
            ContactsPane.input.setContactAddressInput.val("")
            ContactsPane.input.setContactNameInput.val("")
            ContactsPane.input.setContactNoteInput.val("")
            ContactsPane.input.setContactFavoriteInput.prop('checked', false)
            ContactsPane.div.formContact.show()
            ContactsPane.text.title.html('Add contact')

        })


        ContactsPane.buttons.addItNow.click(function (e) {
            ContactsPane.buttons.addContact.click()
        })

        ContactsPane.buttons.addContactButtonForm.click(function (e) {
            disableLoadBtn(ContactsPane.buttons.addContactButtonForm)

            if (ContactsPane.input.setContactNameInput.val() !== "" || ContactsPane.input.setContactAddressInput.val() !== "") {
                validateAddress(ContactsPane.input.setContactAddressInput.val()).then(function (res) {
                    if (!res) {
                        ContactsPane.input.setContactAddressInput.addClass("is-invalid")
                        ContactsPane.text.addressText.text('Invalid address')
                        enableLoadBtn(ContactsPane.buttons.addContactButtonForm)
                        return false
                    }

                    ContactsPane.input.setContactAddressInput.removeClass("is-invalid")
                    ContactsPane.text.addressText.text('')

                    addingContact(ContactsPane.input.setContactAddressInput.val(), ContactsPane.input.setContactNameInput.val(), ContactsPane.input.setContactNoteInput.val(), ContactsPane.input.setContactFavoriteInput.is(':checked')).then(function (result) {
                            if (result !== "already") {
                                notyf.success(ContactsPane.input.setContactNameInput.val() + " added to contacts!")
                                ContactsPane.text.title.html('Contacts')
                                ContactsPane.loadContacts()
                                ContactsPane.div.formContact.hide()
                                ContactsPane.buttons.addContact.show()
                                ContactsPane.div.bodyContacts.show()
                                enableLoadBtn(ContactsPane.buttons.addContactButtonForm)
                            } else {
                                notyf.error("This contact already exists")
                                enableLoadBtn(ContactsPane.buttons.addContactButtonForm)
                            }
                        }
                    )

                })
            }
        })

        ContactsPane.input.searchContact.on("change keyup paste", function () {

            const searchValue = $(this).val()
            ContactsPane.div.contactList.html("")
            ContactsPane.loading.loader.show()

            if (searchValue === "") {
                ContactsPane.loadContacts()
                return
            }

            getContacts().then(function (contacts) {
                const result = contacts.filter(record =>
                    record.name.toLowerCase().includes(searchValue.toLowerCase())
                )

                if (result.length <= 0) {
                    ContactsPane.loading.loader.hide()
                    ContactsPane.div.noContactFound.show()
                }

                ContactsPane.loadContacts(result)
            })


        })


        ContactsPane.input.setContactAddressInput.on("change keyup paste", function () {
            ContactsPane.input.setContactAddressInput.removeClass("is-invalid")
            ContactsPane.text.addressText.text('')
            if (ContactsPane.input.setContactAddressInput.val() !== "" && ContactsPane.input.setContactNameInput.val() !== "") {
                ContactsPane.buttons.addContactButtonForm.prop("disabled", false)
            } else {
                ContactsPane.buttons.addContactButtonForm.prop("disabled", true)
            }
        })

        ContactsPane.input.setContactNameInput.on("change keyup paste", function () {
            if (ContactsPane.input.setContactAddressInput.val() !== "" && ContactsPane.input.setContactNameInput.val() !== "") {
                ContactsPane.buttons.addContactButtonForm.prop("disabled", false)
            } else {
                ContactsPane.buttons.addContactButtonForm.prop("disabled", true)
            }
        })

        ContactsPane.buttons.goBack.click(function (e) {
            ContactsPane.loadContacts()
            if (ContactsPane.div.bodyContacts.is(":visible")) {
                ContactsPane.div.bodyContacts.hide()
                ContactsPane.div.formContact.hide()
                ContactsPane.div.contacts.hide()
                ContactsPane.extern.payForm.show()
                hideStatsBar()
            } else {
                ContactsPane.div.bodyContacts.show()
                ContactsPane.extern.payForm.show()
                ContactsPane.buttons.addContact.show()
                ContactsPane.div.formContact.hide()
                ContactsPane.text.title.html('Contacts')
                hideStatsBar()
            }
        })
    }

    static loadContacts(res) {
        ContactsPane.loading.loader.show()

        let checkRes = ""
        if (res === undefined || res === [])
            checkRes = getContacts()
        else
            checkRes = Promise.resolve(res)

        checkRes.then(res => {
            SendPane.divContactList.html("")

            if (res === false) {
                ContactsPane.div.noContactFound.show()
                ContactsPane.loading.loader.hide()
                return;

            }

            if (res.length <= 0) {
                ContactsPane.div.noContactFound.show()
                ContactsPane.loading.loader.hide()

                return
            }


            res.sort(function (x, y) {
                if (x.favorite && y.favorite) return 0
                if (x.favorite) return -1
                if (y.favorite) return 1
            })

            ContactsPane.div.noContactFound.hide()

            for (let l = 0; l < res.length; l++) {
                const element = SendPane.divContactClone.clone()
                element.css('cursor','pointer')
                element.find('.inputNameContact').val(res[l].name)
                element.find('.textAddress').html(res[l].address)

                element.find(".inputNameContact").click(function(e){
                    e.stopPropagation()
                })

                element.click(function (e) {
                    $("#body .send .sendForm .recipient").val(res[l].address)
                    $("#body .send .sendForm .submit").click()
                    ContactsPane.div.contacts.hide()
                })

                element.find('.fa-star').attr('data-address',res[l].address).click(e => {

                    e.stopPropagation()

                    if ($(e.target).hasClass('fas')) {
                        $(e.target).removeClass('fas').addClass('fal').css('color', 'unset')
                    } else {
                        $(e.target).removeClass('fal').addClass('fas').css('color', 'rgb(247, 208, 108)')
                    }
                    let idFavorite = element.find('.bg-danger').attr('data-address')
                    deleteFavorite(idFavorite)
                })

                if (res[l].favorite)
                    element.find('.fa-star').removeClass("fal fa-star").addClass('fas fa-star').css('color', '#F7d06c')

                element.find('.noteContact').html(res[l].note)
                element.find('svg').attr("data-jdenticon-value", res[l].address)
                element.find('.notesPart').hide()
                element.find('.changeContact').attr('data-index', l).click(function () {
                    updateContact($(this).attr('data-index'), element.find('.inputNameContact').val(), element.find('.changeNote').val())
                    element.find('.showElements').click()
                    notyf.success("Contact updated!")
                })

                element.find('.deleteContact').attr('id', l).attr('data-address',res[l].address).click(function () {
                    deleteContact($(this).attr('data-address'))
                    element.remove()
                    if (ContactsPane.div.contactList.children().length <= 0)
                        ContactsPane.div.noContactFound.show()
                })

                element.find('.showElements').click(e => {
                    e.stopPropagation()

                    if ($(this).hasClass('opened')) {
                        $(this).removeClass('opened')
                        $(this).css('transform', "rotate(0deg)")
                        element.find('.inputNameContact').prop( "disabled", true ).css('cursor','')

                        $(this).parent().find('.notesPart').hide()
                    } else {
                        $(this).addClass('opened')
                        $(this).css('transform', "rotate(90deg)")
                        element.find('.notesPart').show()
                        element.find('.inputNameContact').prop( "disabled", false ).css('cursor','pointer')
                        $(this).parent().find('.notesPart').show()
                    }
                })

                element.onclick = () => {
                    $("#body .send .sendForm .recipient").val(res[l].address)
                    $("#body .send .sendForm .submit").click()
                }

                element.show()
                SendPane.divContactList.append(element)
                ContactsPane.loading.loader.hide()
            }
            jdenticon()

        })
    }

}

const contactsPanel = new ContactsPane()
