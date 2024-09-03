class RewardHandlers {

    static register(){
        addBgMessageHandler("joinAirdrop", this.joinAirdrop)
        addBgMessageHandler("claimDailyReward", this.claimDailyReward)
        addBgMessageHandler("useReferralCode", this.useReferralCode)
    }

    static joinAirdrop(request, sender, sendResponse){
        const web3 = baseWallet.getWeb3ByID("1")

        web3.eth.sign("airdrop"+request.id, baseWallet.getAddresses()[0]).then(res => {
            const formData = {
                signature: res.signature,
                twitterUsername: request.twitterUsername
            }

            fetch('https://airdrops.virgo.net:2083/api/airdrop/'+request.id+"/join", {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {'Content-Type': 'application/json'}
            })
                .then(resp => resp.json())
                .then(json => {
                    sendResponse(json)
                })
        })
    }

    static claimDailyReward(request, sender, sendResponse){
        const web3 = baseWallet.getWeb3ByID("1")

        const date = new Date().toLocaleDateString('en-GB').split('/').reverse().join('')

        web3.eth.sign(date, baseWallet.getAddresses()[0]).then(res => {
            const formData = {
                signature: res.signature
            }

            fetch('https://airdrops.virgo.net:2083/api/reward/daily/register', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {'Content-Type': 'application/json'}
            })
                .then(resp => resp.json())
                .then(json => {
                    sendResponse(json)
                })
        })
    }

    static useReferralCode(request, sender, sendResponse){
        const web3 = baseWallet.getWeb3ByID("1")

        web3.eth.sign(request.code, baseWallet.getAddresses()[0]).then(res => {
            const formData = {
                signature: res.signature,
            }

            fetch('https://airdrops.virgo.net:2083/api/reward/referral/register/'+request.code, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {'Content-Type': 'application/json'}
            })
                .then(resp => resp.json())
                .then(json => {
                    sendResponse(json)
                })
        })
    }

}

RewardHandlers.register()
