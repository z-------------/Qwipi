Array.prototype.uniqueElems = function() {
	var elems = [];
	var i;
	for (i=0; i<this.length; i++) {
		if (elems.indexOf(this[i]) === -1) {
			elems.push(this[i]);
		}
	}
	return elems.sort();
};

Array.prototype.occurences = function() {
	var uniques = this.uniqueElems();
	var counts = {};
	var i;
	
	for (i=0; i<uniques.length; i++) {
		counts[uniques[i]] = 0;
	}
	
	for (i=0; i<this.length; i++) {
		counts[this[i]] += 1;
	}
	
	return counts;
};

Chart.defaults.global.animation = false;
Chart.defaults.global.tooltipFontFamily = "'Source Sans Pro', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.global.tooltipFillColor  = "#e5e5e5";
Chart.defaults.global.tooltipFontColor = "black";

var params = location.href.parseURL("params");
var slug = Object.keys(params)[0];

xhr("results/" + slug + ".json", function(r) {
    try {
        r = JSON.parse(r);
        showResults(r);
    } catch (e) {
        $("content").textContent = "There's nothing here ;_;";
    }
});

function showResults(r) {
    var results = r.results;
    var title = r.title;
	
	var questionsRow = document.createElement("tr");
    for (i=0; i<results[0].length; i++) {
		var questionHeader = document.createElement("th");
        questionHeader.textContent = results[0][i].question;
		questionHeader.dataset.index = i;
		questionHeader.dataset.type = results[0][i].type;
        questionsRow.appendChild(questionHeader);
    }
    $("table").appendChild(questionsRow);
    
    for (i=0; i<results.length; i++) {
        var answersRow = document.createElement("tr");
        for (j=0; j<results[i].length; j++) {
			var answerTD = document.createElement("td");
			
			if (results[i][j].type === "checkbox") {
				for (k=0; k<results[i][j].answer.length; k++) {
					var endChar = "; ";
					if (k === results[i][j].answer.length - 1) {
						endChar = "";
					}
					answerTD.innerHTML += "<span>" + results[i][j].answer[k].encodeHTML() + "</span>" + endChar;
				}
			} else {
				answerTD.textContent = results[i][j].answer;
			}
            answersRow.appendChild(answerTD);
        }
        $("table").appendChild(answersRow);
    }
    
    var h2 = document.createElement("h2");
    h2.innerHTML = "Results - <a href='survey?" + slug + "'>" + title.encodeHTML() + "</a>";
    $("content").insertBefore(h2, $("table"));
	
	showCharts();
    
    document.title = "Results - " + title + " - qwipi";
}

function showCharts() {
	var palette = ["#fa8072", "#fa72a8", "#fac472", "#fa72ec", "#72fa80", "#72ecfa", "#72a8fa", "#72fac4"];
	
	var graphQs = document.querySelectorAll("[data-type='radio'], [data-type='checkbox']");
	var chartsDiv = document.querySelector("#charts");

	for (i=0; i<graphQs.length; i++) {
		var chartData = [];
		var index = Number(graphQs[i].dataset.index);
		var questionText = graphQs[i].textContent;
		var answers = [];
		var tds = document.querySelectorAll("td:nth-child(" + (index+1) + ")");
		
		for (j=0; j<tds.length; j++) {
			if (graphQs[i].dataset.type === "radio") {
				answers.push(tds[j].textContent);
			} else if (graphQs[i].dataset.type === "checkbox") {
				var spans = tds[j].querySelectorAll("span");
				for (k=0; k<spans.length; k++) {
					answers.push(spans[k].textContent);
				}
			}
		}
		
		var uniques = answers.uniqueElems();
		var counts = answers.occurences();
		
		for (j=0; j<uniques.length; j++) {
			var color = palette[j] || "rgb(" + Math.round(Math.random()*255) + "," + Math.round(Math.random()*255) + "," + Math.round(Math.random()*255) + ")";
			chartData.push({
				label: uniques[j],
				value: counts[uniques[j]],
				color: color
			});
		}
		
		var chartContainer = document.createElement("div");
		chartContainer.innerHTML = "<h3>" + questionText + "</h3>";
		
		var canvas = document.createElement("canvas");
		canvas.width = 250;
		canvas.height = 250;
		var ctx = canvas.getContext("2d");
		
		chartContainer.appendChild(canvas);
		
		var chart = new Chart(ctx).Doughnut(chartData);
		
		var legend = document.createElement("div");
		legend.innerHTML = chart.generateLegend();
		
		chartContainer.appendChild(legend);
		
		chartsDiv.appendChild(chartContainer);
	}
}