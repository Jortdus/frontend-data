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





## Support
23899@hva.nl

## Credits
This project uses the following open source packages:

+ [D3.js](https://d3js.org/)

The following dataset is used

+ [RIVM Rioolwaterdata](https://data.rivm.nl/covid-19/COVID-19_rioolwaterdata.json)

## License
Matching app is released under the [MIT](https://github.com/jortdus/blok-tech/blob/main/LICENSE)
