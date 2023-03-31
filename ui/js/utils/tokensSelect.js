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
        let selectedTokens1 = []
        let selectedTokens2 = []

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

            if(document.getElementById("allTokensCat").innerHTML == "")
                document.getElementById("allTokensCatWrapper").style.display = "none"

        }

        $(".footerElem[data-target='swap']").click(() => {
            _this.initList()
        })

    }

    initList(){
        this.tokenList = []
        this.selectedTokens1 = []
        this.selectedTokens2 = []

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
        if($("#tokenSelectBtn").hasClass("two") && this.selectedTokens1.includes(json.contract)){
            return
        }

        if($("#tokenSelectBtn1").hasClass("one") && this.selectedTokens2.includes(json.contract)){
            return
        }


        const elem = document.getElementById("baseToken").cloneNode(true)

        elem.id = json.contract

        elem.getElementsByClassName("title")[0].innerHTML = json.name
        elem.getElementsByClassName("desc")[0].innerHTML = json.ticker + "<span style='font-weight: bold'> &middot; </span>" + MAIN_ASSET.name
        elem.getElementsByTagName("img")[0].src = "https://github.com/virgoproject/tokens/blob/main/"+MAIN_ASSET.ticker+"/"+json.contract+"/logo.png?raw=true"

        elem.style.display = "block"

        const _this = this

        elem.onclick = () => {
            if ($("#tokenSelectBtn1").hasClass("one")) {

                _this.selectedTokens1.push(json.contract)

                document.getElementById("selectedTokenTicker1").innerHTML = json.ticker
                document.getElementById("swapTicker1").innerHTML = json.ticker
                document.getElementById("sendContract").innerHTML = json.contract
                document.getElementById("selectedTokenImg1").src = "https://github.com/virgoproject/tokens/blob/main/" + MAIN_ASSET.ticker + "/" + json.contract + "/logo.png?raw=true"
                document.getElementById("tokenSelect").style.display = "none"
                $("#tokenSelectBtn1").attr("class", "row tokenSelect")
                document.getElementById("imgDiv2").style.display = "block"
                $("#tokenSelect2").attr("class", "col-6 justify-content-center align-self-center p-0")

            }else if ($("#tokenSelectBtn").hasClass("two")){

                _this.selectedTokens2.push(json.contract)

                document.getElementById("selectedTokenTicker2").innerHTML = json.ticker
                document.getElementById("swapTicker2").innerHTML = json.ticker
                document.getElementById("sendContract2").innerHTML = json.contract
                document.getElementById("imgDiv1").style.display = "block"
                $("#tokenSelect1").attr("class", "col-6 justify-content-center align-self-center p-0")
                document.getElementById("selectedTokenImg").src = "https://github.com/virgoproject/tokens/blob/main/" + MAIN_ASSET.ticker + "/" + json.contract + "/logo.png?raw=true"
                document.getElementById("tokenSelect").style.display = "none"
                $("#tokenSelectBtn").attr("class", "row tokenSelect")

            }
        }

        document.getElementById("allTokensCat").append(elem)

    }

    displayTokenSelect(){
        document.getElementById("allTokensCat").innerHTML = ""

        this.scrollTokensCount = 0
        this.scrollReachedEnd = false

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
