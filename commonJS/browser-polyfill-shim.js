const browserShim = {
    storage: {
        local: {},
        session: {}
    },
    notifications: {},
    extension: {},
    tabs: {
        onMessage: {}
    },
    windows: {},
    runtime: {
        onMessage: {},
        onInstalled: {}
    },
    alarms: {
        onAlarm: {}
    }
}

browserShim.storage.local.get = async (name) => {
    let item = window.localStorage.getItem(name)
    const res = {}

    if(item == null) return res

    try {
        item = JSON.parse(item)
    }catch(e){}

    res[name] = item

    return res
}

browserShim.storage.local.set = async (data) => {
    for(let [key, value] of Object.entries(data)){
        if(typeof value === "object")
            value = JSON.stringify(value)

        window.localStorage.setItem(key, value)
    }

    return
}

browserShim.storage.local.remove = async (name) => {
    window.localStorage.removeItem(name)
    return
}

browserShim.storage.session.map = new Map()

browserShim.storage.session.get = async (name) => {
    let item = browserShim.storage.session.map.get(name)
    const res = {}

    if(item == null) return res

    try {
        item = JSON.parse(item)
    }catch(e){}

    res[name] = item

    return res
}

browserShim.storage.session.set = async (data) => {
    for(let [key, value] of Object.entries(data)){
        if(typeof value === "object")
            value = JSON.stringify(value)

        browserShim.storage.session.map.set(key, value)
    }

    return
}

browserShim.notifications.create = async (name, params) => {
    return
}

browserShim.extension.getURL = (url) => {
    return url
}

browserShim.tabs.query = (tabs) => {
    return {
        then: function(){}
    }
}

browserShim.tabs.onMessage.addListener = (func) => {
    browserShim.tabs.onMessage.listener = func
}

browserShim.tabs.sendMessage = (id, params) => {
    browserShim.tabs.onMessage.listener(structuredClone(params))
}

browserShim.windows.create = (params) => {
    if(params.url.startsWith("http")) return

    const iframe = document.createElement("iframe")
    iframe.src = params.url.replace("/ui/html/", "")
    iframe.id = Date.now() + "." + Math.random()
    document.body.appendChild(iframe)
}

browserShim.runtime.onMessage.addListener = (func) => {
    browserShim.runtime.onMessage.listener = func
}

browserShim.runtime.sendMessage = (message) => {
    return new Promise((resolve, reject) => {
        const resolveFilter = res => {
            resolve(structuredClone(res))
        }
        browserShim.runtime.onMessage.listener(structuredClone(message), "", resolveFilter)
    })
}

browserShim.runtime.onInstalled.addListener = () => {
    return
}

browserShim.alarms.onAlarm.addListener = () => {
    return
}

browserShim.alarms.get = async name => {
    return ""
}

browserShim.runtime.getURL = () => {
    return ""
}

browser = browserShim

window.document.addEventListener('iframeMessage',async e => {
    const resp = await browser.runtime.sendMessage(e.detail.message)

    const event = new CustomEvent('iframeMessageResp', { detail: {reqId: e.detail.reqId, message: resp} })

    const frame = document.getElementById(e.detail.frameId)

    frame.contentDocument.dispatchEvent(event)
})
