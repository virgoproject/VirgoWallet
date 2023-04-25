class TxIdentifier {

    static getDecodeAbi(param,hash,date,recipient,amount,gasPrice,gasLimit,nonce){


        const decodedMethod = abiDecoder.decodeMethod(param)

        if (decodedMethod !== undefined){
            if (decodedMethod.name !== "multicall"){
                switch (decodedMethod.name){
                    case 'approve' :
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
                            "contractAddr": "WEB3_SWAP",
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
                            "contractAddr": "WEB3_SWAP",
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
                            "contractAddr": "WEB3_SWAP",
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
                            "contractAddr": "WEB3_SWAP",
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
                            "contractAddr": "WEB3_SWAP",
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
                            "contractAddr": "WEB3_SWAP",
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
                            "contractAddr": "WEB3_SWAP",
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
                            "contractAddr": "WEB3_SWAP",
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
                const decodedDecodedMethod = abiDecoder.decodeMethod(decodedMethod.params[1].value[0])

                switch (decodedDecodedMethod.name){
                    case 'exactInputSingle':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactOutputSingle' :
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactETHForTokens':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }

                    case 'swapExactTokensForTokens':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapETHForExactTokens':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapTokensForExactTokens':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }

                    case 'swapTokensForExactETH':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                        return {
                            "swap": decodedDecodedMethod,
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    default:
                        return {
                            "swap": decodedDecodedMethod,
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
