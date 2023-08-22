class ReactMessaging {

    constructor() {
        this.reqs = new Map()

        window.addEventListener("message", message => {
            if(message.data.reactResp !== true) return

            this.reqs.get(message.data.id)(JSON.parse(message.data.response))
        })
    }

    sendMessage(data){
        if(data.type === undefined) throw new Error("Message type not defined")

        return new Promise(resolve => {
            const reqId = Date.now() + "." + Math.random()

            data.id = reqId

            this.reqs.set(reqId, resolve)

            window.ReactNativeWebView.postMessage(JSON.stringify(data))
        })
    }

    async isBiometricsAvailable(){
        return await this.sendMessage({type: "biometricsAvailable"})
    }

    async storePassword(password){
        return await this.sendMessage({type: "storePassword", password: password})
    }

    async getPassword(){
        return await this.sendMessage({type: "getPassword"})
    }

}

const reactMessaging = new ReactMessaging()