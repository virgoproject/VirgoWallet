let web3;
let baseWallet;

class BaseWallet {

    constructor(data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt) {
        this.mnemonic = data.mnemonic
        this.nonce = data.nonce

        this.encryptedDataKey = encryptedDataKey
        this.encryptedDataKeyIV = encryptedDataKeyIV
        this.dataKey = dataKey
        this.passwordSalt = passwordSalt

        this.wallets = []
        for(const wallet of data.wallets){
            switch(wallet.type){
                case "web3":
                    if(wallet.wallet.chainID == "400" || wallet.wallet.chainID == "500") {
                        continue
                    }
                    console.log("qdqzdqz " + wallet.wallet.name)
                    this.wallets.push(EthWallet.fromJSON(wallet.wallet, this))
                    break
            }
        }

        this.addresses = []

        this.checkMissingWallets()

        this.crossSwaps = data.crossSwaps
        if(this.crossSwaps === undefined)
            this.crossSwaps = []

        this.selectedWallet = data.selectedWallet
        this.selectedAddress = data.selectedAddress
        this.privateKeys = data.privateKeys

        if(this.selectedWallet === undefined)
            this.selectedWallet = 0

        if(this.selectedAddress === undefined)
            this.selectedAddress = 0

        if(this.privateKeys === undefined || this.privateKeys.length == 0){
            const hdprovider = new HDWalletProvider({
                mnemonic: this.mnemonic,
                providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
                chainId: this.wallets[this.selectedWallet].chainID,
                numberOfAddresses: this.nonce,
                shareNonce: false,
                pollingInterval: 100000
            })

            this.privateKeys = []

            for(const wallet in hdprovider.wallets){
                this.privateKeys.push({
                    privateKey: "0x"+Converter.bytesToHex(hdprovider.wallets[wallet].privateKey),
                    hidden: false,
                    type: "seed"
                })
            }

            hdprovider.engine.stop()

            this.save()
        }

        //old fix
        if(typeof this.privateKeys[0] == "string"){
            const newPkeys = []
            for(const pKey of this.privateKeys){
                newPkeys.push({
                    privateKey: pKey,
                    hidden: false,
                    type: "seed"
                })
            }
            this.privateKeys = newPkeys
            this.save()
        }

        for(const wallet of this.wallets){
            wallet.init()
        }

        web3 = this.getWeb3ByID(this.wallets[this.selectedWallet].chainID)

        for(let i = 0; i < web3.eth.accounts.wallet.length; i++){
            this.addresses.push(web3.eth.accounts.wallet[i].address)
        }

        if(data.version !== undefined)
            this.version = data.version
        else{
            this.version = VERSION//To change for VERSION after next update
            this.save()
        }

        this.getSwapParams()
    }

    static generateWallet(mnemonic){
        const wallets = BaseWallet.getBaseWallets()

        if(mnemonic === undefined)
            mnemonic = bip39.generateMnemonic()

        return new BaseWallet({"mnemonic": mnemonic, "nonce": 1, "wallets": wallets, "selectedWallet": 0, "selectedAddress": 0})
    }

