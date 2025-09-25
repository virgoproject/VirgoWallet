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

class ProviderRpcError extends Error {

    constructor(code, message, data) {
        super(message)
        this.code = code
        if (data !== undefined) {
            this.data = data
        }
        this.name = 'ProviderRpcError'
    }

}

const eventHandlers = new Map()

const getHandlers = (event) => {
    if (!eventHandlers.has(event)) {
        eventHandlers.set(event, new Set())
    }
    return eventHandlers.get(event)
}

const emit = (event, payload) => {
    const handlers = eventHandlers.get(event)
    if (!handlers) {
        return
    }
    handlers.forEach((handler) => {
        try {
            handler(payload)
        } catch (error) {
            console.error('virgo provider listener error', error)
        }
    })
}

const normalizeProviderError = (error) => {
    if (error instanceof ProviderRpcError) {
        return error
    }

    if (error && typeof error === 'object') {
        const code = typeof error.code === 'number' ? error.code : 4000
        const message = typeof error.message === 'string' ? error.message : 'Provider error'
        return new ProviderRpcError(code, message, error.data)
    }

    const message = typeof error === 'string' ? error : 'Provider error'
    return new ProviderRpcError(4000, message, error)
}

const existingEthereum = window.ethereum
const existingProviders = Array.isArray(existingEthereum?.providers) ? [...existingEthereum.providers] : []

if (existingEthereum && !existingProviders.includes(existingEthereum)) {
    existingProviders.push(existingEthereum)
}

const virgoProviderTarget = {
    isVirgo: true,
    isEIP1193: true,
    isMetaMask: false,
    networkVersion: undefined,
    chainId: undefined,
    selectedAddress: '',
    accounts: [],
    connected: false,
    providers: [],
    isConnected: () => {
        return !!virgoProvider.connected
    },
    enable: async () => {
        return await virgoProvider.request({ method: 'eth_requestAccounts' })
    },
    request: async (req) => {
        const requestObject = typeof req === 'string' ? { method: req } : req

        if (!requestObject || typeof requestObject !== 'object' || typeof requestObject.method !== 'string') {
            throw normalizeProviderError({ code: 4200, message: 'Invalid request object' })
        }

        const params = requestObject.params ?? []
        try {
            return await window.providerRequestTransmitter.transmit(requestObject.method, params)
        } catch (error) {
            throw normalizeProviderError(error)
        }
    },
    send: (methodOrRequest, paramsOrCallback) => {
        if (typeof methodOrRequest === 'string') {
            if (typeof paramsOrCallback === 'function') {
                return window.ethereum.sendAsync({ method: methodOrRequest, params: [] }, paramsOrCallback)
            }

            const params = paramsOrCallback ?? []
            return window.ethereum.request({ method: methodOrRequest, params })
        }

        if (typeof methodOrRequest === 'object' && methodOrRequest !== null) {
            if (typeof paramsOrCallback === 'function') {
                return window.ethereum.sendAsync(methodOrRequest, paramsOrCallback)
            }
            return window.ethereum.request(methodOrRequest)
        }

        throw new Error('Invalid request arguments for send')
    },
    sendAsync: (req, callback) => {
        const params = req.params ?? []
        window.providerRequestTransmitter.transmit(req.method, params)
            .then((result) => {
                callback(null, {
                    id: req.id,
                    jsonrpc: '2.0',
                    result: result
                })
            })
            .catch((error) => {
                callback(normalizeProviderError(error), null)
            })
    },
    on: (event, handler) => {
        const handlers = getHandlers(event)
        handlers.add(handler)
        return virgoProvider
    },
    removeListener: (event, handler) => {
        const handlers = eventHandlers.get(event)
        if (handlers) {
            handlers.delete(handler)
        }
        return virgoProvider
    },
    off: (event, handler) => {
        return virgoProvider.removeListener(event, handler)
    },
    autoRefreshOnNetworkChange: false
}

virgoProvider = new Proxy(virgoProviderTarget, {
    deleteProperty: () => true
})

const providerList = existingProviders.filter((provider) => provider && provider !== virgoProvider)
providerList.push(virgoProvider)
virgoProviderTarget.providers = providerList

window.ethereum = virgoProvider

const normalizeChainId = (chainId) => {
    if (typeof chainId === 'string') {
        if (chainId.startsWith('0x')) {
            return chainId.toLowerCase()
        }

        const parsed = Number(chainId)
        if (!Number.isNaN(parsed)) {
            return '0x' + parsed.toString(16)
        }

        return undefined
    }

    if (typeof chainId === 'number') {
        return '0x' + chainId.toString(16)
    }

    return undefined
}

const normalizeNetworkVersion = (chainId) => {
    if (typeof chainId === 'string') {
        if (chainId.startsWith('0x')) {
            const parsed = parseInt(chainId, 16)
            if (Number.isNaN(parsed)) {
                return undefined
            }
            return parsed.toString()
        }
        const parsed = Number(chainId)
        if (Number.isNaN(parsed)) {
            return undefined
        }
        return parsed.toString()
    }

    if (typeof chainId === 'number') {
        return chainId.toString()
    }

    return undefined
}

window.addEventListener('virgoChainChanged', (response) => {
    const rawChainId = response.detail
    const hexChainId = normalizeChainId(rawChainId)
    const networkVersion = normalizeNetworkVersion(rawChainId)

    virgoProvider.chainId = hexChainId
    virgoProvider.networkVersion = networkVersion

    if (hexChainId !== undefined) {
        emit('chainChanged', hexChainId)
    }

    if (networkVersion !== undefined) {
        emit('networkChanged', networkVersion)
    }
})

window.addEventListener('virgoAccountsChanged', (response) => {
    const addresses = Array.isArray(response.detail) ? response.detail : []

    virgoProvider.accounts = addresses
    virgoProvider.selectedAddress = addresses[0] || ''

    emit('accountsChanged', [...addresses])
})

window.addEventListener('virgoConnected', () => {
    virgoProvider.connected = true

    emit('connect', {
        chainId: virgoProvider.chainId
    })
})

window.addEventListener('virgoDisconnected', () => {
    virgoProvider.connected = false
    virgoProvider.accounts = []
    virgoProvider.selectedAddress = ''

    emit('accountsChanged', [])
    emit('disconnect', {
        code: 4900,
        message: 'Disconnected'
    })
})

window.web3 = new Proxy({
    currentProvider: virgoProvider,
    __isMetaMaskShim__: true
}, {
    deleteProperty: () => true
})

window.dispatchEvent(new Event('ethereum#initialized'));
