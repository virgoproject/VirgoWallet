function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

$("#siteName").html(get("origin"))

$("#allow").click(function (){
    browser.runtime.sendMessage({command: 'authorizeSign', id: get("id"), decision: true})
    window.close()
})

$("#refuse").click(function (){
    browser.runtime.sendMessage({command: 'authorizeSign', id: get("id"), decision: false})
    window.close()
})

window.onbeforeunload = function(){
    browser.runtime.sendMessage({command: 'authorizeSign', id: get("id"), decision: false})
}

$("#siteLogo img").on("error", function(){
    $("#siteLogo img").attr("src", get("origin")+"/favicon.png")
})
$("#siteLogo img").attr("src", get("origin")+"/favicon.ico")

$("#data").html(Utils.hexToUtf8(get("data")))

const top = (screen.height - 600) / 4, left = (screen.width - 370) / 2;
window.moveTo(top, left)
