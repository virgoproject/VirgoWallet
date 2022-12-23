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
    isMetaMask: true,
    isEIP1193: true,
    networkVersion: '1',
    chainId: '0x1',
    selectedAddress: '',
    enable: async () => {
        return await window.providerRequestTransmitter.transmit("eth_requestAccounts", [])
    },
    request: async (req) => {
        const params = req.params || []
        return await window.providerRequestTransmitter.transmit(req.method, params)
    },
    send: async (req, _paramsOrCallback) => {
        if (typeof _paramsOrCallback === 'function') {
            window.ethereum.sendAsync(req, _paramsOrCallback)
            return
        }
        const method = typeof req === 'string' ? req : req.method
        const params = req.params || _paramsOrCallback || []
        return await window.providerRequestTransmitter.transmit(method, params)
    },
    sendAsync: (req, callback) => {
        const params = req.params || []
        window.providerRequestTransmitter.transmit(req.method, params)
            .then((result) => callback(null, {
                id: req.id,
                jsonrpc: '2.0',
                result
            }))
    },
    on: (method, callback) => {
        if (method === 'chainChanged') {
            window.addEventListener('virgoChainChanged', (response) => {
                const result = response.detail
                callback('0x' + result.toString(16))
            })
        }
        if (method === 'accountsChanged') {
            window.addEventListener('virgoAccountsChanged', (response) => {
                const result = response.detail
                callback(result)
            })
        }
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
})

window.addEventListener('virgoAccountsChanged', (response) => {
    const addresses = response.detail
    virgoProvider.selectedAddress = addresses[0]
})

window.web3 = new Proxy({
    currentProvider: virgoProvider,
    __isMetaMaskShim__: true
}, {
    deleteProperty: () => true
})

window.dispatchEvent(new Event('ethereum#initialized'));