    static fromJSON(json, password){
        try {
            let data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt

            if (json.encryptedDataKey === undefined) {
                data = json.data;
            }else{
                encryptedDataKey = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.encryptedDataKey))
                encryptedDataKeyIV = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.encryptedDataKeyIV))
                let encryptedData = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.data))
                let encryptedDataIV = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.IV))
                passwordSalt = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.passwordSalt))
                let passwordHash = sjcl.misc.pbkdf2(password, passwordSalt, 10000, 256)
                let cipher = new sjcl.cipher.aes(passwordHash)
                dataKey = sjcl.mode.ctr.decrypt(cipher, encryptedDataKey, encryptedDataKeyIV)

                cipher = new sjcl.cipher.aes(dataKey)
                data = JSON.parse(Converter.utf8ArrayToStr(sjcl.codec.bytes.fromBits(sjcl.mode.ctr.decrypt(cipher, encryptedData, encryptedDataIV))))
            }

            return new BaseWallet(data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt)
        }catch(e){
            console.log(e)
            return false
        }
    }

    static getBaseWallets(){
        const wallets = []

        wallets[0] = {
            "type": "web3",
            "wallet": {
                "name": "Ethereum",
                "asset": "Ethereum",
                "ticker": "ETH",
                "decimals": 18,
                "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "RPC": "https://rpc.ankr.com/eth",
                "chainID": 1,
                "tokens": [],
                "transactions": [],
                "nft":[],
                "explorer": "https://etherscan.io/tx/",
                "testnet": false,
                "atomicSwap": {
                    "lockerAddress": "0x07AF5E2075BB32FfdFF5Ac2Ffb492bdE5D98D65b",
                    "orders": []
                }
            }
        }

        return wallets
    }

    //check current wallets against reference list, if some networks are missing add them
    async checkMissingWallets(){

        let referenceWallets = BaseWallet.getBaseWallets()

        try {
            const refWalletsReq = await fetch("https://raw.githubusercontent.com/virgoproject/tokens/refs/heads/main/chains.json")
            referenceWallets = await refWalletsReq.json()
        }catch(e){}

        let changed = false

        b: for(const refWallet of referenceWallets){
            for(const wallet of this.wallets)
                if(refWallet.wallet.chainID == wallet.chainID) continue b

            changed = true
            const wallet = EthWallet.fromJSON(refWallet.wallet)
            wallet.init()
            this.wallets.push(wallet)
        }

        if(changed) this.save()
    }

    async getSwapParams(){
        try {

            const req = await fetch("https://swap.virgo.net/api/v1/chains_list")
            const dexs = await req.json()

            for(const wallet of this.wallets){
                if(dexs[wallet.chainID] === undefined)
                    wallet.swapV2Params = false
                else
                    wallet.swapV2Params = dexs[wallet.chainID]
            }

            this.save()

        }catch(e){
            console.log(e.message)
        }
    }

    encrypt(password){
        this.passwordSalt = sjcl.random.randomWords(32)
        let passwordHash = sjcl.misc.pbkdf2(password, this.passwordSalt, 10000, 256)
        this.dataKey = sjcl.random.randomWords(8)
        this.encryptedDataKeyIV = sjcl.random.randomWords(4)
        let cipher = new sjcl.cipher.aes(passwordHash)
        this.encryptedDataKey = sjcl.mode.ctr.encrypt(cipher, this.dataKey, this.encryptedDataKeyIV)
        this.save()
    }

    isEncrypted(){
        return this.encryptedDataKey !== undefined;
    }

    passwordMatch(password){
        let passwordHash = sjcl.misc.pbkdf2(password, this.passwordSalt, 10000, 256)
        let cipher = new sjcl.cipher.aes(passwordHash)
        let trialDataKey = sjcl.mode.ctr.decrypt(cipher, this.encryptedDataKey, this.encryptedDataKeyIV)

        return JSON.stringify(this.dataKey) == JSON.stringify(trialDataKey)
    }

    toJSON(){
        let json = {}

        //put wallet data to a JSON object
        let data = {}
        data.nonce = this.nonce
        data.mnemonic = this.mnemonic
        data.version = this.version

        data.wallets = []
        for(const wallet of this.wallets)
            data.wallets.push(wallet.toJSON())

        data.selectedWallet = this.selectedWallet
        data.selectedAddress = this.selectedAddress
        data.privateKeys = this.privateKeys

        data.crossSwaps = this.crossSwaps

        //if no dataKey return in plain
        if(this.dataKey === undefined){
            json.data = data
            return json
        }

        //else encrypt with dataKey
        let iv = sjcl.random.randomWords(4)
        let cipher = new sjcl.cipher.aes(this.dataKey)
        let utf8Encode = new TextEncoder()
        let text = JSON.stringify(data)
        let array = sjcl.codec.bytes.toBits(Array.from(utf8Encode.encode(text)))

        json.data = Converter.bytesToHex(sjcl.codec.bytes.fromBits(sjcl.mode.ctr.encrypt(cipher, array, iv)))
        json.IV = Converter.bytesToHex(sjcl.codec.bytes.fromBits(iv))
        json.encryptedDataKey = Converter.bytesToHex(sjcl.codec.bytes.fromBits(this.encryptedDataKey))
        json.encryptedDataKeyIV = Converter.bytesToHex(sjcl.codec.bytes.fromBits(this.encryptedDataKeyIV))
        json.passwordSalt  = Converter.bytesToHex(sjcl.codec.bytes.fromBits(this.passwordSalt))

        return json
    }

     static async loadFromJSON(password){
        const res = await browser.storage.local.get("wallet")
        if (res.wallet === undefined) {
            baseWallet = BaseWallet.generateWallet()
            baseWallet.save()
            loadedElems["baseWallet"] = true
            return true
        } else {
            let wallet = BaseWallet.fromJSON(res.wallet, password)
            if(wallet){
                baseWallet = wallet
                loadedElems["baseWallet"] = true
                return true
            }
        }
        loadedElems["baseWallet"] = true
        return false
    }

    save(){
        console.log("saving")
        browser.storage.local.set({"wallet": this.toJSON()})
    }

    addAccount(){
        this.nonce++;
        const hdProvider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce,
            shareNonce: false,
            pollingInterval: 10000
        })

        const addr = hdProvider.addresses[hdProvider.addresses.length-1]

        this.privateKeys.push({
            privateKey: "0x"+Converter.bytesToHex(hdProvider.wallets[addr].privateKey),
            hidden: false,
            type: "seed"
        })

        for(const wallet of this.wallets){
            wallet.initProvider()
        }

        hdProvider.engine.stop()

        web3 = this.getWeb3ByID(this.wallets[this.selectedWallet].chainID)

        this.addresses = []
        for(let i = 0; i < web3.eth.accounts.wallet.length; i++){
            this.addresses.push(web3.eth.accounts.wallet[i].address)
        }

        this.save()
    }

    addAccountFromPrivateKey(pKey){

        for(const privateKey of this.privateKeys){
            if(pKey.toLowerCase() == privateKey.privateKey.toLowerCase()) return false
        }

        this.privateKeys.push({
            privateKey: pKey,
            hidden: false,
            type: "imported"
        })

        for(const wallet of this.wallets){
            wallet.initProvider()
        }

        web3 = this.getWeb3ByID(this.wallets[this.selectedWallet].chainID)

        this.addresses = []
        for(let i = 0; i < web3.eth.accounts.wallet.length; i++){
            this.addresses.push(web3.eth.accounts.wallet[i].address)
        }

        this.save()

        return true
    }

    selectWallet(newWalletID){
        this.selectedWallet = newWalletID

        web3 = this.getWeb3ByID(this.wallets[this.selectedWallet].chainID)

        this.save()

        if(typeof walletConnect !== 'undefined'){
            walletConnect.updateSessions("chainChanged")
        }
    }

    selectAddress(addressID){
        this.selectedAddress = addressID
        this.save()

        if(typeof walletConnect !== 'undefined'){
            walletConnect.updateSessions("accountsChanged")
        }
    }

    getCurrentWallet(){
        return this.wallets[this.selectedWallet]
    }

    getCurrentAddress(){
        return this.getAddresses()[this.selectedAddress]
    }

    getWalletsJSON(){
        const json = []
        for(const wallet of this.wallets)
            json.push(wallet.toJSON())

        return json
    }

    getAddresses(){
        return this.addresses
    }

    getChainByID(id){
        for(let chain of this.wallets){
            if(chain.chainID == id)
                return chain
        }
        return false
    }

    getWeb3ByID(id){
        const chain = this.getChainByID(id)

        return chain.web3
    }

    deleteAccount(address){

        let acc = false;

        for(const account of web3.eth.accounts.wallet){
            if(account.address == address){
                acc = account
                break
            }
        }

        if(!acc) return false

        let i = 0
        for(let i = 0; i < this.privateKeys.length; i++){
            const pkey = this.privateKeys[i]

            if(pkey.privateKey.toLowerCase() == acc.privateKey.toLowerCase()){
                if(pkey.type == "seed"){
                    pkey.hidden = true
                    break
                }

                this.privateKeys.splice(i, 1)
                break
            }
        }

        for(const wallet of this.wallets){
            wallet.initProvider()
        }

        web3 = this.getWeb3ByID(this.wallets[this.selectedWallet].chainID)

        this.addresses = []
        for(let i = 0; i < web3.eth.accounts.wallet.length; i++){
            this.addresses.push(web3.eth.accounts.wallet[i].address)
        }

        this.save()

        return true

    }

    getAccountName(address){
        let name = accName[address]

        if (name === undefined || name === ""){
            name = "Account "+baseWallet.getAddresses().indexOf(address)
            accName[address] = name
            browser.storage.local.set({"accountsNames": accName});
        }

        return name
    }

    getHiddenAccounts(){
        const accounts = []

        for(const pKey of this.privateKeys){
            if(!pKey.hidden) continue
            const acc = web3.eth.accounts.privateKeyToAccount(pKey.privateKey)
            accounts.push({
                address: acc.address,
                name: this.getAccountName(acc.address)
            })
        }

        return accounts
    }

    unhideAccount(address){
        for(const pKey of this.privateKeys){
            if(!pKey.hidden) continue

            const acc = web3.eth.accounts.privateKeyToAccount(pKey.privateKey)

            if(acc.address != address) continue

            pKey.hidden = false
            break
        }

        for(const wallet of this.wallets){
            wallet.initProvider()
        }

        web3 = this.getWeb3ByID(this.wallets[this.selectedWallet].chainID)

        this.addresses = []
        for(let i = 0; i < web3.eth.accounts.wallet.length; i++){
            this.addresses.push(web3.eth.accounts.wallet[i].address)
        }

        this.save()

        return true
    }

}
