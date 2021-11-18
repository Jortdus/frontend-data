let cityValue = []
let svg = d3.select("svg")
let rangeInput = document.getElementById("rangeInput")
let range
let xAxis
let xScale
let yAxis
let yScale
let timerHook

// Datafetch from RIVM
// const covidFetch = fetch('https://data.rivm.nl/covid-19/COVID-19_rioolwaterdata.json ')
//     .then(results => results.json())

const covidFetch = fetch('./datasets/covid.json')
    .then(results => results.json())

function parseCovid() {
    return covidFetch.then(data => {
        data.forEach(e => {
            if (e['RNA_flow_per_100000'] == 0) {
                return
            } else {
                cityValue.push({
                    particles: e['RNA_flow_per_100000'],
                    location: e['RWZI_AWZI_name'],
                    date: e['Date_measurement']
                })
            }

        })
        return cityValue

    }).catch(err => {
        console.log(err)
    })
}

function normalizeAnswers(data) {
    return data.toString().toLowerCase()
}

function prepareData(cityValue, range) {
    let combinedData = cityValue.slice(0, range ? range : 10)
    return combinedData.map(e => {
        return [e.particles, e.location]
    })
}

parseCovid().then(data => {
    graphCreation()
})

rangeInput.oninput = e => {
    range = rangeInput.value
    if (timerHook) {
        clearTimeout(timerHook);
    }
    timerHook = setTimeout(() => updateData(range), 1000);
}

function updateData(range) {
    let compiledData = prepareData(cityValue, range)
    redraw(compiledData)
}

// set the dimensions and margins of the graph
const margin = {
        top: 30,
        right: 30,
        bottom: 200,
        left: 120
    },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom



function graphCreation() {

    let compiledData = prepareData(cityValue)

    // append the svg object to the body of the page
    svg = d3
        .select(".graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("class", "initBar")
        .attr("transform", `translate(${margin.left},${margin.top})`)

    // X axis
    xScale = d3
        .scaleBand()
        .range([0, width])
        .domain(compiledData.map((e) => {
            return e[1]
        })) // adds domain data of city
        .padding(0.2)

    xAxis = svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))

    xAxis
        .selectAll("text")
        .attr("class", "x-axis")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end") // angles city text to improve visibility

    // Y axis
    yScale = d3
        .scaleLinear()
        .domain([0, d3.max(compiledData.map((e) => {
            return e[0]
        }))])
        .range([height, 0])
    yAxis = svg.append("g").call(d3.axisLeft(yScale))

    console.log(svg
        .select(".initBar"));

    d3.select(".initBar")
        .selectAll("rect")
        .data(compiledData) // data input
        .join("rect") // add rect
        .attr("x", (d) => xScale(d[1])) // define x value
        .attr("y", (d) => yScale(d[0])) // define y value
        .attr("class", "bars") // add class name bars
        .attr("width", xScale.bandwidth()) // define width of bar
        .attr("height", (d) => height - yScale(d[0])) // define height of bar
        .attr("fill", "#FF5733") // add color fill to bar
}

function redraw(compiledData) {

    xScale = d3
        .scaleBand()
        .range([0, width]) // sets range
        .domain(compiledData.map((e) => {
            return e[1]
        })) // adds domain data of city
        .padding(0.2) // adds padding

    xAxis.call(d3.axisBottom(xScale))
    xAxis
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end") // angles city text to improve visibility

    yScale = d3
        .scaleLinear()
        .domain([0, d3.max(compiledData.map((e) => {
            return e[0]
        }))]) // sets domain from 0 to max value retrieved from dataset
        .range([height, 0])
    yAxis.call(d3.axisLeft(yScale))

    d3.select(".initBar")
        .selectAll("rect") // select rectangle
        .data(compiledData) // send data
        .join("rect") 
        .transition()
        .attr("x", (d) => xScale(d[1])) // define x value
        .attr("y", (d) => yScale(d[0])) // define y value
        .attr("class", "bars") // add class name bars
        .attr("width", xScale.bandwidth()) // define width of bar
        .attr("height", (d) => height - yScale(d[0])) // define height of bar
        .attr("fill", "#FF5733") // add color fill to bar

}