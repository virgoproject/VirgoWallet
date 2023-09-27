document.getElementById("manageNetworks").onclick = () => {

    const list = document.getElementById("settingsNetworksList")

    list.innerHTML = ""

    const baseListElem = document.getElementById("settingsBaseNetwork")

    getBaseInfos().then(infos => {
        let i = 0

        for(let wallet of infos.wallets){
            wallet = wallet.wallet

            console.log(wallet)

            const elem = baseListElem.cloneNode(true)
            elem.id = ""
            elem.walletIndex = i
            elem.style.display = "block"
            elem.querySelector(".name").innerHTML = wallet.name
            elem.querySelector(".ticker").innerHTML = wallet.ticker

            $(elem).find(".logo").on('load', function() {
                $(elem).find("svg").hide()
                $(elem).find(".logo").show()
            }).attr("src", "https://raw.githubusercontent.com/virgoproject/tokens/main/" + wallet.chainID + "/logo.png");

            $(elem).find("svg").attr("data-jdenticon-value", wallet.name+wallet.chainID)

            if(wallet.tracked)
                elem.classList.add("selected")

            if(i == infos.selectedWallet){
                elem.querySelector(".name").innerHTML = wallet.name + " (current)"
                elem.classList.add("disabled")
            }else{
                elem.onclick = () => {
                    if(elem.classList.contains("selected")){
                        elem.classList.remove("selected")
                    }else{
                        elem.classList.add("selected")
                    }
                    changeNetworkVisibility(elem.walletIndex).then(() => {
                        selectChains.updateChains()
                    })
                }
            }

            list.appendChild(elem)

            i++
        }
    })

}

document.getElementById("settingsNetworkAddName").oninput = () => {
    settingsNetworkAddValidate()
}

document.getElementById("settingsNetworkAddRPC").oninput = () => {
    settingsNetworkAddValidate()
}

document.getElementById("settingsNetworkAddId").oninput = () => {
    settingsNetworkAddValidate()
}

document.getElementById("settingsNetworkAddSymbol").oninput = () => {
    settingsNetworkAddValidate()
}

document.getElementById("settingsNetworkAddExplorer").oninput = () => {
    settingsNetworkAddValidate()
}

function settingsNetworkAddValidate(){

    const name = document.getElementById("settingsNetworkAddName");
    const rpc = document.getElementById("settingsNetworkAddRPC");
    const chainID = document.getElementById("settingsNetworkAddId");
    const symbol = document.getElementById("settingsNetworkAddSymbol");
    const explorer = document.getElementById("settingsNetworkAddExplorer");
    const button = document.getElementById("settingsNetworkAddConfirm");
    const errorText = document.getElementById("settingsNetworkAddError");

    let err = false

    if(name.value.length == 0)
        err = true

    if(name.value.length > 12){
        name.classList.add("is-invalid")
        err = true
    }else{
        name.classList.remove("is-invalid")
    }

    if(rpc.value.replace(/\s/g,'') == "")
        err = true

    if(rpc.value.replace(/\s/g,'') != "" && !Utils.isValidUrl(rpc.value.replace(/\s/g,''))){
        rpc.classList.add("is-invalid")
        err = true
    }else{
        rpc.classList.remove("is-invalid")
    }

    if(chainID.value.replace(/\s/g,'') == "")
        err = true

    if(chainID.value.replace(/\s/g,'') != "" && chainID.value.replace(/\s/g,'') >>> 0 !== parseFloat(chainID.value.replace(/\s/g,''))){
        chainID.classList.add("is-invalid")
        err = true
    }else{
        chainID.classList.remove("is-invalid")
    }

    if(symbol.value.length == 0)
        err = true

    if(symbol.value.length > 8){
        symbol.classList.add("is-invalid")
        err = true
    }else{
        symbol.classList.remove("is-invalid")
    }

    if(explorer.value.replace(/\s/g,'') != "" && !Utils.isValidUrl(explorer.value.replace(/\s/g,''))){
        explorer.classList.add("is-invalid")
        err = true
    }else{
        explorer.classList.remove("is-invalid")
    }

    button.disabled = err
    errorText.style.display = "none"
}

document.getElementById("settingsNetworkAddConfirm").onclick = () => {
    const name = document.getElementById("settingsNetworkAddName");
    const rpc = document.getElementById("settingsNetworkAddRPC");
    const chainID = document.getElementById("settingsNetworkAddId");
    const symbol = document.getElementById("settingsNetworkAddSymbol");
    const explorer = document.getElementById("settingsNetworkAddExplorer");
    const button = document.getElementById("settingsNetworkAddConfirm")
    const errorText = document.getElementById("settingsNetworkAddError");

    disableLoadBtn($(button))

    addNetwork(name.value, rpc.value.replace(/\s/g,''), chainID.value.replace(/\s/g,''), symbol.value.replace(/\s/g,''), explorer.value.replace(/\s/g,'')).then(res => {
        if(res.status == 0){
            errorText.style.display = "block"
            errorText.innerHTML = "Can't connect to network, please check your RPC URL"
            rpc.classList.add("is-invalid")
        }

        if(res.status == 1){
            errorText.style.display = "block"
            chainID.classList.add("is-invalid")
            errorText.innerHTML = "Network's chain ID doesn't correspond to provided one: Given " + chainID.value.replace(/\s/g,'') + ", received " + res.id
        }

        if(res.status == 2){
            document.getElementById("manageNetworks").onclick()
            document.querySelector("#settings .settingsPane .back").onclick()
            notyf.success("Successfully added " + name.value.replace(/\s/g,'') + "!")
        }

        enableLoadBtn($(button))
    })
}
