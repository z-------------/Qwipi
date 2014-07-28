var params = location.href.parseURL("params");
var slug = Object.keys(params)[0];

function initQuiz(quizData) {
    var quizElem = $("#quiz");
    var quizTitle;

    xhr("quizzes/" + slug + ".json", function (r) {
        r = JSON.parse(r);
        var qs = r.questions;
        
        quizTitle = r.title.encodeHTML();
        quizElem.innerHTML = "<h2 class='title'>" + quizTitle + "</h2>";
        quizElem.innerHTML += "<p>by " + r.creator.encodeHTML() + "</p>";
        quizElem.innerHTML += "<p><a href='results?" + slug + "'>View results</a>";

        for (i = 0; i < qs.length; i++) {
            var type = qs[i].type;
            
            var qNode = document.createElement("li");
            qNode.dataset.type = type;
            qNode.innerHTML = "<h2>" + qs[i].text.encodeHTML() + "</h2><ul class='alist'></ul>";
            var aList = qNode.$(".alist");
            
            if (type === "checkbox" || type === "radio") {
                var choices = qs[i].choices;
                for (j = 0; j < choices.length; j++) {
                    aList.innerHTML += "<label><input type='%s' name='%s'>%s</label>".subs(type, i, choices[j].encodeHTML());
                }
            } else if (type === "text") {
                aList.innerHTML = "<label><input type='text' name='%s'></label>".subs(i);
            } else if (type === "number") {
                var min = qs[i].min.toString();
                var max = qs[i].max.toString();
                
                var helpText = "Please enter a number between " + min + " and " + max;
                
                aList.innerHTML = "<p>%s</p><label><input type='number' name='%s' min='%s' max='%s'></label>".subs(helpText, i, min, max);
            }

            quizElem.appendChild(qNode);
        }
        
        var inputs = $$("#quiz input");
        for (i=0; i<inputs.length; i++) {
            if (inputs[i].getAttribute("type") !== "checkbox") {
                inputs[i].setAttribute("required", "true");
            }
            
            inputs[i].onchange = inputs[i].oninput = function(){
                window.onbeforeunload = function(){
                    return "You haven't submitted your response yet.";
                };
            };
        }
        
        document.title = r.title + " - qwipi";
    });
    
    $("form").onsubmit = function (e) {
        e.preventDefault();
        
        var qElems = quizElem.$$("li");
        var answers = [];
        
        for (i=0; i<qElems.length; i++) {
            var type = qElems[i].dataset.type;
            var text = qElems[i].$("h2").textContent;
            
            if (type === "checkbox") {
                var choices = qElems[i].$$("input:checked");
                
                var _answers = [];
                for (j = 0; j < choices.length; j++) {
                    _answers.push(choices[j].parentElement.textContent);
                }
                answers.push({
					type: type,
                    question: text,
                    answer: _answers
                });
            } else if (type === "radio") {
                var answer = qElems[i].$("input:checked").parentElement.textContent;
                answers.push({
					type: type,
                    question: text,
                    answer: answer
                });
            } else if (type === "text") {
                var answer = qElems[i].$("input").value.replace(/"/g,"'");
                answers.push({
					type: type,
                    question: text,
                    answer: answer
                });
            } else if (type === "number") {
                var answer = parseInt(qElems[i].$("input").value);
                answers.push({
					type: type,
                    question: text,
                    answer: answer
                });
            }
        }
        
        window.onbeforeunload = null;
        
        alert("Thank you for taking the survey.");
        location = "submit?title=" + encodeURIComponent(quizTitle) + "&slug=" + encodeURIComponent(slug) + "&json=" + encodeURIComponent(JSON.stringify(answers));
    };
}

initQuiz();