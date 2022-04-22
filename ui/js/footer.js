/*
/!*
$(".footerElem.col-4").hover(function () {

    let data = $(this).data("target")

/!*
    const el1 = document.querySelector(`[data-target='${data}']`);
*!/

    if (data === "resume") {
        $("#optionsFooter").show()
        $("#pay-footer").hide()
        $("#home-footer").show().addClass("d-flex")
        $('#optionsFooter').addClass("openned")
    }

    if (data === "send"){
        $("#optionsFooter").show()
        $("#home-footer").hide()
        $("#pay-footer").show().addClass("d-flex")
        $('#optionsFooter').addClass("openned")
    }

}, function () {


    if (!$("#optionsFooter").hasClass("openned")) {
        $("#optionsFooter").hide()
    }


    if (!$("#pay-footer").hasClass("openned")) {
        $("#pay-footer").hide().removeClass("d-flex")

    }

    $("#optionsFooter").hover(function () {

    }, function () {
        $("#optionsFooter").hide().removeClass(" openned")
    })

})
*!/

$("#send").hover(function () {

    let data = $(this).data("target")
    $("#pay-footer").show().addClass("d-flex openned")
    $('#optionsFooter').show()


}, function () {

    if (!$("#pay-footer").hasClass("openned")) {
        $("#pay-footer").hide().removeClass("d-flex")

    }


})*/


function removeAll() {

    $("#footerStore").hide().removeClass("d-flex").css("background", "")
    $("#footeresume").hide().removeClass("d-flex").css("background", "")
    $("#footerpay").hide().removeClass("d-flex")
    $('[data-target="send"]').css("background", "")
    $('[data-target="resume"]').css("background", "")
    $('[data-target="store"]').css("background", "")
}


$('[data-target="send"]').hover(function () {
    removeAll()
    $(this).css("background", "hsl(275, 100%, 31%, 10%)")
    $("#footerpay").addClass("d-flex").show()

})

$('[data-target="resume"]').hover(function () {
    removeAll()
    $(this).css("background", "hsl(275, 100%, 31%, 10%)")
    $("#footeresume").addClass("d-flex").show()

})

$('[data-target="store"]').hover(function () {
    removeAll()
    $(this).css("background", "hsl(275, 100%, 31%, 10%)")
    $("#footerStore").addClass("d-flex").show()

})

$("#footerAlt").on( "mouseleave", function() {
    removeAll()
})