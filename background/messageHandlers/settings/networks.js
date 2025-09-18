class NetworksHandlers {

    static register(){
        addBgMessageHandler("changeNetworkVisibility", this.changeNetworkVisibility)
        addBgMessageHandler("addNetwork", this.addNetwork)
    }

    static changeNetworkVisibility(request, sender, sendResponse){
        baseWallet.wallets[request.index].tracked = !baseWallet.wallets[request.index].tracked
        baseWallet.save()
        sendResponse(true)
    }

    static async addNetwork(request, sender, sendResponse){
        try {
            const tempWeb3 = new Web3(request.rpc)
            const res = await tempWeb3.eth.getChainId()
            if(res != request.chainID){
                sendResponse({
                    status: 1,
                    id: res
                })
                return
            }

            let explorer = request.explorer

            if(explorer != "" && !explorer.endsWith("/tx/")){
                explorer = explorer + "/tx/"
            }

            let wallet = EthWallet.fromJSON({
                "name": request.name,
                "asset": request.symbol,
                "ticker": request.symbol,
                "decimals":18,
                "contract":"",
                "RPC": request.rpc,
                "chainID": parseInt(request.chainID),
                "tokens":[

                ],
                "transactions":[

                ],
                "explorer": explorer,
                "swapParams":false,
                "testnet":false
            }, baseWallet)

            baseWallet.wallets.push(wallet)
            baseWallet.save()

            wallet.init()

            sendResponse({
                status: 2
            })
        }catch(e){
            console.log(e)
            sendResponse({
                status: 0
            })
        }
    }
}

NetworksHandlers.register()
