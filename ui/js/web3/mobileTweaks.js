window.close = () => {
    frameElement.parentNode.removeChild(frameElement)
}

const messages = new Map()

browser.runtime.sendMessage = (message) => {
    return new Promise(resolve => {
        const reqId = Date.now() + "." + Math.random()

        messages.set(reqId, resolve)

        const event = new CustomEvent('iframeMessage', { detail: {reqId, message, frameId: window.frameElement.id} })
        window.parent.document.dispatchEvent(event)
    })
}

window.document.addEventListener('iframeMessageResp',e => {
    messages.get(e.detail.reqId)(e.detail.message)
    messages.delete(e.detail.reqId)
})