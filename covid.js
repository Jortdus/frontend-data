// let cityValue = []

// //Datafetch from RIVM
// // const covidFetch = fetch('https://data.rivm.nl/covid-19/COVID-19_rioolwaterdata.json ')
// //     .then(results => results.json())


// const covidFetch = fetch('./data/covid.json')
//     .then(results => results.json())

// const provinceFetch = fetch('./data/province.json')
//     .then(results => results.json())

// function parseCovid() {
//     covidFetch.then(data => {
//         resolve(data)
//         console.log(data)
//         data.forEach(e => {
//             cityValue.push({
//                 particles: e['RNA_flow_per_100000'],
//                 location: e['RWZI_AWZI_name'],
//                 date: e['Date_measurement']
//             })
//         })

//     }).catch(err => {
//         console.log(err)
//     })
// }

// function parseProvince() {
//     return provinceFetch((resolve, reject) => {
//         let data = provinceFetch
//         resolve(data)
//     }).then(data => {
//         return data.map(obj => {
//             Object.keys(obj).forEach(key => {
//                 obj[key] = normalizeAnswers(obj[key])
//             })
//             return obj;
//         })
        
//     })
// }

// function normalizeAnswers(data) {
// 	return data.toString().toLowerCase()
// }

// parseCovid().then(data => {
//     console.log()
// })   






