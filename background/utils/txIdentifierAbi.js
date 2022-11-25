class TxIdentifierAbi {

    static getDecodeAbi(param){

        const decodedMethod = abiDecoder.decodeMethod(param)

        return decodedMethod
    }
}
