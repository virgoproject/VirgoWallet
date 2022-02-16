$("#accountSelectionHeader").click(function(){
    if($("#settings").hasClass("opened")){
        $("#settings").removeClass("opened")
        $("#accountSelectionHeader").removeClass("opened")
    } else{
        $("#settings").addClass("opened")
        $("#accountSelectionHeader").addClass("opened")
    }
})

$("#settings .mainPane .openSettings").click(function(){
    $("#settings .mainPane").hide()
    $("#settings .title").html("Settings")
})