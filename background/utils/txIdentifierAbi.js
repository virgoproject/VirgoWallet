class TxIdentifier {

    static getDecodeAbi(param){
        const decodedMethod = abiDecoder.decodeMethod(param)

        switch (decodedMethod.name){
            case 'approve':
                let approveInfo = {
                    'approveInfo':{
                        'name' : decodedMethod.name,
                        'address': decodedMethod.params[0].value
                    }
                }
                return approveInfo
                break

            case 'swapExactETHForTokens':
                return false
            break
        }

    }
}
