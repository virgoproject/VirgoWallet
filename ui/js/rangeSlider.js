let range = document.getElementById("rangeFees");


const min = range.min
const max = range.max
const value = range.value
const leftStep = document.getElementById('leftStep')
const middleStep = document.getElementById('centerStep')
const rightStep = document.getElementById('rightStep')

range.style.background = `linear-gradient(to right, #5a009c 0%, #5a009c ${(value - min) / (max - min) * 100}%, #DEE2E6 ${(value - min) / (max - min) * 100}%, #DEE2E6 100%)`
range.addEventListener("input", function (e) {
    console.log(range.value)
    rangeVal()
    range.style.background = `linear-gradient(to right, #5a009c 0%, #5a009c ${(range.value - range.min) / (range.max - range.min) * 100}%, #DEE2E6 ${(range.value - range.min) / (range.max - range.min) * 100}%, #DEE2E6 100%)`
})

rangeVal()

function rangeVal() {
    switch (range.value) {
        case ('0' || '10' || '20' || '30' || '40') :
            leftStep.classList.add("activeStep")
            middleStep.classList.remove("activeStep")
            rightStep.classList.remove("activeStep")
            break;
        case ('50' || '60' || '70' || '80' || '90'):
            console.log("s")
            leftStep.classList.add("activeStep")
            middleStep.classList.add("activeStep")
            rightStep.classList.remove("activeStep")
            break;
        case '100' :
            console.log("ree")
            leftStep.classList.add("activeStep")
            middleStep.classList.add("activeStep")
            rightStep.classList.add("activeStep")
            break;
        default :
            console.log("nul")
    }
}