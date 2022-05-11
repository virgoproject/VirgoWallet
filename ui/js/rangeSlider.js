let range = document.getElementById("rangeFees");
const min = range.min
const max = range.max
const value = range.value
const leftStep = document.getElementById('leftStep')
const middleStep = document.getElementById('centerStep')
const rightStep = document.getElementById('rightStep')


range.style.background = `linear-gradient(to right, #5a009c 0%, #5a009c ${(value - min) / (max - min) * 100}%, rgb(84, 84, 84) ${(value - min) / (max - min) * 100}%, rgb(84, 84, 84) 100%)`


range.addEventListener("input", function (e) {
    range.style.background = `linear-gradient(to right, #5a009c 0%, #5a009c ${(range.value - range.min) / (range.max - range.min) * 100}%, rgb(84, 84, 84) ${(range.value - range.min) / (range.max - range.min) * 100}%, rgb(84, 84, 84) 100%)`
    rangeVal()

})

rangeVal(range, value)

function rangeVal() {
    let range = document.getElementById("rangeFees");
    const value = range.value

    switch (true) {
        case (value == 0) :
            range.style.background = `linear-gradient(to right, rgb(90, 0, 156) 0%, rgb(90, 0, 156) 1%, rgb(84, 84, 84) 0%, rgb(84, 84, 84) 100%)`
            middleStep.classList.remove("activeStep")
            rightStep.classList.remove("activeStep")
            break;
        case (value <= 40) :
            leftStep.classList.add("activeStep")
            middleStep.classList.remove("activeStep")
            rightStep.classList.remove("activeStep")
            break;
        case (value >= 40 && value <= 90) :
            leftStep.classList.add("activeStep")
            middleStep.classList.add("activeStep")
            rightStep.classList.remove("activeStep")
            break;
        case (value == 100) :
            leftStep.classList.add("activeStep")
            middleStep.classList.add("activeStep")
            rightStep.classList.add("activeStep")
            break;
        default :
    }
}
