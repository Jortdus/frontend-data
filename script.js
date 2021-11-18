// initializing empty array and array with a scale of 1 to 10
let excitementFactorInts = [];
const excitementFactorScale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Fetch data from form-data.json
const JSONfetch = fetch('./datasets/form-data.json')
	.then(results => results.json())

// Function parsing all data
function parseData() {
	return new Promise((resolve, reject) => {
			let dataSet = JSONfetch;
			resolve(dataSet);
		}).then(data => {
			// maps array, calls up on normalizeAnswers() which loops through it and normalizes data is dataset.
			return data.map(obj => {
				Object.keys(obj).forEach(key => {
					obj[key] = normalizeAnswers(obj[key])
				})
				return obj;
			})
		}).then(json => json.map((v, i, arr) => {
			// keyCleanup() changes a key value in a object to a specified string. 
			keyCleanup("Wat is je oogkleur?", "eyecolor", v)
			keyCleanup("Wat is je favoriete soort huisdier?", "pet", v)
			keyCleanup("Wat is je favoriete windrichting?", "wind", v)
			keyCleanup("Op een schaal van 1 tot 10, hoeveel zin heb je in de Tech Track?", "excitementFactor", v)
			keyCleanup("Kies zelf of je deze vraag beantwoord.", "choice", v)
			keyCleanup("Wat is je favoriete datum?", "datumFormat", v)
			keyCleanup("Wat is je favoriete datum, maar nu in tekst!", "datumString", v)
			keyCleanup("Wat is je favoriete zuivelproduct?", "dairy", v)
			keyCleanup("Welke kleur kledingstukken heb je aan vandaag? (Meerdere antwoorden mogelijk natuurlijk...)", "clothing", v)
			keyCleanup("Op welke verdieping van het TTH studeer je het liefst?", "tth", v)
			keyCleanup("Wat wil je worden als je groot bent?", "profession", v)
			keyCleanup("Wat wilde je later worden als je groot bent, maar nu toen je zelf 8 jaar was.", "bigSmall", v)
			keyCleanup("Kaas is ook een zoogdier?", "cheese", v)
			keyCleanup("Als je later een auto zou kopen, van welk merk zou deze dan zijn?", "car", v)
			return v
		}))
		// Catch to process error and logs this to console.
		.catch(err => {
			console.log("error", err);
		})
}

// using Object.assign, takes current key, assigns value to new key and deletes old key + value.
function keyCleanup(oldKey, newKey, obj) {
	delete Object.assign(obj, {
		[newKey]: obj[oldKey]
	})[oldKey];
}

// Takes value, str/int and turns it to a string and changes all occurances of capitals to lowercase. 
function normalizeAnswers(data) {
	return data.toString().toLowerCase()
}

// Function to receive "zin in" integer which is now a string, with parseInt turned back into a plain integer to use in D3.js
function answersToNumbers(data) {
	data.forEach(e => {
		excitementFactorInts.push({
			int: parseInt(e.excitementFactor)
		})
	})
}

// Call upon parseData() which proceeds to call upon answersToNumbers and graphCreation function
parseData().then(cleanData => {
	answersToNumbers(cleanData)
	graphCreation()
});

function graphCreation() {

		// set the dimensions and margins of the graph
		const margin = {
				top: 30,
				right: 30,
				bottom: 70,
				left: 60
			},
			width = 460 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	const svg = d3.select("#my_dataviz")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

// X axis
		const x = d3.scaleBand()
			.range([0, width])
			.domain(data.map(d => d.Country))
			.padding(0.2);
		svg.append("g")
			.attr("transform", `translate(0, ${height})`)
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

		// Add Y axis
		const y = d3.scaleLinear()
			.domain([0, 13000])
			.range([height, 0]);
		svg.append("g")
			.call(d3.axisLeft(y));

		// Bars
		svg.selectAll("mybar")
			.data(data)
			.join("rect")
			.attr("x", d => x(d.Country))
			.attr("y", d => y(d.Value))
			.attr("width", x.bandwidth())
			.attr("height", d => height - y(d.Value))
			.attr("fill", "#69b3a2")
}