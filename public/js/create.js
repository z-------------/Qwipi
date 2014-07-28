var socket = io();

var exampleJSON = {
    "questions": [{
        "text": "What is the answer to life, the universe and everything?",
        "type": "checkbox",
        "choices": ["pi", "42", "chocolate"]
    }, {
        "text": "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        "type": "text"
    }, {
        "text": "How much do you like waffles?",
        "type": "number",
        "min": 0,
        "max": 5
    }, {
        "text": "Which is better, waffles or pancakes?",
        "type": "radio",
        "choices": ["waffles", "pancakes"]
    }]
};

var title = $("#title");
var nick = $("#nick");
var slug = $("#slug");
var jsonInput = $("#jsoninput");

var editor = ace.edit("jsoninput");
editor.setTheme("ace/theme/xcode");
editor.getSession().setMode("ace/mode/yaml");
editor.getSession().setUseWrapMode(true);
editor.setOption("showPrintMargin",false);
editor.setOption("showFoldWidgets",false);
editor.getSession().setUseWrapMode(false)

var finalJSON;

var exampleYAML = YAML.stringify(exampleJSON);
editor.setValue(exampleYAML.replace(/'/g,"\""));

editor.gotoLine(1);

title.oninput = title.onchange = function () {
    this.value = this.value.removeSpecial();
    
    var slugworthy = this.value.toLowerCase().split(" ").join("-");
    slug.value = slugworthy;
};

nick.oninput = nick.onchange = function () {
    this.value = this.value.removeSpecial();
};

socket.on("slug available", function() {
    location = "submitcreate?slug=" + slug.value + "&json=" + JSON.stringify(finalJSON);
});

socket.on("slug taken", function() {
    alert("Slug is not available. Please choose a different quiz title.");
});

title.onchange = function () {
    this.value = this.value.replace()
};

$("form").onsubmit = function (e) {
    e.preventDefault();
    
    finalJSON = YAML.parse(editor.getValue());
    console.log(finalJSON);
    
    finalJSON.title = title.value;
    finalJSON.creator = nick.value;
    finalJSON.date = new Date().getTime();
    
    socket.emit("check slug", slug.value);
};

if (localStorage.seenTOS !== "true") { // hide tos after first time
    var tosCheck = document.createElement("label");
    tosCheck.setAttribute("id", "terms");
    tosCheck.innerHTML = "<input type='checkbox' required>I agree to the <a href='tos' target='_blank'>Terms of Service</a>";
    $("form").insertBefore(tosCheck, $("#submit"));
}