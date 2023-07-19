class WalletConnect {

    constructor() {
        this.pendingConnections = {}
        this.init()
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

        const session = await this.wcWallet.approveSession({
            id,
            namespaces: approvedNamespaces,
        })

        console.log(session)
    }

    refuse(proposal){
        this.wcWallet.rejectSession({
            id: proposal.id,
            reason: wcUtils.getSdkError('USER_REJECTED_METHODS')
        })
    }

}

const walletConnect = new WalletConnect()