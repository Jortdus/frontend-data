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

// parsing dataset
function parseCovid() {
    return covidFetch.then(data => {
        data.forEach(e => {
            // filtering out empty results
            if (e['RNA_flow_per_100000'] == 0) {
                return
            } else {
                // creating a new array containing objectes with particles, location and date
                cityValue.push({
                    particles: e['RNA_flow_per_100000'],
                    location: e['RWZI_AWZI_name'],
                    date: e['Date_measurement']
                })
            }
        })
    }).catch(err => {
        console.log(err)
    })
}

// converting dataset values to string and to lowercase
function normalizeAnswers(data) {
    return data.toString().toLowerCase()
}

// preparing data for D3 
function prepareData(cityValue, range) {
    let combinedData = cityValue.slice(0, range ? range : 10)
    return combinedData.map(e => {
        return [e.particles, e.location]
    })
}

parseCovid().then(data => {
    graphCreation()
})

// handles changes from range input and executes code whenever an input is detected. 
rangeInput.oninput = e => {
    // defines value of input to variable
    range = rangeInput.value

    // This code helps in reducing unnecessary requests to an API or dataset. 
    if (timerHook) {
        clearTimeout(timerHook);
    }
    // whenever a input is detected, before executing the updateDatat function,
    // it will timeout for 1 second so when sliding the range bar it won't execute the function multiple times.
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
    width = 700 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom

function graphCreation() {

    let compiledData = prepareData(cityValue)

    // append the svg object to a div called "graph" and defining width and height. 
    svg = d3
        .select(".graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // appending g to svg, adding initBar class
        .append("g")
        .attr("class", "initBar")
        .attr("transform", `translate(${margin.left},${margin.top})`)

    // X axis scale
    xScale = d3
        .scaleBand()
        .range([0, width])
        .domain(compiledData.map((e) => {
            return e[1]
        })) // adds domain data of city
        .padding(0.2)

    // X axis appending g
    xAxis = svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))

    // X axis transforming text to be shown angled for better readability
    xAxis
        .selectAll("text")
        .attr("class", "x-axis")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end") // angles city text to improve visibility

    // Y axis scale
    yScale = d3
        .scaleLinear()
        .domain([0, d3.max(compiledData.map((e) => { // sets domain from 0 to max value retrieved from dataset
            return e[0]
        }))])
        .range([height, 0])

    // Y axis append g
    yAxis = svg
        .append("g")
        .call(d3.axisLeft(yScale))

    // select initBar elements
    d3.select(".initBar")
        .selectAll("rect")// select all rect elements
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