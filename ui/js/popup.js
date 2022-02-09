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

function copyToClipboard(element) {
    let temp = $("<input>")
    temp.css("position", "absolute")
    $("body").append(temp)
    temp.val($(element).html()).select()
    document.execCommand("copy")
    temp.remove()
}

$("#footer .footerElem").click(function(){
    if($(this).hasClass("selected")) return false

    $("#footer .footerElem").removeClass("selected")
    $(this).addClass("selected")

    $("#body .bodyElem").hide()

    $("#body .bodyElem."+$(this).attr("data-target")).show()

    return false
})

