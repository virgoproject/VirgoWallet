class WalletConnect {

    constructor() {
        this.pendingConnections = {}
        this.init()
        this.reqs = new Map()
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
            console.log("got proposal")
            _this.pendingConnections[proposal.params.pairingTopic](proposal)
        })

        this.wcWallet.on('session_request', async event => {

            console.log(event)

            const reqId = Date.now() + "." + Math.random()

            _this.reqs.set(reqId, event)

            handleWeb3Request(event.verifyContext.verified.origin, event.params.request.method, event.params.request.params, reqId, {tab: {id: "walletConnect"}})
        })

        browser.tabs.onMessage.addListener(message => {
            console.log("got reeeee")
            console.log(message)

            const event = _this.reqs.get(message.id)

            const { topic, params, id } = event

            const response = { id, result: message.resp, jsonrpc: '2.0' }

            _this.wcWallet.respondSessionRequest({ topic, response })

            _this.reqs.delete(message.id)
        })

        this.wcWallet.on("session_delete", event => {
            console.log(event)
            for (let i = 0; i < connectedWebsites.length; i++) {
                console.log(connectedWebsites[i].params.topic)
                if(connectedWebsites[i].type === "walletConnect" && connectedWebsites[i].params.topic === event.topic){
                    connectedWebsites.splice(i, 1)
                    break
                }
            }
        })

        events.addListener("chainChanged", () => {
            console.log("chainsssss")
            _this.updateSessions("chainChanged")
        })

        events.addListener("addressChanged", () => {
            console.log("adddddrrr")
            _this.updateSessions("accountsChanged")
        })

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
                    methods: ["eth_sendTransaction", "personal_sign"],
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

        web3wallet.emitSessionEvent({
            session.topic,
            event: {
                name: 'chainChanged',
                data: [baseWallet.getCurrentAddress()]
            },
            chainId: 'eip155:'+baseWallet.getCurrentWallet().chainID
        })

        web3wallet.emitSessionEvent({
            session.topic,
            event: {
                name: 'accountsChanged',
                data: [baseWallet.getCurrentAddress()]
            },
            chainId: 'eip155:'+baseWallet.getCurrentWallet().chainID
        })

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
        const topics = Object.keys(walletConnect.wcWallet.getActiveSessions())

        const chains = []

        const accounts = []

        for(const chain of baseWallet.getWalletsJSON()){
            chains.push("eip155:"+chain.wallet.chainID)
            accounts.push("eip155:"+chain.wallet.chainID+":"+baseWallet.getCurrentAddress())
        }

        const ns = {
            eip155: {
                chains: chains,
                methods: ["eth_sendTransaction", "personal_sign"],
                events: ["accountsChanged", "chainChanged"],
                accounts: accounts
            }
        }

        for(const topic of topics){
            await web3wallet.updateSession({ topic, namespaces: ns })

            if(type == "chainChanged"){
                web3wallet.emitSessionEvent({
                    session.topic,
                    event: {
                        name: 'chainChanged',
                        data: [baseWallet.getCurrentAddress()]
                    },
                    chainId: 'eip155:'+baseWallet.getCurrentWallet().chainID
                })
            }else if(type == "accountsChanged"){
                web3wallet.emitSessionEvent({
                    session.topic,
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