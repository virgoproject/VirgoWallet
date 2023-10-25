class TokensSelect {

    static networks = [ "BNB","ETH",  "MATIC", "FTM", "AVAX", "ETHW"]

    static popularTokens = [
        "ETH",
        "BNB",
        "MATIC",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        "0x4Fabb145d64652a948d72533023f6E7A623C7C53"
    ]

    constructor() {

        const _this = this

        let scrollTokensCount = 0
        let scrollReachedEnd = false
        let tokenList = []
        let toIgnore = null

        document.getElementById("categoriesWrapper").onscroll = e => {
            if(_this.scrollReachedEnd) return

            const scrollPercent = (e.target.scrollTop / (document.getElementById("categories").offsetHeight - e.target.offsetHeight))

            if(scrollPercent > 0.7){
                this.displayTokens()
            }
        }

        document.getElementById("searchBar").oninput = e => {
            document.getElementById("tokensNotFound").style.display = "none"

            document.getElementById("allTokensCat").innerHTML = ""

            document.getElementById("tokensLoading").style.display = "block"
            document.getElementById("categoriesWrapper").style.display = "none"

            document.getElementById("allTokensCatWrapper").style.display = "block"

            if(e.target.value == ""){
                _this.scrollTokensCount = 0
                _this.scrollReachedEnd = false
                _this.displayTokens()
                return
            }

            const results = _this.tokenList.filter(record =>
                record.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                record.ticker.toLowerCase().includes(e.target.value.toLowerCase())
            )

            document.getElementById("tokensLoading").style.display = "none"
            document.getElementById("categoriesWrapper").style.display = "block"

            if(results.length == 0){
                document.getElementById("tokensNotFound").style.display = "block"
                document.getElementById("categoriesWrapper").style.display = "none"
                return
            }

            document.getElementById("categoriesWrapper").scrollTop = 0

            for(const token of results){
                _this.spawnToken(token)
            }

            jdenticon()

            if(document.getElementById("allTokensCat").innerHTML == "")
                document.getElementById("allTokensCatWrapper").style.display = "none"

        }

        $(".footerElem[data-target='swap']").click(() => {
            _this.initList()
        })

    }

    initList(){
        this.tokenList = []
        this.toIgnore = null

        this.tokenList.push({
            contract: MAIN_ASSET.ticker,
            ticker: MAIN_ASSET.ticker,
            decimals: MAIN_ASSET.decimals,
            name: MAIN_ASSET.asset
        })

        for(const token of MAIN_ASSET.tokens){
            this.tokenList.push(token)
        }
    }

    spawnToken(json){

        if(this.toIgnore == json.contract) return

        const elem = document.getElementById("baseToken").cloneNode(true)

        elem.id = json.contract

        elem.getElementsByClassName("title")[0].innerHTML = json.name
        elem.getElementsByClassName("desc")[0].innerHTML = json.ticker + "<span style='font-weight: bold'> &middot; </span>" + MAIN_ASSET.name

        $(elem).find("svg").attr("data-jdenticon-value", json.contract)
        jdenticon()

        $(elem).find("img").on('load', function() {
            $(elem).find("svg").hide()
            $(elem).find("img").show()
        }).attr("src", "https://github.com/virgoproject/tokens/blob/main/"+MAIN_ASSET.chainID+"/"+json.contract+"/logo.png?raw=true")

        elem.style.display = "block"

        const _this = this

        elem.onclick = () => {
            _this.callback(json)
        }

        document.getElementById("allTokensCat").append(elem)

    }

    displayTokenSelect(callback, toIgnore = null){
        $("#tokenSelect").show()
        document.getElementById("allTokensCat").innerHTML = ""

        this.scrollTokensCount = 0
        this.scrollReachedEnd = false

        this.callback = callback
        this.toIgnore = toIgnore

        this.displayTokens()

        document.getElementById("tokenSelect").style.display = "block"
    }

    displayTokens(){
        document.getElementById("tokensNotFound").style.display = "none"
        document.getElementById("tokensLoading").style.display = "none"
        document.getElementById("categoriesWrapper").style.display = "block"
        document.getElementById("allTokensCatWrapper").style.display = "block"
        document.getElementById("searchBar").value = ""

        let count = 0

        for(const token of this.tokenList){
            if(count < this.scrollTokensCount){
                count++
                continue
            }

            if(count >= this.scrollTokensCount+20){
                this.scrollTokensCount = count
                return
            }

            count++

            this.spawnToken(token)
        }

        this.scrollReachedEnd = true
    }

}

const tokenSelect = new TokensSelect()
