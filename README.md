# Frontend data

![GitHub last commit](https://img.shields.io/github/last-commit/jortdus/frontend-data)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/jortdus/frontend-data)
[![GitHub license](https://img.shields.io/github/license/pmvdbijl7/matching-app)](https://github.com/jortdus/frontend-data/LICENSE)

Track Tech, front-end programming with a focus on visualization. 

## What is this code?
The code in this repository is a collection of assigments where functional programming is the standard. 
The code contains Promise based coding, D3.js focused on functional programming 

## Table of Contents
* [Features](#features)
* [Support](#support)
* [Credits](#credits)
* [License](#license)

## How does it work?

The function of this code is to retrieve a dataset from the RIVM and visualize this in a chart. 

### How did i start off?
First off, i asked myself what data do i want to visualize. The dataset contains the following data; 

* The date of when the data is retrieved
* The date of the report
* The location of the retrieved data
* Area code of the location
* Amount of corona particles in the sewage water per 100.000 residents. 

I decided that i was going to visiualize the particles and matching location, this could very effectively be visualized in a bar chart. 

Using the following code i retrieve the data from a JSON file. Normally this would be done via an API but because of the size of this dataset (7.0 MB, over 30 seconds of loading time) i created a JSON file with the data instead. 

```js

// Fetch from local JSON file
const covidFetch = fetch('./datasets/covid.json')
    .then(results => results.json())
    
// Fetch from API
const covidFetch = fetch('https://data.rivm.nl/covid-19/COVID-19_rioolwaterdata.json ')
    .then(results => results.json())
```

With this code i was able to parse the dataset and execute multiple functions to create new dataset and clean up the data.

Variable declaration    
```js
let cityValue = []
let svg = d3.select("svg")
let rangeInput = document.getElementById("rangeInput")
let range
let xAxis
let xScale
let yAxis
let yScale
let timerHook
```

```js

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
```

The parseCovid() function is used to filter out empty values from the dataset and create a new array containing objects with the amount of particles, the location and date of measurement.

```js
// converting dataset values to string and to lowercase
function normalizeAnswers(data) {
    return data.toString().toLowerCase()
}
```

Cleaning up the dataset by coverting data to a string and lowercase. 

```js
function prepareData(cityValue, range) {
    let combinedData = cityValue.slice(0, range ? range : 10)
    return combinedData.map(e => {
        return [e.particles, e.location]
    })
}
```

The prepareData function is used to retrieve the cityValue variable containing the newly created array with objects and lowers the amount of objects in the array from over 25.000 to a standard value of 10. This is to reduce loading time for now. After this a new object is returned with the particles and location that will be send to the D3 chart. 

```js
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
```
This snippet of code helps me in handling the range input that gives the user the ability to adjust the amount of results show in the barchart. 
This code also optimizes the code somewhat by creating a hook everytime a new input is detected and adding a timeout. This prevents the code of executing everytime the range input is changed and will only execute the current input value after 1 second. 

## D3 related code

Whenever you start to make a chart in D3 you want to define the canvas of your SVG and the margins used. 

```js
// set the dimensions and margins of the graph
const margin = {
        top: 30,
        right: 30,
        bottom: 200,
        left: 120
    },
    width = 700 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom
```

The chart is drawn when the function graphCreation() is called upon. within this function i use the D3 syntax to define the parameters and values of the barchart.

```js
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
```

This code is used to append a SVG to a div called "graph", it defines the SVGs width, height and appends g to the SVG with class name "initBar"

```js
 // X axis scale
    xScale = d3
        .scaleBand()
        .range([0, width])
        .domain(compiledData.map((e) => {
            return e[1]
        })) // adds domain data of city
        .padding(0.2)
```
Xscale is used to determine the x axis of the chart. scaleBand is used primarily for charts with categorical data. 
It scales the x or y value for you based on a non-numerical value. In my case the city name. 

```js
    // X axis appending g
    xAxis = svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
```
xAxis is used to append a g element to the svg and create a correct x axis.

```js
xAxis
        .selectAll("text")
        .attr("class", "x-axis")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end") // angles city text to improve visibility
```
This code is used to improve visibility of city names, when shown without an angle it will overlap eachother and makes the chart look messy. Now the text is angled and is easy to read. 

```js
    yScale = d3
        .scaleLinear()
        .domain([0, d3.max(compiledData.map((e) => { // sets domain from 0 to max value retrieved from dataset
            return e[0]
        }))])
        .range([height, 0])
```
yScale is used to define the y axel that shows the scale of particles per 100.000 residents. 
.domain contains d3.max which picks the highest particle values from the returned data and sets this as the highest value on the y axis.

```js
    yAxis = svg
        .append("g")
        .call(d3.axisLeft(yScale))
```
Creation of the y axis where g is appended.

```js
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
```
The above code snippit is used to draw the actual bars in the chart. it starts off by selectingthe initBar class where it creates rect (rectangles).
compiledData is defined as dataset, following this the x and y values are defined with data from the dataset. 
After defining the x and y value the code adds class "bars" to the rectangles in the chart. 

Next the width and height are defined. 
Width is defined using the scaleBand function called bandwidth, automatically scaling the bar width based on total width of the chart and amount of bars shown. 
Height is defined by taking the max height of the chart and lowering this value based on the particles value retrieved from the dataset. yScale contains scaleLinear which automatically scales this based on the Y axis. 

This is the initial creation of the graph without any modification or updates. 

To handle changes to the dataset i created a function called redraw()

```js
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
```

A lot of the code is also used in graphCreation() but there are some small differences. 
Instead of redrawing a lot of the chart, different data is parsed through. 
Using .join(), exit() and remove() are not necesarry unless custom code is used when exited. 

When inputs are detected by oninput code, a new dataset is created in the following function

```js
function updateData(range) {
    let compiledData = prepareData(cityValue, range)
    redraw(compiledData)
}
```
updateData() defines a new compiledData variable and executes the redraw function sending compiledData as parameter. 

```js
function prepareData(cityValue, range) {
    let combinedData = cityValue.slice(0, range ? range : 10)
    return combinedData.map(e => {
        return [e.particles, e.location]
    })
}
```
prepareData is again called upon and instead of defaulting to 10, the slice range is now 0 to the current input value. 
The returned combinedData object now contains the corresponding amount of results and sends this back to updateData() which sends this to the redraw() function.


![chart before change](https://imgur.com/a/4oiCxmw)
![chart after change](https://imgur.com/a/gIwOAuQ)

## Support
23899@hva.nl

## Credits
This project uses the following open source packages:

+ [D3.js](https://d3js.org/)

The following dataset is used

+ [RIVM Rioolwaterdata](https://data.rivm.nl/covid-19/COVID-19_rioolwaterdata.json)

## License
Matching app is released under the [MIT](https://github.com/jortdus/blok-tech/blob/main/LICENSE)
