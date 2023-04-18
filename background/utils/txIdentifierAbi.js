class TxIdentifier {

    static getDecodeAbi(param,hash,date,recipient,amount,gasPrice,gasLimit,nonce){


        const decodedMethod = abiDecoder.decodeMethod(param)
        if (decodedMethod !== undefined){
            switch (decodedMethod.name){
                case 'approve':
                    return {
                        "hash": hash,
                        "contractAddr": "APPROVETOKEN",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce,
                        "allowed": {
                            "address": decodedMethod.params[0].value
                        }
                    }

                case 'swapExactETHForTokens':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPETHFORTOKEN",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }

                case 'swapExactTokensForTokens':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPTOKENFORTOKEN",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
                case 'swapETHForExactTokens':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPETHFOREXACTTOKEN",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
                case 'swapTokensForExactTokens':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPTOKENFOREXACTTOKEN",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }

                case 'swapTokensForExactETH':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPTOKENFOREXACTETH",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
                case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPTOKENFORTOKENSUPPORTINGFEEONTRANSFERTOKENS",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
                case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPETHFORTOKENSUPPORTINGFEEONTRANSFERTOKENS",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
                case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "SWAPTOKENFORETHSUPPORTINGFEEONTRANSFERTOKENS",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
                default:
                    return {
                        "swap": decodedMethod,
                        "hash": hash,
                        "contractAddr": "WEB3_CALL",
                        "date": date,
                        "recipient": recipient,
                        "amount": amount,
                        "gasPrice": gasPrice,
                        "gasLimit": gasLimit,
                        "nonce": nonce
                    }
            }
        }else{
            return {
                "hash": hash,
                "contractAddr": "WEB3_CALL",
                "date": date,
                "recipient": recipient,
                "amount": amount,
                "gasPrice": gasPrice,
                "gasLimit": gasLimit,
                "nonce": nonce
            }
        }


    }
}
