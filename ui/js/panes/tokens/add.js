class AddToken extends StatefulElement {

    render() {
        const [contract, setContract] = this.useState("contract", false)

        let content;

        if(!contract) content = this.step1(setContract)
        else content = this.step2()

        return `
            <bottom-popup>
                <div class="text-center">
                    ${content}
                </div>
            </bottom-popup>
        `;
    }

    step1(setContract){
        const _this = this

        const contractInput = this.registerFunction(e => {
            const val = e.target.value
            validateAddress(val).then(function(res){
                hasAsset(val).then(function(hasAsset){
                    _this.querySelector("#next").disabled = !res || hasAsset
                })
            })
        })

        const nextClick = this.registerFunction(() => {
            setContract(_this.querySelector("#contract").value)
        })

        return `
            <p class="text-center" id="title">Add a new token</p>
            <div class="mt-3">
                <p class="label text-left text-sm">Contract address</p>
                <input type="text" class="input col-12" placeholder="0x4b4c..." id="contract" oninput="${contractInput}">
            </div>
            <button class="button w-100 mt-3" id="next" disabled onclick="${nextClick}">Next</button>
        `
    }

    step2(){
        return `
            <p class="text-center" id="title">Add a new token</p>
            <div class="mt-3">
                <p class="label text-left text-sm">Contract address</p>
                <input type="text" class="input col-12" placeholder="0x4b4c..." id="contract">
            </div>
            <button class="button w-100 mt-3" id="next" disabled>Confirm</button>
        `
    }

    style(){
        return `
            #title {
                font-size: 1.25em;
            }
            
            .label {
                color: var(--gray-400);
            }
        `
    }

}

Stateful.define("add-token", AddToken)