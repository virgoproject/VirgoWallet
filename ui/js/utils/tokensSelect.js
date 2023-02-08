const tokenList = {

}
const networks = [ "BNB","ETH",  "MATIC", "FTM","AVAX","ETHW"]
const networksName = {
    "BNB": "Binance Smart Chain",
    "ETH": "Ethereum",
    "MATIC": "Polygon",
    "FTM": "Fantom",
    "AVAX" : "Avalanche",
    "ETHW" : "Ether PoW"
}

const popularTokens = [
    "ETH",
    "BNB",
    "MATIC",
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53"
]

let selectedToken = "BNB.BNB"
let selectedTokenDecimals = 0

let scrollTokensCount = 0
let scrollReachedEnd = false

function initList(){
    for(const network of networks){

        tokenList[network] = []

        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+network+"/"+network+"/infos.json").then(resp => resp.json().then(json => {
            json.contract = network
            tokenList[network].push(json)
        }))

        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+network+"/infos.json").then(resp => resp.json().then(json => {
            for(const token of json.tokens){
                fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+network+"/"+token+"/infos.json").then(resp => resp.json().then(json => {
                    tokenList[network].push(json)
                }))
            }
        }))
    }

}

function spawnToken(json, network){
    const elem = document.getElementById("baseToken").cloneNode(true)

    elem.id = network + "." + json.contract

    elem.getElementsByClassName("title")[0].innerHTML = json.name
    elem.getElementsByClassName("desc")[0].innerHTML = json.ticker + "<span style='font-weight: bold'> &middot; </span>" + networksName[network]
    elem.getElementsByTagName("img")[0].src = "https://github.com/virgoproject/tokens/blob/main/"+network+"/"+json.contract+"/logo.png?raw=true"

    elem.style.display = "block"


        elem.onclick = () => {
            if ($("#tokenSelectBtn1").hasClass("one")) {
                selectedToken = elem.id
                selectedTokenDecimals = json.decimals
                console.log(json)
                document.getElementById("selectedTokenTicker1").innerHTML = json.ticker
                document.getElementById("swapTicker1").innerHTML = json.ticker
                document.getElementById("sendContract").innerHTML = json.contract
                document.getElementById("selectedTokenImg1").src = "https://github.com/virgoproject/tokens/blob/main/" + network + "/" + json.contract + "/logo.png?raw=true"
                document.getElementById("tokenSelect").style.display = "none"
                $("#tokenSelectBtn1").attr("class", "row tokenSelect")
                document.getElementById("imgDiv2").style.display = "block"
                $("#tokenSelect2").attr("class", "col-6 justify-content-center align-self-center p-0")
            }else if ($("#tokenSelectBtn").hasClass("two")){
                selectedToken = elem.id
                selectedTokenDecimals = json.decimals
                console.log(json)
                document.getElementById("selectedTokenTicker2").innerHTML = json.ticker
                document.getElementById("swapTicker2").innerHTML = json.ticker
                document.getElementById("sendContract2").innerHTML = json.contract
                document.getElementById("imgDiv1").style.display = "block"
                $("#tokenSelect1").attr("class", "col-6 justify-content-center align-self-center p-0")
                document.getElementById("selectedTokenImg").src = "https://github.com/virgoproject/tokens/blob/main/" + network + "/" + json.contract + "/logo.png?raw=true"
                document.getElementById("tokenSelect").style.display = "none"
                $("#tokenSelectBtn").attr("class", "row tokenSelect")
            }
        }






        if (network === MAIN_ASSET.ticker){
        document.getElementById("allTokensCat").append(elem)
        }else if (network !== MAIN_ASSET.ticker){
            document.getElementById(network +"." + json.contract).remove()
        }



}

function displayTokenSelect(){
    document.getElementById("allTokensCat").innerHTML = ""


    scrollTokensCount = 0
    scrollReachedEnd = false

    document.getElementById("tokenSelect").style.display = "block"
}

function displayTokens(){
    document.getElementById("tokensNotFound").style.display = "none"
    document.getElementById("tokensLoading").style.display = "none"
    document.getElementById("categoriesWrapper").style.display = "block"
    document.getElementById("allTokensCatWrapper").style.display = "block"


    let count = 0

        for(const network in tokenList){
                for(const token of tokenList[network]){
                    if(count < scrollTokensCount){
                        count++
                        continue
                    }


                    spawnToken(token, network)
                }
        }



    scrollReachedEnd = true
}

document.getElementById("categoriesWrapper").onscroll = e => {
    if(scrollReachedEnd) return

    const scrollPercent = (e.target.scrollTop / (document.getElementById("categories").offsetHeight - e.target.offsetHeight))

    if(scrollPercent > 0.7){
        displayTokens()
    }
}

document.getElementById("searchBar").oninput = e => {
    document.getElementById("tokensNotFound").style.display = "none"


    document.getElementById("allTokensCat").innerHTML = ""

    document.getElementById("tokensLoading").style.display = "block"
    document.getElementById("categoriesWrapper").style.display = "none"


    document.getElementById("allTokensCatWrapper").style.display = "block"

    if(e.target.value == ""){
        scrollTokensCount = 0
        scrollReachedEnd = false
        displayTokens()
        return
    }

    const results = {}

    for(const network of networks){
        console.log(tokenList)
        const result = tokenList[network].filter(record =>
            record.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
            record.ticker.toLowerCase().includes(e.target.value.toLowerCase())
        )
        results[network] = result
    }

    document.getElementById("tokensLoading").style.display = "none"
    document.getElementById("categoriesWrapper").style.display = "block"

    let resultsLength = 0

    for(const network in results)
        resultsLength+=results[network]

    if(resultsLength == 0){
        document.getElementById("tokensNotFound").style.display = "block"
        document.getElementById("categoriesWrapper").style.display = "none"
        return
    }

    document.getElementById("categoriesWrapper").scrollTop = 0

    for(const network in results){
        for(const token of results[network]){
            spawnToken(token, network)
        }
    }


    if(document.getElementById("allTokensCat").innerHTML == "")
        document.getElementById("allTokensCatWrapper").style.display = "none"


}


initList()
