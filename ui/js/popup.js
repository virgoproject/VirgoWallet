function disableLoadBtn(elem) {
    elem.find("val").hide()
    elem.find("i").show()
    elem.attr("disabled", true)
}

function enableLoadBtn(elem) {
    elem.find("val").show()
    elem.find("i").hide()
    elem.attr("disabled", false)
}

function isBtnDisabled(elem){
    return elem.is(":visible") && !elem.find("val").is(":visible")
}

function copyToClipboard(data) {
    let temp = $("<input>")
    temp.css("position", "absolute")
    $("body").append(temp)
    temp.val(data).select()
    document.execCommand("copy")
    temp.remove()
}

$("#footer .footerElem").click(function(){
    if($(this).hasClass("selected")) return false

    $("#footer .footerElem").removeClass("selected")
    $(this).addClass("selected")

    $("#body .bodyElem").hide()

    $("#body .bodyElem."+$(this).attr("data-target")).show()

    //temporary
    if($(this).attr("data-target") === "airdrop"){
        try {
            document.querySelector("reward-pane").remove()
        }catch (e){}
        const elem = document.createElement("reward-pane")
        document.querySelector("#airdropPane").appendChild(elem)
    }

    if($(this).attr("data-target") === "send"){
        try {
            document.querySelector("send-token").remove()
        }catch (e){}
        const elem = document.createElement("send-token")
        document.querySelector("#sendPane").appendChild(elem)
    }

    if($(this).attr("data-target") === "swap"){
        try {
            document.querySelector("swap-tokens").remove()
        }catch (e){}
        const elem = document.createElement("swap-tokens")
        document.querySelector("#swapPane").appendChild(elem)
    }

    return false
})

window.jdenticon_config = {
    hues: [281],
    lightness: {
        color: [0.47, 0.67],
        grayscale: [0.28, 0.48]
    },
    saturation: {
        color: 0.61,
        grayscale: 0.02
    },
    backColor: "#dcd3e6"
};

$(".popup .box").click(function(){
    //prevent triggering popup close when clicking on the box
    return false
})

$(".popup").click(function(){
    if ($(this).attr('id') === 'tutorialPopup') return
    $(this).hide()
})

$(".popup .close").click(function(){
    $(this).parents(".popup").hide()
})

const notyf = new Notyf({
    duration: 2500,
    position: {
        x: 'center',
        y: 'top'
    }
})

$("[data-inputTarget]").keypress(function(e){
    if(e.which != 13) return

    const target = $($(this).attr("data-inputTarget"))

    if(target.attr("disabled")) return
    target.click()
})

$(".resizeOnInput").on("input", function(){
    $(this).css("width", ($(this).val().length+2) + "ch")
})

$.fn.insertIndex = function (i) {
    // The element we want to swap with
    var $target = this.parent().children().eq(i);

    // Determine the direction of the appended index so we know what side to place it on
    if (this.index() > i) {
        $target.before(this);
    } else {
        $target.after(this);
    }

    return this;
};

$(".bottomPopup .background").click(function(){
    $(this).parents(".bottomPopup").hide()
})

$(".bottomPopup .close").click(function(){
    $(this).closest(".bottomPopup").hide()
})

Stateful.addGlobalStylesheet("../css/fontAwesome/css/all.min.css");
Stateful.addGlobalStylesheet("../css/bootstrap.min.css");
Stateful.addGlobalStylesheet("../css/main.css");

getBaseInfos().then(res => {
    if(res.selectedLanguage == "" && navigator.language !== undefined) res.selectedLanguage = navigator.language.substring(0,2)
    console.log("lang set to " + res.selectedLanguage)
    Stateful.setLocale(res.selectedLanguage)
})
