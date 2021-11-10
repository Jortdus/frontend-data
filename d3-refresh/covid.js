let cityValue = []

//Datafetch from RIVM
// const covidFetch = fetch('https://data.rivm.nl/covid-19/COVID-19_rioolwaterdata.json ')
//     .then(results => results.json())


const covidFetch = fetch('./datasets/covid.json')
    .then(results => results.json())

const provinceFetch = fetch('./datasets/province.json')
    .then(results => results.json())

function parseCovid() {
    return new Promise((resolve, reject) => {
        let data = covidFetch
        resolve(data)
    }).then(data => {
        data.forEach(e => {
            cityValue.push({
                particles: e['RNA_flow_per_100000'],
                location: e['RWZI_AWZI_name'],
                date: e['Date_measurement']
            })
        })

    }).catch(err => {
        console.log(err)
    })
}

function parseProvince() {
    return new Promise((resolve, reject) => {
        let data = provinceFetch
        resolve(data)
    }).then(data => {
        return data.map(obj => {
            Object.keys(obj).forEach(key => {
                obj[key] = normalizeAnswers(obj[key])
            })
            return obj;
        })

    })
}

function normalizeAnswers(data) {
    return data.toString().toLowerCase()
}

parseCovid().then(data => {
    prepareData(cityValue)
    graphCreation()
})

function prepareData(cityValue) {
    let combinedData = cityValue.slice(0, 30)
    return combinedData.map(e => {
        return [e.particles, e.location]
    })
}

function graphCreation() {

    let compiledData = prepareData(cityValue)
    // set the dimensions and margins of the graph
    const margin = {
            top: 30,
            right: 30,
            bottom: 70,
            left: 120
        },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    console.log(compiledData)
    // X axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(compiledData.map(e => {
            return e[1]
        }))
        .padding(0.2)
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");


    // Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(compiledData.map(e => {
            return e[0]
        }))])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("asdf")
        .data(compiledData)
        .join("rect")
        .attr("x", d => x(d[1]))
        .attr("y", d => y(d[0]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[0]))
        .attr("fill", "#69b3a2")
}