class AddContact extends StatefulElement {

    async render() {

        const _this = this

        const validateInputs = this.registerFunction(async () => {
            const address = _this.querySelector("#address")
            const name = _this.querySelector("#name")

            _this.querySelector("#next").disabled = !(await validateAddress(address.value) && name.value.trim() != "")
        })

        const confirmClick = this.registerFunction(e => {
            const address = _this.querySelector("#address")
            const name = _this.querySelector("#name")
            const checkbox = _this.querySelector("#checkbox")

            address.disabled = name.disabled = checkbox.disabled = e.target.disabled = true

            addContact(address.value, name.value, checkbox.checked).then(res => {
                if(res){
                    notyf.success("Contact added!")
                    _this.resetParent()
                    _this.remove()
                }else{
                    const addressLabel = _this.querySelector("#addressLabel")
                    addressLabel.classList.add("error")
                    addressLabel.innerHTML = "Contact already exists"
                    address.disabled = name.disabled = checkbox.disabled = false
                }
            })
        })

        const onFocus = this.registerFunction(e => {
            const addressLabel = _this.querySelector("#addressLabel")
            addressLabel.classList.remove("error")
            addressLabel.innerHTML = "Address"
        })

        return `
            <bottom-popup>
                <div class="text-center">
                    <p class="text-center text-xl" id="title">Add a contact</p>
                    <div class="mt-3">
                        <p class="label text-left text-sm" id="addressLabel">Address</p>
                        <input type="text" class="input col-12" placeholder="0x4b4c..." id="address" oninput="${validateInputs}" onfocus="${onFocus}">
                    </div>
                    <div class="mt-3">
                        <p class="label text-left text-sm">Name</p>
                        <input type="text" class="input col-12" placeholder="Satoshi" id="name" oninput="${validateInputs}" onfocus="${onFocus}">
                    </div>
                    <div class="mt-3 d-flex justify-content-between align-items-center">
                        <p class="label text-left text-sm">Favorite</p>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="checkbox" onfocus="${onFocus}">
                        </div>
                    </div>
                    <button class="button w-100 mt-3" id="next" disabled onclick="${confirmClick}">Confirm</button>
                </div>
            </bottom-popup>
        `;
    }

    style() {
        return `
            
            #checkbox {
                width: 2.5em;
                height: 1.25em;
                cursor: pointer;
            }
        `;
    }

}

Stateful.define("add-contact", AddContact)
