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

        this.wcWallet.on('session_proposal', async proposal => {
            _this.pendingConnections[proposal.params.pairingTopic] = proposal
        })

    }

    async connect(uri){
        try {
            this.core.pairing.pair({ uri: uri })

            uri = uri.split(":")[1].split("@")[0]

            while(this.pendingConnections[uri] === undefined){
                await new Promise(r => setTimeout(r, 100));
            }

            return this.pendingConnections[uri]

        }catch(e){
            return false
        }
    }

}

const walletConnect = new WalletConnect()