var socket = io();

var qwipTemplate = "\
<input type='text' class='qwipi title' placeholder='Question text'>\
<select class='qwipi type'>\
<option value='text'>Text</option>\
<option value='radio'>Single choice</option>\
<option value='checkbox'>Multiple choice</option>\
</select>\
<input type='button' value='-' class='remq hoveronly'>\
\
<ul class='clist'></ul>\
\
<div class='qwipi manchoices'>\
<input type='button' value='Add choice' class='add hoveronly'>\
<input type='button' value='Remove choice' class='rem hoveronly'>\
</div>\
";

var json = {};

var qwipList = $("#qwiplist");
var addButton = $("#add");
var title = $("#title");
var nick = $("#nick");
var slug = $("#slug");

addButton.onclick = function(focus){
    var newQwip = document.createElement("li");
    newQwip.classList.add("qwip");
    newQwip.innerHTML = qwipTemplate;
    newQwip.dataset.type = "text";
    qwipList.appendChild(newQwip);
    
    newQwip.$(".remq").onclick = function(){
        var confirmRem = confirm("Are you sure you want to delete this question?");
        
        if (confirmRem) {
            this.parentElement.parentElement.removeChild(this.parentElement);
        }
    };
    
    newQwip.$(".add").onclick = function(){
        var newChoice = document.createElement("li");
        newChoice.innerHTML = "<input type='text' placeholder='Choice text'>";
        newChoice.classList.add("choice");
        newQwip.$(".clist").appendChild(newChoice);
    };
    
    newQwip.$(".rem").onclick = function(){
        var choiceLis = newQwip.$$(".clist .choice");
        var lastChoice = choiceLis[choiceLis.length-1];
        if (lastChoice) {
            lastChoice.parentElement.removeChild(lastChoice);
        }
    };
    
    newQwip.$(".type").onchange = function(){
        newQwip.dataset.type = this.value;
    };
    
    if (focus !== false) {
        newQwip.$(".title").focus();
    }
};

title.oninput = title.onchange = function () {
    this.value = this.value.removeSpecial();
    
    var slugworthy = this.value.toLowerCase().split(" ").join("-");
    slug.value = slugworthy;
};

nick.oninput = nick.onchange = function () {
    this.value = this.value.removeSpecial();
};

socket.on("slug available", function() {
    location = "submitcreate?slug=" + encodeURIComponent(slug.value) + "&json=" + encodeURIComponent(JSON.stringify(json));
});

socket.on("slug taken", function() {
    alert("That slug is not available. Please choose a different quiz title.");
});

title.onchange = function () {
    this.value = this.value.replace()
};

$("#submit").onclick = function(){
    // validate title, nick and slug
    if (title.isValid() && nick.isValid() && slug.isValid()) {
        submit();
    } else {
        alert("Please make sure that you have filled in both the Title and Nick fields.");
    }
};

function submit() {
    var questions = $$(".qwip");
    
    json.title = title.value;
    json.creator = nick.value;
    json.date = new Date().getTime();
    json.questions = [];
    
    for (i=0; i<questions.length; i++) {
        var qJSON = {};
        qJSON.text = questions[i].$(".title").value.replace(/"/g,"'");
        qJSON.type = questions[i].dataset.type;
        
        if (qJSON.type === "radio" || qJSON.type === "checkbox") {
            var choices = questions[i].$$(".clist .choice");
            var cJSON = [];
            
            for (j=0; j<choices.length; j++) {
                cJSON.push(choices[j].$("input").value.replace(/"/g,"'"));
            }
            
            qJSON.choices = cJSON;
        }
        
        json.questions.push(qJSON);
    }
    
    if (questions.length > 0) {
        socket.emit("check slug", slug.value);
    } else {
        alert("Please make sure your survey has at least one question.");
    }
}

addButton.onclick(false);