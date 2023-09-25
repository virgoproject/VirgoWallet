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