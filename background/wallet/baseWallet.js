let provider;
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

        provider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            addressIndex: this.nonce
        })

        web3 = new Web3(provider)

        //add wallet objects generated by HDWP to web3
        Object.entries(provider.wallets).map(([key, value]) => web3.eth.accounts.wallet.add(web3.utils.toHex(value.privateKey)))
    }

    static generateWallet(){
        return new BaseWallet({"mnemonic": bip39.generateMnemonic(), "nonce": 1})
    }

    static fromJSON(json, password){
        try {
            let data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt

            if (json.encryptedDataKey === undefined) {
                data = json.data;
            }else{
                encryptedDataKey = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.encryptedDataKey));
                encryptedDataKeyIV = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.encryptedDataKeyIV));
                let encryptedData = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.data));
                let encryptedDataIV = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.IV));
                passwordSalt = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.passwordSalt));
                let passwordHash = sjcl.misc.pbkdf2(password, passwordSalt, 10000, 256);
                let cipher = new sjcl.cipher.aes(passwordHash);
                dataKey = sjcl.mode.ctr.decrypt(cipher, encryptedDataKey, encryptedDataKeyIV);

                cipher = new sjcl.cipher.aes(dataKey);
                data = JSON.parse(Converter.Utf8ArrayToStr(sjcl.codec.bytes.fromBits(sjcl.mode.ctr.decrypt(cipher, encryptedData, encryptedDataIV))));
            }

            return new BaseWallet(data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt)
        }catch(e){
            return false
        }
    }

    encrypt(password){
        this.passwordSalt = sjcl.random.randomWords(32);
        let passwordHash = sjcl.misc.pbkdf2(password, this.passwordSalt, 10000, 256);
        this.dataKey = sjcl.random.randomWords(8);
        this.encryptedDataKeyIV = sjcl.random.randomWords(4);
        let cipher = new sjcl.cipher.aes(passwordHash);
        this.encryptedDataKey = sjcl.mode.ctr.encrypt(cipher, this.dataKey, this.encryptedDataKeyIV);
    }

    isEncrypted(){
        return this.encryptedDataKey !== undefined;
    }

    toJSON(){
        let json = {}

        //put wallet data to a JSON object
        let data = {}
        data.nonce = this.nonce
        data.mnemonic = this.mnemonic

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

}

browser.storage.local.get("wallet").then(
    function(res){//on success
        if (res.wallet === undefined)
            baseWallet = BaseWallet.generateWallet()
        else{
            let wallet = fromJSON(res)
            if(wallet)
                baseWallet = wallet
        }

    }
);