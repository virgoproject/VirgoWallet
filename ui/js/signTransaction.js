function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

$("#siteName").html(get("origin"))

$("#allow").click(function (){
    browser.runtime.sendMessage({command: 'authorizeTransaction', id: get("id"), decision: true})
    window.close()
})

$("#refuse").click(function (){
    browser.runtime.sendMessage({command: 'authorizeTransaction', id: get("id"), decision: false})
    window.close()
})