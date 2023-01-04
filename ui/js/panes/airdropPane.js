class AirdropPane{

    static div = {
         header: $('#mainPane .header'),
        airdropBody : document.querySelector('.airdropBody'),
        airdropHeader : document.querySelector('.airdrop .airdropHeader'),
        airdropLoadingBody : document.querySelector('.airdropLoadingBody')
    }

    static airdropCard = {
        loadingpassedAirdrop : document.querySelector('.airdrop .loadingendedAirdrop'),
        airdropExemple : document.querySelector('.airdropExemple'),
        upcomingAirdropExemple : document.querySelector('.upcomingAirdropExemple'),
        endedairdropExemple : document.querySelector('.endedAirdropExemple'),
        winnedAmmount : document.querySelector('.airdrop .winnedAmmount'),
        decimalTotalEarn : document.querySelector('.decimalValue'),
        claimBn : document.querySelector('.claimDropReward')
    }
    constructor() {
        this.userState = false
        this.loadedAirdrop = false
        this.loadeduppcoming = false
        this.loadedpassed = false
        this.notyf = new Notyf();
        AirdropPane.airdropCard.claimBn.addEventListener('click', (event) => {
            getBaseInfos().then(function (infos) {
                fetch('https://airdrops.virgo.net:2053/api/getreward',{
                    method: "POST",
                    body: JSON.stringify({address: infos.addresses[0].address}),
                    headers: {'Content-Type': 'application/json'}
                }).then( res => {
                    document.querySelector('.airdropHeader .notifReward').style.display = "none"
                    AirdropPane.airdropCard.claimBn.disabled = true
                    notyf.success("Successfully claimed! You'll receive your coins in under 24h!")
                })
            })
        })
    }

    checkAirdropPane(elem){
        if (elem.attr("data-target") !== "airdrop"){
            $('#mainPane .header').show()

            let airdropSetter = document.querySelectorAll('.airdropSetter')
            for(let i =0; airdropSetter.length > i; i++){
                airdropSetter[i].remove()
            }

        }else {
            $('#mainPane .header').hide()
            airdropPane.loadUserStats()
            airdropPane.loadActiveDrops()
            airdropPane.loadUpcomingDrops()
            airdropPane.loadpassedDrops()

        }
    }
    loadUserStats(){
        getBaseInfos().then(function (infos) {
            fetch('https://airdrops.virgo.net:2053/api/user/stats',{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({address: infos.addresses[0].address})
            }).then(response => response.json())
                .then(res => {
                        let totalEarnings
                        let earningsDeciaml
                        let airdropParticipated = res[0].length
                        let airdropWon = res[1].length
                        let waitingWithdraw = res[2].length
                        if (res[3][0] === undefined || res[3][0] === null) {
                            totalEarnings = 0
                            earningsDeciaml = ".0"
                                } else {
                            totalEarnings = res[3][0].earnings
                            earningsDeciaml =  "." + totalEarnings.toString().split('.')[1]
                        }
                        document.getElementById("airdropsParticipationCount").innerHTML = airdropParticipated
                        document.querySelector('.airdropHeader .wondrops').innerHTML = airdropWon
                        document.querySelector('.airdropHeader .winnedAmmount').innerHTML = totalEarnings.toFixed(0)
                        document.querySelector('.airdropHeader .decimalValue').innerHTML = earningsDeciaml
                        airdropPane.userState = true
                        airdropPane.checkLoadingState()
                        if (waitingWithdraw > 0) {
                            document.querySelector('.airdropHeader .notifReward').style.display = "flex"
                            document.querySelector('.airdropHeader .notifReward').innerHTML = waitingWithdraw
                        } else {
                            AirdropPane.airdropCard.claimBn.disabled = true
                        }
                })
        })
    }
    loadActiveDrops(){
        fetch('https://airdrops.virgo.net:2053/api/activedrops', {
            method : 'GET',
            headers: {'Content-Type': 'application/json'}

        }).then(response => response.json())
            .then(res => {
                let onGoingSection = document.getElementById('onGoingAirdrop')
                if (res.length <= 0) {
                    onGoingSection.classList.add('d-none')
                    onGoingSection.classList.remove('d-flex')
                } else {
                    onGoingSection.classList.add('d-flex')
                    onGoingSection.classList.remove('d-none')
                }
                this.loadedAirdrop = true
                airdropPane.checkLoadingState()
                for (let i = 0; res.length > i; i++){
                    tickerFromChainID(res[i].chainID).then(function (infos) {
                        if (!infos) return
                        let chain = infos.wallet.ticker
                        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+chain+"/"+res[i].address+"/infos.json", {
                            method: 'GET',
                            headers: {'Content-Type': 'application/json'}
                        }).then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                        }).then(results => {
                                if (results) {
                                    console.log(results)
                                    const day = 24 * 60 * 60 * 1000;
                                    let dateStart = new Date(res[i].startDate)
                                    let dateEnd = new Date(res[i].endDate)
                                    let socials = JSON.parse(res[i].socials)
                                    let elem = AirdropPane.airdropCard.airdropExemple.cloneNode(true)
                                    elem.classList.add('d-flex')
                                    elem.classList.remove('d-none')
                                    elem.querySelector('.coinName').innerHTML = results.name
                                    elem.classList.remove('airdropExemple')
                                    elem.classList.add('airdropSetter')
                                    elem.querySelector('.coinTicker').innerHTML = results.ticker
                                    elem.querySelector('.earnCoin').innerHTML = (res[i].reward / res[i].winnersCount).toFixed(0) + " " + results.ticker
                                    elem.querySelector('.timeLeft').innerHTML = Math.round(Math.abs((dateStart - dateEnd) / day))
                                    elem.querySelector('.winnersCount').innerHTML = res[i].winnersCount
                                    elem.querySelector('.usersJoined').innerHTML = res[i].userJoined
                                    elem.querySelector('.airdropDesc').innerHTML = res[i].description
                                    elem.querySelector('.joinDrop').id = res[i].id
                                    elem.querySelector('.airdropedCoinImg').src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + chain + "/" + res[i].address + "/logo.png"
                                    elem.querySelector('.airdropCoinInfos').classList.add('d-none')

                                    elem.querySelector('.joinDrop').addEventListener('click', (e) => {
                                        let elemClicked = e.currentTarget
                                        elemClicked.textContent = "Airdrop joined"
                                        e.currentTarget.disabled = true
                                        getBaseInfos().then(function (infos) {
                                            const playAddress = infos.addresses[0].address
                                            setAirdropPlay(playAddress,elemClicked.id).then(function (infos) {
                                                    if(infos){
                                                        let elemjoined = elem.querySelector('.usersJoined')
                                                        let cntJoined = elemjoined.textContent
                                                        let userNmb = Number(cntJoined)
                                                        elemjoined.innerHTML = userNmb + 1

                                                        let totalParticipated = document.getElementById("airdropsParticipationCount")
                                                        let total = totalParticipated.textContent
                                                        let nmb = Number(total)
                                                        totalParticipated.innerHTML = nmb + 1
                                                    }
                                                let userInfos = {
                                                    airdropID : elemClicked.id,
                                                    address : playAddress
                                                }
                                                fetch('https://airdrops.virgo.net:2053/api/airdropsetplay',{
                                                    method : "POST",
                                                    body : JSON.stringify(userInfos),
                                                    headers: {'Content-Type': 'application/json'}
                                                })
                                            })
                                        })
                                    })

                                    let socialsLinks = elem.querySelectorAll(".cryptoMedia a")
                                    for(let i =0 ; socialsLinks.length > i; i++){
                                        socialsLinks[i].addEventListener('click', (e) => {
                                            browser.windows.create({
                                                url: socialsLinks[i].href
                                            })
                                        })
                                    }

                                    elem.querySelector('.cryptoMedia .cmc svg').addEventListener('click', (e) => {
                                        let clickedElem = e.currentTarget
                                        browser.windows.create({
                                            url: clickedElem.href
                                        })
                                    })

                                    getBaseInfos().then(function (preset) {
                                        let btn = elem.querySelector('.joinDrop')
                                        checkAirdropPlay(preset.addresses[0].address,btn.id).then(function (state) {
                                            if (state){
                                                btn.enabled = true
                                            }else {
                                                btn.disabled = true
                                                btn.textContent = "Airdrop joined"
                                            }
                                        })
                                    })



                                    if (socials.twitter !== ''){
                                        elem.querySelector('.fa-twitter').href = socials.twitter
                                        elem.querySelector('.twitter').classList.remove('d-none')
                                        elem.querySelector('.twitter').classList.add('d-flex')
                                    }

                                    if (socials.discord !== ''){
                                        elem.querySelector('.fa-discord').href = socials.discord
                                        elem.querySelector('.discord').classList.remove('d-none')
                                        elem.querySelector('.discord').classList.add('d-flex')

                                    }

                                   if (socials.cmc !== ''){
                                        elem.querySelector('.cryptoMedia .cmc svg').href = socials.cmc
                                        elem.querySelector('.cmc').classList.remove('d-none')
                                        elem.querySelector('.cmc').classList.add('d-flex')
                                    }

                                    if (socials.telegram !== ''){
                                        elem.querySelector('.fa-telegram').href = socials.telegram
                                        elem.querySelector('.telegram').classList.remove('d-none')
                                        elem.querySelector('.telegram').classList.add('d-flex')
                                    }

                                    if (socials.website !== ''){
                                        elem.querySelector('.fa-link').href = socials.website
                                        elem.querySelector('.website').classList.remove('d-none')
                                        elem.querySelector('.website').classList.add('d-flex')
                                    }

                                    elem.querySelector('.fa-chevron-right').addEventListener('click', (e) => {
                                        let infosDom = elem.querySelector('.airdropCoinInfos')
                                        if (infosDom.classList.contains('d-none')) {
                                            infosDom.classList.remove('d-none')
                                            infosDom.classList.add('d-flex')
                                            e.currentTarget.style.transform = 'rotate(90deg)'
                                        } else {
                                            infosDom.classList.add('d-none')
                                            infosDom.classList.remove('d-flex')
                                            e.currentTarget.style.transform = 'rotate(0deg)'
                                        }
                                    })
                                    document.querySelector(".airdropActive").appendChild(elem)
                                }
                        })
                })
                }
                AirdropPane.airdropCard.airdropExemple.classList.add('d-none')
            })
    }
    loadUpcomingDrops(){
        fetch('https://airdrops.virgo.net:2053/api/upcomingairdrop', {
            method : 'GET',
            headers: {'Content-Type': 'application/json'}

        }).then(response => response.json())
            .then(res => {
                let upcomingAirdropSection = document.getElementById('upcomingAirdrop')
                if (res.length <= 0){
                    AirdropPane.airdropCard.upcomingAirdropExemple.classList.add('d-none')
                    upcomingAirdropSection.classList.add('d-none')
                    upcomingAirdropSection.classList.remove('d-flex')
                } else {
                    upcomingAirdropSection.classList.add('d-flex')
                    upcomingAirdropSection.classList.remove('d-none')
                }

                airdropPane.loadeduppcoming = true
                airdropPane.checkLoadingState()

                for (let i = 0; res.length > i; i++) {
                    tickerFromChainID(res[i].chainID).then(function (infos) {
                        if (!infos) return
                        let chain = infos.wallet.ticker
                        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + chain + "/" + res[i].address + "/infos.json", {
                            method: 'GET',
                            headers: {'Content-Type': 'application/json'}
                        }).then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                        }).then(results => {
                            if (results) {
                                const day = 24 * 60 * 60 * 1000;
                                let dateStart = new Date(res[i].startDate)
                                let dateEnd = new Date(res[i].endDate)
                                let socials = JSON.parse(res[i].socials)
                                let elem = AirdropPane.airdropCard.upcomingAirdropExemple.cloneNode(true)
                                elem.classList.add('d-flex')
                                elem.classList.remove('d-none')
                                elem.classList.remove('upcomingAirdropExemple')
                                elem.classList.add('airdropSetter')
                                elem.querySelector('.coinName').innerHTML = results.name
                                elem.querySelector('.coinTicker').innerHTML = results.ticker
                                elem.querySelector('.earnCoin').innerHTML = (res[i].reward / res[i].winnersCount).toFixed(0) + " " + results.ticker
                                elem.querySelector('.winnersCount').innerHTML = res[i].winnersCount
                                elem.querySelector('.usersJoined').innerHTML = res[i].userJoined
                                elem.querySelector('.airdropDesc').innerHTML = res[i].description
                                elem.querySelector('.joinDrop').disabled = true
                                elem.querySelector('.airdropedCoinImg').src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + chain + "/" + res[i].address + "/logo.png"
                                elem.querySelector('.airdropCoinInfos').classList.add('d-none')

                                   let socialsLinks = elem.querySelectorAll(".cryptoMedia a")
                                   for(let i =0 ; socialsLinks.length > i; i++){
                                       socialsLinks[i].addEventListener('click', (e) => {
                                           browser.windows.create({
                                               url: socialsLinks[i].href
                                           })
                                       })
                                   }

                                elem.querySelector('.cryptoMedia .cmc svg').addEventListener('click', (e) => {
                                    let clickedElem = e.currentTarget
                                    browser.windows.create({
                                        url: clickedElem.href
                                    })
                                })


                                if (socials.twitter !== '') {
                                    elem.querySelector('.fa-twitter').href = socials.twitter
                                    elem.querySelector('.twitter').classList.remove('d-none')
                                    elem.querySelector('.twitter').classList.add('d-flex')
                                }

                                if (socials.discord !== '') {
                                    elem.querySelector('.fa-discord').href = socials.discord
                                    elem.querySelector('.discord').classList.remove('d-none')
                                    elem.querySelector('.discord').classList.add('d-flex')

                                }

                                if (socials.cmc !== '') {
                                    elem.querySelector('.cryptoMedia .cmc svg').href = socials.cmc
                                    elem.querySelector('.cmc').classList.remove('d-none')
                                    elem.querySelector('.cmc').classList.add('d-flex')
                                }

                                if (socials.telegram !== '') {
                                    elem.querySelector('.fa-telegram').href = socials.telegram
                                    elem.querySelector('.telegram').classList.remove('d-none')
                                    elem.querySelector('.telegram').classList.add('d-flex')
                                }

                                if (socials.website !== '') {
                                    elem.querySelector('.fa-link').href = socials.website
                                    elem.querySelector('.website').classList.remove('d-none')
                                    elem.querySelector('.website').classList.add('d-flex')
                                }



                                elem.querySelector('.fa-chevron-right').addEventListener('click', (e) => {
                                    let infosDom = elem.querySelector('.airdropCoinInfos')
                                    if (infosDom.classList.contains('d-none')) {
                                        infosDom.classList.remove('d-none')
                                        infosDom.classList.add('d-flex')
                                        e.currentTarget.style.transform = 'rotate(90deg)'
                                    } else {
                                        infosDom.classList.add('d-none')
                                        infosDom.classList.remove('d-flex')
                                        e.currentTarget.style.transform = 'rotate(0deg)'
                                    }
                                })
                                document.querySelector(".upcomingAirdrop").appendChild(elem)

                            }
                        })
                    })

                }
            })
    }
    loadpassedDrops(){
        fetch('https://airdrops.virgo.net:2053/api/endedairdrop', {
            method : 'GET',
            headers: {'Content-Type': 'application/json'}

        }).then(response => response.json())
            .then(res => {
                let endedAirdropSection = document.getElementById('endedAirdrop')

                if (res.length <= 0 ){
                    AirdropPane.airdropCard.endedairdropExemple.classList.add('d-none')
                    endedAirdropSection.classList.add('d-none')
                    endedAirdropSection.classList.remove('d-flex')
                } else {
                    endedAirdropSection.classList.add('d-flex')
                    endedAirdropSection.classList.remove('d-none')
                }

                airdropPane.loadedpassed = true
                airdropPane.checkLoadingState()

                for (let i = 0; res.length > i; i++) {
                    tickerFromChainID(res[i].chainID).then(function (infos) {
                        if (!infos) return
                        let chain = infos.wallet.ticker
                        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + chain + "/" + res[i].address + "/infos.json", {
                            method: 'GET',
                            headers: {'Content-Type': 'application/json'}
                        }).then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                        }).then(results => {
                            if (results) {
                                const day = 24 * 60 * 60 * 1000;
                                let dateStart = new Date(res[i].startDate)
                                let dateEnd = new Date(res[i].endDate)
                                let socials = JSON.parse(res[i].socials)
                                let elem = AirdropPane.airdropCard.endedairdropExemple.cloneNode(true)
                                elem.classList.add('d-flex')
                                elem.classList.remove('d-none')
                                elem.classList.remove('endedAirdropExemple')
                                elem.classList.add('airdropSetter')
                                elem.querySelector('.coinName').innerHTML = results.name
                                elem.querySelector('.coinTicker').innerHTML = results.ticker
                                elem.querySelector('.earnCoin').innerHTML = (res[i].reward / res[i].winnersCount).toFixed(0) + " " + results.ticker
                                elem.querySelector('.winnersCount').innerHTML = res[i].winnersCount
                                elem.querySelector('.usersJoined').innerHTML = res[i].userJoined
                                elem.querySelector('.airdropDesc').innerHTML = res[i].description
                                elem.querySelector('.joinDrop').disabled = true
                                elem.querySelector('.airdropedCoinImg').src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + chain + "/" + res[i].address + "/logo.png"
                                elem.querySelector('.airdropCoinInfos').classList.add('d-none')

                                let socialsLinks = elem.querySelectorAll(".cryptoMedia a")
                                for(let i =0 ; socialsLinks.length > i; i++){
                                    socialsLinks[i].addEventListener('click', (e) => {
                                        browser.windows.create({
                                            url: socialsLinks[i].href
                                        })
                                    })
                                }

                                elem.querySelector('.cryptoMedia .cmc svg').addEventListener('click', (e) => {
                                    let clickedElem = e.currentTarget
                                    browser.windows.create({
                                        url: clickedElem.href
                                    })
                                })


                                if (socials.twitter !== '') {
                                    elem.querySelector('.fa-twitter').href = socials.twitter
                                    elem.querySelector('.twitter').classList.remove('d-none')
                                    elem.querySelector('.twitter').classList.add('d-flex')
                                }

                                if (socials.discord !== '') {
                                    elem.querySelector('.fa-discord').href = socials.discord
                                    elem.querySelector('.discord').classList.remove('d-none')
                                    elem.querySelector('.discord').classList.add('d-flex')

                                }

                                if (socials.cmc !== '') {
                                    elem.querySelector('.cryptoMedia .cmc svg').href = socials.cmc
                                    elem.querySelector('.cmc').classList.remove('d-none')
                                    elem.querySelector('.cmc').classList.add('d-flex')
                                }

                                if (socials.telegram !== '') {
                                    elem.querySelector('.fa-telegram').href = socials.telegram
                                    elem.querySelector('.telegram').classList.remove('d-none')
                                    elem.querySelector('.telegram').classList.add('d-flex')
                                }

                                if (socials.website !== '') {
                                    elem.querySelector('.fa-link').href = socials.website
                                    elem.querySelector('.website').classList.remove('d-none')
                                    elem.querySelector('.website').classList.add('d-flex')
                                }



                                elem.querySelector('.fa-chevron-right').addEventListener('click', (e) => {
                                    let infosDom = elem.querySelector('.airdropCoinInfos')
                                    if (infosDom.classList.contains('d-none')) {
                                        infosDom.classList.remove('d-none')
                                        infosDom.classList.add('d-flex')
                                        e.currentTarget.style.transform = 'rotate(90deg)'
                                    } else {
                                        infosDom.classList.add('d-none')
                                        infosDom.classList.remove('d-flex')
                                        e.currentTarget.style.transform = 'rotate(0deg)'
                                    }
                                })
                                document.querySelector(".endedAirdrop").appendChild(elem)
                                AirdropPane.airdropCard.endedairdropExemple.classList.add('d-none')

                            }
                        })
                    })

                }
            })
    }

    checkLoadingState(){
        if(airdropPane.loadedAirdrop && airdropPane.userState && airdropPane.loadedpassed && airdropPane.loadeduppcoming){
            AirdropPane.div.airdropBody.classList.add('d-flex')
            AirdropPane.div.airdropHeader.classList.remove('d-none')
            AirdropPane.div.airdropBody.classList.remove('d-none')
            AirdropPane.div.airdropLoadingBody.classList.add('d-none')
            let activedrop = document.getElementById('onGoingAirdrop').classList.contains('d-none')
            let upcomingdrop = document.getElementById('upcomingAirdrop').classList.contains('d-none')
            let endeddrops = document.getElementById('endedAirdrop').classList.contains('d-none')
            if (activedrop && upcomingdrop && endeddrops){
                let noDataElem = document.getElementById('noDropsElems')
                noDataElem.classList.remove('d-none')
                noDataElem.classList.add('d-flex')
            }

        }
    }



}

const airdropPane = new AirdropPane()
