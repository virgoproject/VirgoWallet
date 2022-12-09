class AirdropPane{

    static div = {
         header: $('#mainPane .header'),
        airdropBody : document.querySelector('.airdropBody'),
        airdropLoadingBody : document.querySelector('.airdropLoadingBody')
    }

    static airdropCard = {
        loadingAirdrop : document.querySelector('.airdrop .loadingAirdrop'),
        loadingupcomingAirdrop : document.querySelector('.airdrop .loadingupcomingAirdrop'),
        loadingpassedAirdrop : document.querySelector('.airdrop .loadingendedAirdrop'),
        airdropExemple : document.querySelector('.airdropExemple'),
        upcomingAirdropExemple : document.querySelector('.upcomingAirdropExemple'),
        endedairdropExemple : document.querySelector('.endedAirdropExemple')
    }
    constructor() {

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
            fetch('https://airdrops.virgo.net:2053/api/airdropplayed',{
                method: "POST",
                body: JSON.stringify({address: infos.addresses[0].address}),
                headers: {'Content-Type': 'application/json'}
            }).then(response => response.json())
                .then(res => {
                    let airdropParticipated = res[0].length
                    let airdropWon = res[1].length
                    document.querySelector('.airdropHeader .particpateddrops').innerHTML = airdropParticipated
                    document.querySelector('.airdropHeader .wondrops').innerHTML = airdropWon
                })
        })



    }
    loadActiveDrops(){
        fetch('https://airdrops.virgo.net:2053/api/activedrops', {
            method : 'GET',
            headers: {'Content-Type': 'application/json'}

        }).then(response => response.json())
            .then(res => {
                AirdropPane.airdropCard.loadingAirdrop.style.display ="flex"
                console.log(res)
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
                                    elem.querySelector('.earnCoin').innerHTML = (res[i].reward / res[i].winnersCount).toFixed(0)
                                    elem.querySelector('.timeLeft').innerHTML = Math.round(Math.abs((dateStart - dateEnd) / day)) + " days left"
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
                                                console.log(infos)
                                                    if(infos){
                                                        let elemjoined = elem.querySelector('.usersJoined')
                                                        let cntJoined = elemjoined.textContent
                                                        let userNmb = Number(cntJoined)
                                                        elemjoined.innerHTML = userNmb + 1;
                                                    }
                                                let userInfos = {
                                                    airdropID : elemClicked.id,
                                                    address : playAddress
                                                }
                                                fetch('https://airdrops.virgo.net:2053/api/airdropsetplay',{
                                                    method : "POST",
                                                    body : JSON.stringify(userInfos),
                                                    headers: {'Content-Type': 'application/json'}
                                                }).then(response => response.json())
                                                    .then(response => {
                                                        console.log(userCount)
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
                                            console.log(btn.id)
                                            checkAirdropPlay(preset.addresses[0].address,btn.id).then(function (state) {
                                            console.log(state)
                                            if (state){
                                                btn.enabled = true
                                            }else {
                                                btn.disabled = true
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
                                        console.log(elem.querySelector('.airdropCoinInfos').classList)
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
                AirdropPane.airdropCard.loadingAirdrop.style.display ="none"
                AirdropPane.airdropCard.airdropExemple.classList.add('d-none')
                AirdropPane.div.airdropLoadingBody.classList.add('d-none')
                AirdropPane.div.airdropBody.classList.add('d-flex')
                AirdropPane.div.airdropBody.classList.remove('d-none')

            })
    }
    loadUpcomingDrops(){
        fetch('https://airdrops.virgo.net:2053/api/upcomingairdrop', {
            method : 'GET',
            headers: {'Content-Type': 'application/json'}

        }).then(response => response.json())
            .then(res => {
                AirdropPane.airdropCard.loadingupcomingAirdrop.style.display = "flex"
                console.log(res)
                if (res.length >= 0){
                    AirdropPane.airdropCard.upcomingAirdropExemple.classList.add('d-none')
                    AirdropPane.airdropCard.loadingupcomingAirdrop.classList.add('d-none')
                }
                for (let i = 0; res.length > i; i++) {
                    tickerFromChainID(res[i].chainID).then(function (infos) {
                        if (!infos) return
                        console.log(infos)
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
                                console.log(results)
                                const day = 24 * 60 * 60 * 1000;
                                let dateStart = new Date(res[i].startDate)
                                let dateEnd = new Date(res[i].endDate)
                                let socials = JSON.parse(res[i].socials)
                                let elem = AirdropPane.airdropCard.upcomingAirdropExemple.cloneNode(true)
                                console.log(results.name)
                                elem.classList.add('d-flex')
                                elem.classList.remove('d-none')
                                elem.classList.remove('upcomingAirdropExemple')
                                elem.classList.add('airdropSetter')
                                elem.querySelector('.coinName').innerHTML = results.name
                                elem.querySelector('.coinTicker').innerHTML = results.ticker
                                elem.querySelector('.earnCoin').innerHTML = (res[i].reward / res[i].winnersCount).toFixed(0)
                                elem.querySelector('.timeLeft').innerHTML = Math.round(Math.abs((dateStart - dateEnd) / day)) + " days left"
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
                                    console.log(elem.querySelector('.airdropCoinInfos').classList)
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
                AirdropPane.airdropCard.loadingpassedAirdrop.style.display = "flex"
                console.log(res)
                if (res.length >= 0 ){
                    AirdropPane.airdropCard.endedairdropExemple.classList.add('d-none')
                    AirdropPane.airdropCard.loadingpassedAirdrop.classList.add('d-none')
                }
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
                                elem.querySelector('.earnCoin').innerHTML = (res[i].reward / res[i].winnersCount).toFixed(0)
                                elem.querySelector('.timeLeft').innerHTML = Math.round(Math.abs((dateStart - dateEnd) / day)) + " days left"
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
                                    console.log(elem.querySelector('.airdropCoinInfos').classList)
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
                                AirdropPane.airdropCard.loadingpassedAirdrop.classList.add('d-none')

                            }
                        })
                    })

                }
            })


    }


}

const airdropPane = new AirdropPane()