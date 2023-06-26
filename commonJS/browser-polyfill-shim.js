const browserShim = {
    storage: {
        local: {}
    },
    notifications: {},
    extension: {},
    tabs: {},
    windows: {},
    runtime: {
        onMessage: {}
    }
}

browserShim.storage = {}
browserShim.storage.local = {}
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

browserShim.notifications.create = async (name, params) => {
    return
}

browserShim.extension.getURL = (url) => {
    return url
}

browserShim.tabs.query = (tabs) => {
    return []
}

browserShim.tabs.sendMessage = (id, params) => {
    return
}

browserShim.windows.create = (params) => {
    return
}

browserShim.runtime.onMessage.addListener = (func) => {
    browserShim.runtime.onMessage.listener = func
}

browserShim.runtime.sendMessage = (message) => {
    return new Promise((resolve, reject) => {
        browserShim.runtime.onMessage.listener(message, "", resolve)
    })
}

browser = browserShim