Array.prototype.uniqueElems = function () {
	var elems = [];
	var i;
	for (i = 0; i < this.length; i++) {
		if (elems.indexOf(this[i]) === -1) {
			elems.push(this[i]);
		}
	}
	return elems.sort();
};

Array.prototype.occurences = function () {
	var uniques = this.uniqueElems();
	var counts = {};
	var i;

	for (i = 0; i < uniques.length; i++) {
		counts[uniques[i]] = 0;
	}

	for (i = 0; i < this.length; i++) {
		counts[this[i]] += 1;
	}

	return counts;
};

Array.prototype.flatten = function () {
	return [].concat.apply([], this);
};

Chart.defaults.global.animation = false;
Chart.defaults.global.tooltipFontFamily = "'Source Sans Pro', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.global.tooltipFillColor = "#e5e5e5";
Chart.defaults.global.tooltipFontColor = "black";

var params = location.href.parseURL("params");
var slug = Object.keys(params)[0];

xhr("results/" + slug + ".json", function (r) {
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
	for (i = 0; i < results[0].length; i++) {
		var questionHeader = document.createElement("th");
		questionHeader.textContent = results[0][i].question;
		questionHeader.dataset.index = i;
		questionHeader.dataset.type = results[0][i].type;
		questionsRow.appendChild(questionHeader);
	}
	$("table").appendChild(questionsRow);

	for (i = 0; i < results.length; i++) {
		var answersRow = document.createElement("tr");
		for (j = 0; j < results[i].length; j++) {
			var answerTD = document.createElement("td");

			if (results[i][j].type === "checkbox") {
				for (k = 0; k < results[i][j].answer.length; k++) {
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

	showCharts(results);

	document.title = "Results - " + title + " - qwipi";
}

function showCharts(results) {
	var chartQs = [];
	var chartsDiv = document.querySelector("#charts");
	var palette = ["#fa8072", "#fa72a8", "#fac472", "#fa72ec", "#72fa80", "#72ecfa", "#72a8fa", "#72fac4"];

	for (i = 0; i < results[0].length; i++) {
		chartQs.push({
			title: results[0][i].question,
			type: results[0][i].type,
			answers: []
		});
	}

	for (i = 0; i < results.length; i++) {
		for (j = 0; j < results[i].length; j++) {
			chartQs[j].answers.push(results[i][j].answer);
		}
	}

	for (i = 0; i < chartQs.length; i++) {
		if (chartQs[i].type === "radio" || chartQs[i].type === "checkbox") {
			var flatAnswers = chartQs[i].answers.flatten();

			var uniques = flatAnswers.uniqueElems();
			var counts = flatAnswers.occurences();

			var chartData = [];

			for (j = 0; j < uniques.length; j++) {
				chartData.push({
					label: uniques[j],
					value: counts[uniques[j]],
					color: palette[j] || "rgb(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ")"
				});
			}

			var chartContainer = document.createElement("div");
			chartContainer.innerHTML = "<h3>" + chartQs[i].title + "</h3>";

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
}