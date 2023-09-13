class WalletConnect {

    constructor() {
        this.pendingConnections = {}
        this.init()
        this.reqs = new Map()
        this.topicsParams = new Map()
    }

    async init() {
        const _this = this

        this.core = new wcCore.Core({
            projectId: "6023cef6e32feadde97655e9411eda1c"
        })

        this.wcWallet = await wcWeb3Wallet.Web3Wallet.init({
            core: this.core, // <- pass the shared `core` instance
            metadata: {
                name: 'Virgo Wallet',
                description: 'Demo Client as Wallet/Peer',
                url: 'virgo.net',
                icons: []
            }
        })

        this.wcWallet.on('session_proposal', proposal => {
            _this.pendingConnections[proposal.params.pairingTopic](proposal)
        })

        this.wcWallet.on('session_request', async event => {

            console.log(event)

            const reqId = Date.now() + "." + Math.random()

            _this.reqs.set(reqId, event)

            handleWeb3Request(event.verifyContext.verified.origin, event.params.request.method, event.params.request.params, reqId, {tab: {id: "walletConnect"}})
        })

        browser.tabs.onMessage.addListener(message => {
            const event = _this.reqs.get(message.id)

            const { topic, params, id } = event

            let response;

            if(message.resp.success)
                response = { id, result: message.resp.data, jsonrpc: '2.0' }
            else
                response = { id, error: message.resp.error, jsonrpc: '2.0' }

            console.log(response)

            _this.wcWallet.respondSessionRequest({ topic, response })

            _this.reqs.delete(message.id)
        })

        this.wcWallet.on("session_delete", event => {
            for (let i = 0; i < connectedWebsites.length; i++) {
                console.log(connectedWebsites[i].params.topic)
                if(connectedWebsites[i].type === "walletConnect" && connectedWebsites[i].params.topic === event.topic){
                    connectedWebsites.splice(i, 1)
                    break
                }
            }
        })

        const interval = setInterval(() => {
            if(events == undefined) return

            events.addListener("chainChanged", () => {
                _this.updateSessions("chainChanged")
            })

            events.addListener("addressChanged", () => {
                _this.updateSessions("accountsChanged")
            })

            clearInterval(interval)
        }, 100)

    }

    connect(uri){
        const _this = this

        return new Promise(resolve => {
            let topic = uri.split(":")[1].split("@")[0]

            console.log(topic)

            _this.pendingConnections[topic] = resolve

            _this.core.pairing.pair({ uri: uri }).catch(e => {
                console.log(e)
                resolve(false)
            })
        })
    }

    async allow(proposal){
        const { id, params } = proposal

        const chains = []

        const accounts = []

        for(const chain of baseWallet.getWalletsJSON()){
            chains.push("eip155:"+chain.wallet.chainID)
            accounts.push("eip155:"+chain.wallet.chainID+":"+baseWallet.getCurrentAddress())
        }

        const approvedNamespaces = wcUtils.buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
                eip155: {
                    chains: chains,
                    methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData_v4", "eth_sign", "eth_signTransaction"],
                    events: ["accountsChanged", "chainChanged"],
                    accounts: accounts
                },
            },
        })

        console.log(approvedNamespaces)

        const session = await this.wcWallet.approveSession({
            id,
            namespaces: approvedNamespaces,
        })

        console.log(session)

        this.topicsParams.set(session.topic, params)

        console.log(session.topic)

        setTimeout(() => {
            this.wcWallet.emitSessionEvent({
                topic: session.topic,
                event: {
                    name: 'chainChanged',
                    data: baseWallet.getCurrentWallet().chainID
                },
                chainId: 'eip155:'+baseWallet.getCurrentWallet().chainID
            })
        }, 500)

        setTimeout(() => {
            this.wcWallet.emitSessionEvent({
                topic: session.topic,
                event: {
                    name: 'accountsChanged',
                    data: [baseWallet.getCurrentAddress()]
                },
                chainId: 'eip155:'+baseWallet.getCurrentWallet().chainID
            })
        }, 1000)

        connectedWebsites.push({
            "type": "walletConnect",
            "params": session
        })
        browser.storage.local.set({"connectedWebsites": connectedWebsites})
    }

    refuse(proposal){
        this.wcWallet.rejectSession({
            id: proposal.id,
            reason: wcUtils.getSdkError('USER_REJECTED_METHODS')
        })
    }

    disconnect(topic){
        this.wcWallet.disconnectSession({
            topic,
            reason: wcUtils.getSdkError('USER_DISCONNECTED')
        })
    }

    async updateSessions(type){
        const topics = Object.keys(this.wcWallet.getActiveSessions())

        const chains = []

        const accounts = []

        for(const chain of baseWallet.getWalletsJSON()){
            chains.push("eip155:"+chain.wallet.chainID)
            accounts.push("eip155:"+chain.wallet.chainID+":"+baseWallet.getCurrentAddress())
        }

        for(const topic of topics){

            console.log(topic)

            const ns = wcUtils.buildApprovedNamespaces({
                proposal: this.topicsParams.get(topic),
                supportedNamespaces: {
                    eip155: {
                        chains: chains,
                        methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData_v4", "eth_sign", "eth_signTransaction"],
                        events: ["accountsChanged", "chainChanged"],
                        accounts: accounts
                    },
                },
            })

            console.log("updating " + topic)

            const sess = await this.wcWallet.updateSession({ topic, namespaces: ns })

            console.log(sess)

            if(type == "chainChanged"){
                this.wcWallet.emitSessionEvent({
                    topic: topic,
                    event: {
                        name: 'chainChanged',
                        data: baseWallet.getCurrentWallet().chainID
                    },
                    chainId: 'eip155:'+baseWallet.getCurrentWallet().chainID
                })
            }else if(type == "accountsChanged"){
                this.wcWallet.emitSessionEvent({
                    topic: topic,
                    event: {
                        name: 'accountsChanged',
                        data: [baseWallet.getCurrentAddress()]
                    },
                    chainId: 'eip155:'+baseWallet.getCurrentWallet().chainID
                })
            }
        }
    }

}

const walletConnect = new WalletConnect()
