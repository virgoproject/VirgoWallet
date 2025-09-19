class providerRequestTransmitter {

    constructor(){}

    transmit(method, params){
        return new Promise((resolve, reject) =>{
            const reqId = Date.now() + "." + Math.random()

            window.addEventListener(reqId, function(response){
                const respJSON = response.detail
                if(respJSON.success){
                    resolve(respJSON.data)
                }
                else{
                    reject(respJSON.error)
                }
            },{
                once: true,
                passive: true
            })

            window.postMessage({
                reqId,
                method,
                params
            },"*")

        })
    }

}

window.providerRequestTransmitter = new providerRequestTransmitter()

console.log("virgo wallet - Injected Web3")

virgoProvider = new Proxy({
    isVirgo: true,
    isEIP1193: true,
    networkVersion: '1',
    chainId: '0x1',
    selectedAddress: '',
    accounts: [],
    connected: false,
    isConnected: () => {
        return window.ethereum.connected
    },
    enable: async () => {
        return await window.providerRequestTransmitter.transmit("eth_requestAccounts", [])
    },
    request: async (req) => {
        const params = req.params || []
        return await window.providerRequestTransmitter.transmit(req.method, params)
    },
    send: (req, _paramsOrCallback) => {
        if (typeof _paramsOrCallback === 'function') {
            window.ethereum.sendAsync(req, _paramsOrCallback)
            return
        }

        const method = typeof req === 'string' ? req : req.method
        const params = req.params || _paramsOrCallback || []

        if(_paramsOrCallback === undefined){
            switch(method){
                case "eth_accounts":
                    return {
                        id: req.id,
                        jsonrpc: "2.0",
                        result: virgoProvider.selectedAddress ? [virgoProvider.selectedAddress] : []
                    }
                case "eth_coinbase":
                    return {
                        id: req.id,
                        jsonrpc: "2.0",
                        result: virgoProvider.selectedAddress || ""
                    }
                case "net_version":
                    return {
                        id: req.id,
                        jsonrpc: "2.0",
                        result: virgoProvider.networkVersion
                    }
            }
        }

        return new Promise((resolve, reject) => {
            window.ethereum.sendAsync({method: method, params: params}, (dunno, resp) => {
                resolve(resp)
            })
        })
    },
    sendAsync: (req, callback) => {
        const params = req.params || []
        window.providerRequestTransmitter.transmit(req.method, params)
            .then((result) => {
                callback(null, {
                    id: req.id,
                    jsonrpc: '2.0',
                    result: result
                })
            })
    },
    on: (method, callback) => {
        if (method === 'chainChanged') {
            window.addEventListener('virgoChainChanged', (response) => {
                console.log("chain changed - sub")
                const result = response.detail
                callback('0x' + result.toString(16))
            })
        }
        if (method === 'networkChanged') {
            window.addEventListener('virgoChainChanged', (response) => {
                console.log("net changed - sub")
                const result = response.detail
                callback(result.toString())
            })
        }
        if (method === 'accountsChanged') {
            window.addEventListener('virgoAccountsChanged', (response) => {
                console.log("accounts changee - sub")
                const result = response.detail
                callback(result)
            })
        }
        if(method === "connect"){
            window.addEventListener('virgoConnected', (response) => {
                console.log("wallet connected - sub")
                callback({
                    chainId: virgoProvider.chainId
                })
            })
        }
        if(method === "disconnect"){
            window.addEventListener('virgoDisconnected', (response) => {
                console.log("wallet disconnected - sub")
                callback({
                    message: "Wallet locked or not connected to internet",
                    code: 4901
                })
            })
        }
        return virgoProvider
    },
    autoRefreshOnNetworkChange: false
}, {
    deleteProperty: () => true
})

window.ethereum = virgoProvider

window.addEventListener('virgoChainChanged', (response) => {
    const chainId = response.detail
    virgoProvider.networkVersion = ""+chainId
    virgoProvider.chainId = '0x'+chainId.toString(16)
    console.log("chain changed")
})

window.addEventListener('virgoAccountsChanged', (response) => {
    const addresses = response.detail
    virgoProvider.accounts = addresses
    virgoProvider.selectedAddress = addresses[0] || ''
    console.log("accounts changed")
})

window.addEventListener('virgoConnected', () => {
    console.log("Wallet connected")
    virgoProvider.connected = true
})

window.addEventListener('virgoDisconnected', () => {
    console.log("Wallet disconnected")
    virgoProvider.connected = false
    virgoProvider.accounts = []
    virgoProvider.selectedAddress = ''
})

window.web3 = new Proxy({
    currentProvider: virgoProvider,
    __isMetaMaskShim__: true
}, {
    deleteProperty: () => true
})

window.dispatchEvent(new Event('ethereum#initialized'));
