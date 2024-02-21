class AddToken extends StatefulElement {

    render() {
        const [contract, setContract] = this.useState("contract", false)
        const [infos, setInfos] = this.useState("infos", false)
        const [error, setError] = this.useState("error", false)

        let content;

        if(infos) content = this.step2(infos)
        else content = this.step1(contract, setContract, setInfos, error, setError)

        return `
            <bottom-popup>
                <div class="text-center">
                    ${content}
                </div>
            </bottom-popup>
        `;
    }

    step1(contract, setContract, setInfos, error, setError){
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
            const contract = _this.querySelector("#contract").value
            getTokenDetails(contract).then(function(details){
                console.log(details)
                if(!details){
                    setError(true)
                    setContract(false)
                    return
                }
                setInfos(details)
            })
            setContract(contract)
        })

        const onFocus = this.registerFunction(() => {
            if(error) setError(false)
        })

        let button = `<button class="button w-100 mt-3" id="next" disabled onclick="${nextClick}">Next</button>`
        if(contract && !error) button = `<button class="button w-100 mt-3" id="next" disabled><i class="fas fa-spinner fa-pulse"></i></button>`

        let label = `<p class="label text-left text-sm">Contract address</p>`
        if(error) label = `<p class="label text-left text-sm" id="error">Invalid contract address</p>`

        return `
            <p class="text-center" id="title">Add a new token</p>
            <div class="mt-3">
                ${label}
                <input type="text" class="input col-12" placeholder="0x4b4c..." id="contract" onfocus="${onFocus}" oninput="${contractInput}" ${contract && !error ? "disabled" : ""}>
            </div>
            ${button}
        `
    }

    step2(infos){
        const _this = this

        const confirmClick = this.registerFunction(() => {
            addAsset(infos.name, infos.symbol, infos.decimals, infos.contract).then(function(){
                notyf.success("Added "+infos.symbol+"!")
                _this.resetParent()
                _this.remove()
            })
        })

        return `
            <p class="text-center" id="title">Add a new token</p>
            <div class="mt-3">
                <p class="label text-left text-sm">Name</p>
                <input type="text" class="input col-12" id="contract" disabled value="${infos.name}">
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm">Symbol</p>
                <input type="text" class="input col-12" id="contract" disabled value="${infos.symbol}">
            </div>
            <div class="mt-3">
                <p class="label text-left text-sm">Decimals</p>
                <input type="text" class="input col-12" id="contract" disabled value="${infos.decimals}">
            </div>
            <button class="button w-100 mt-3" id="next" onclick="${confirmClick}">Confirm</button>
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
            
            #error {
                color: var(--red-400);
            }
        `
    }

}

Stateful.define("add-token", AddToken)