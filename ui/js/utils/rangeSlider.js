$(".range").each(function(){
    const range = $(this).find("input")
    const min = range.attr("min")
    const max = range.attr("max")

    const leftStep = $(this).find('.leftStep')
    const middleStep = $(this).find('.centerStep')
    const rightStep = $(this).find('.rightStep')

    const onInput = function(){
        let value = range.val()
        range.css("background", `linear-gradient(to right, var(--mainColorDark10) 0%, var(--mainColorDark10) ${(value - min) / (max - min) * 100}%, rgb(84, 84, 84) ${(value - min) / (max - min) * 100}%, rgb(84, 84, 84) 100%)`)
        switch (true) {
            case (value == 0):
                range.css("background", `linear-gradient(to right, var(--mainColorDark10) 0%, var(--mainColorDark10) 1%, rgb(84, 84, 84) 0%, rgb(84, 84, 84) 100%)`)
                middleStep.removeClass("activeStep")
                rightStep.removeClass("activeStep")
                break;
            case (value <= 40) :
                leftStep.addClass("activeStep")
                middleStep.removeClass("activeStep")
                rightStep.removeClass("activeStep")
                break;
            case (value >= 40 && value <= 90):
                leftStep.addClass("activeStep")
                middleStep.addClass("activeStep")
                rightStep.removeClass("activeStep")
                break;
            case (value == 100):
                leftStep.addClass("activeStep")
                middleStep.addClass("activeStep")
                rightStep.addClass("activeStep")
                break;
        }
    }

    range.on("input", function (e) {
        onInput()
    })
    onInput()
})
