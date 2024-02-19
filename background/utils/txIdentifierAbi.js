class TxIdentifier {

    static getDecodeAbi(param,hash,date,recipient,amount,gasPrice,gasLimit,nonce,origin){

        const decodedMethod = abiDecoder.decodeMethod(param)

        console.log(decodedMethod)

        if (decodedMethod !== undefined){
            if (decodedMethod.name !== "multicall"){
                switch (decodedMethod.name){
                    case 'swapETHForExactTokens':
                    case 'swapExactETHForTokens':
                    case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": amount,
                                "amountOut": decodedMethod.params[0].value,
                                "tokenIn": decodedMethod.params[1].value[0],
                                "tokenOut": decodedMethod.params[1].value[decodedMethod.params[1].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
                    case 'swapExactTokensForTokens':
                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[0].value,
                                "amountOut": decodedMethod.params[1].value,
                                "tokenIn": decodedMethod.params[2].value[0],
                                "tokenOut": decodedMethod.params[2].value[decodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapTokensForExactTokens':
                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[1].value,
                                "amountOut": decodedMethod.params[0].value,
                                "tokenIn": decodedMethod.params[2].value[0],
                                "tokenOut": decodedMethod.params[2].value[decodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapTokensForExactETH':
                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[1].value,
                                "amountOut": decodedMethod.params[0].value,
                                "tokenIn": decodedMethod.params[2].value[0],
                                "tokenOut": decodedMethod.params[2].value[decodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                    case 'swapExactTokensForETH':
                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[0].value,
                                "amountOut": decodedMethod.params[1].value,
                                "tokenIn": decodedMethod.params[2].value[0],
                                "tokenOut": decodedMethod.params[2].value[decodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactInput':

                        let path = decodedMethod.params[0].value.path

                        if(!web3.utils.isHexStrict(decodedMethod.params[0].value.path)){
                            path = web3.utils.toHex(decodedMethod.params[0].value.path)
                        }

                        const tokenIn = path.slice(0, 42)
                        const tokenOut = "0x" + path.slice(-40)
                        console.log(tokenIn)
                        console.log(tokenOut)

                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[0].value.amountIn,
                                "amountOut": decodedMethod.params[0].value.amountOutMinimum,
                                "tokenIn": tokenIn,
                                "tokenOut": tokenOut
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactOutput':
                        let path2 = decodedMethod.params[0].value.path

                        if(!web3.utils.isHexStrict(decodedMethod.params[0].value.path)){
                            path2 = web3.utils.toHex(decodedMethod.params[0].value.path)
                        }

                        const tokenIn2 = path2.slice(0, 42)
                        const tokenOut2 = "0x" + path2.slice(-40)
                        console.log(tokenIn2)
                        console.log(tokenOut2)

                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[0].value.amountInMaximum,
                                "amountOut": decodedMethod.params[0].value.amountOut,
                                "tokenIn": tokenIn2,
                                "tokenOut": tokenOut2
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactInputSingle':
                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[0].value.amountIn,
                                "amountOut": decodedMethod.params[0].value.amountOutMinimum,
                                "tokenIn": decodedMethod.params[0].value.tokenIn,
                                "tokenOut": decodedMethod.params[0].value.tokenOut
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactOutputSingle':
                        return {
                            "swapInfos": {
                                "type": decodedMethod.name,
                                "amountIn": decodedMethod.params[0].value.amountInMaximum,
                                "amountOut": decodedMethod.params[0].value.amountOut,
                                "tokenIn": decodedMethod.params[0].value.tokenIn,
                                "tokenOut": decodedMethod.params[0].value.tokenOut
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    default:
                        return {
                            "hash": hash,
                            "contractAddr": "WEB3_CALL",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                }
            }else{
                const decodedDecodedMethod = abiDecoder.decodeMethod(decodedMethod.params[1].value[0])

                console.log(decodedDecodedMethod)

                switch (decodedDecodedMethod.name){
                    case 'swapETHForExactTokens':
                    case 'swapExactETHForTokens':
                    case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": amount,
                                "amountOut": decodedDecodedMethod.params[0].value,
                                "tokenIn": decodedDecodedMethod.params[1].value[0],
                                "tokenOut": decodedDecodedMethod.params[1].value[decodedDecodedMethod.params[1].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
                    case 'swapExactTokensForTokens':
                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[0].value,
                                "amountOut": decodedDecodedMethod.params[1].value,
                                "tokenIn": decodedDecodedMethod.params[2].value[0],
                                "tokenOut": decodedDecodedMethod.params[2].value[decodedDecodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapTokensForExactTokens':
                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[1].value,
                                "amountOut": decodedDecodedMethod.params[0].value,
                                "tokenIn": decodedDecodedMethod.params[2].value[0],
                                "tokenOut": decodedDecodedMethod.params[2].value[decodedDecodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapTokensForExactETH':
                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[1].value,
                                "amountOut": decodedDecodedMethod.params[0].value,
                                "tokenIn": decodedDecodedMethod.params[2].value[0],
                                "tokenOut": decodedDecodedMethod.params[2].value[decodedDecodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                    case 'swapExactTokensForETH':
                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[0].value,
                                "amountOut": decodedDecodedMethod.params[1].value,
                                "tokenIn": decodedDecodedMethod.params[2].value[0],
                                "tokenOut": decodedDecodedMethod.params[2].value[decodedDecodedMethod.params[2].value.length-1]
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactInput':

                        let path = decodedDecodedMethod.params[0].value.path

                        if(!web3.utils.isHexStrict(decodedDecodedMethod.params[0].value.path)){
                            path = web3.utils.toHex(decodedDecodedMethod.params[0].value.path)
                        }

                        const tokenIn = path.slice(0, 42)
                        const tokenOut = "0x" + path.slice(-40)
                        console.log(tokenIn)
                        console.log(tokenOut)

                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[0].value.amountIn,
                                "amountOut": decodedDecodedMethod.params[0].value.amountOutMinimum,
                                "tokenIn": tokenIn,
                                "tokenOut": tokenOut
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactOutput':
                        let path2 = decodedDecodedMethod.params[0].value.path

                        if(!web3.utils.isHexStrict(decodedDecodedMethod.params[0].value.path)){
                            path2 = web3.utils.toHex(decodedDecodedMethod.params[0].value.path)
                        }

                        const tokenIn2 = path2.slice(0, 42)
                        const tokenOut2 = "0x" + path2.slice(-40)
                        console.log(tokenIn2)
                        console.log(tokenOut2)

                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[0].value.amountInMaximum,
                                "amountOut": decodedDecodedMethod.params[0].value.amountOut,
                                "tokenIn": tokenIn2,
                                "tokenOut": tokenOut2
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactInputSingle':
                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[0].value.amountIn,
                                "amountOut": decodedDecodedMethod.params[0].value.amountOutMinimum,
                                "tokenIn": decodedDecodedMethod.params[0].value.tokenIn,
                                "tokenOut": decodedDecodedMethod.params[0].value.tokenOut
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    case 'exactOutputSingle':
                        return {
                            "swapInfos": {
                                "type": decodedDecodedMethod.name,
                                "amountIn": decodedDecodedMethod.params[0].value.amountInMaximum,
                                "amountOut": decodedDecodedMethod.params[0].value.amountOut,
                                "tokenIn": decodedDecodedMethod.params[0].value.tokenIn,
                                "tokenOut": decodedDecodedMethod.params[0].value.tokenOut
                            },
                            "hash": hash,
                            "contractAddr": "WEB3_SWAP",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
                            "gasPrice": gasPrice,
                            "gasLimit": gasLimit,
                            "nonce": nonce
                        }
                    default:
                        return {
                            "hash": hash,
                            "contractAddr": "WEB3_CALL",
                            "date": date,
                            "recipient": recipient,
                            "amount": amount,
                            'origin': origin,
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
                'origin': origin,
                "gasPrice": gasPrice,
                "gasLimit": gasLimit,
                "nonce": nonce
            }
        }
    }
}
