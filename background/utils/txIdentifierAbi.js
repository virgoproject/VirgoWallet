class TxIdentifier {

    static getDecodeAbi(param,hash,date,recipient,amount,gasPrice,gasLimit,nonce){
        const decodedMethod = abiDecoder.decodeMethod(param)

        if (decodedMethod !== undefined){
            switch (decodedMethod.name){
                case 'approve':
                    let tx = {
                        "hash": hash,
                        "contractAddr": "WEB3_CALL",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce,
                        "allowed":{
                            "address":decodedMethod.params[0].value
                        }
                    }
                    return tx
                    break

                case 'swapExactETHForTokens':
                    let swapEth = {
                        "hash": hash,
                        "contractAddr": "WEB3_CALL",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce

                    }
                    return swapEth
                    break

                case 'swapExactTokensForTokens':
                    let swapToken = {
                        "hash": hash,
                        "contractAddr": "WEB3_CALL",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
                    return swapToken
                break
            }
        }


    }
}
