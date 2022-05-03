let graph = document.getElementById("graph")

let newChart = new Chart(graph, {
    type: 'line',
    data : {
        labels : ["Rouge","Bleu","Jaune","Vert","Violet","Orange"],
        dataset : [{
            label : "Nombre de votes",
            data : [12,19,3,6,37,2]
        }]
    }
});

console.log("cc")