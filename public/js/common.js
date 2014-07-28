var $ = function (selector) {
    if (document.querySelectorAll(selector).length > 1) {
        return document.querySelectorAll(selector);
    } else {
        return document.querySelector(selector);
    }
};

HTMLElement.prototype.$ = function (selector) {
    if (this.querySelectorAll(selector).length > 1) {
        return this.querySelectorAll(selector);
    } else {
        return this.querySelector(selector);
    }
};

HTMLInputElement.prototype.isValid = function() {
    var valid = this.value.split(" ").join("").length > 0;
    return valid;
};

String.prototype.encodeHTML = function() {
    var div = document.createElement("div");
    div.textContent = this;
    return div.innerHTML;
};

String.prototype.removeSpecial = function() {
    return this.replace(/[^a-zA-Z\s]/g, "");
};

var $$ = function (selector) {
    return document.querySelectorAll(selector);
};

HTMLElement.prototype.$$ = function (selector) {
    return this.querySelectorAll(selector);
};

var xhr = function (url, callback) {
    var req = new XMLHttpRequest();
    req.onload = function () {
        var response = this.responseText;
        callback(response);
    };
    req.open("get", url, true);
    req.send();
};

String.prototype.subs = function (vars) {
    var string = this;

    var marker = "%s";
    var incr = 0;
    var args = arguments;

    while (string.indexOf(marker) !== -1) {
        string = string.replace(marker, args[incr]);
        incr++;
    }

    return string;
};

Math.roundTo = function (n, rt) {
    return Math.round(n / rt) * rt;
};

// move content down to allow space for header
// $("content").style.marginTop = $("header").offsetHeight + "px";
$("content").style.marginTop = "90px";

window.onscroll = function () {
    if (document.body.scrollTop > 30) {
        $("header").classList.add("float");
    } else {
        $("header").classList.remove("float");
    }
};

String.prototype.parseURL = function (target) {
    var parser = document.createElement("a");
    parser.href = this;
    switch (target) {
    case "protocol":
        return parser.protocol;
        break;
    case "hostname":
        return parser.hostname;
        break;
    case "port":
        return parser.port;
        break;
    case "path":
        return parser.pathname;
        break;
    case "patharray":
        var _pathstring = parser.pathname.substring(1, this.length - 1); // cut off leading and ending slashes (/)
        return _pathstring.split("/");
        break;
    case "paramsstring":
        return parser.search;
        break;
    case "params":
        var _urlparams = parser.search.substring(1, parser.search.length).split("&"); // ["foo=bar","bax=qux","waffles=pie"]
        var _paramsobject = {};
        for (i = 0; i < _urlparams.length; i++) {
            var _key = _urlparams[i].split("=")[0];
            var _val = _urlparams[i].split("=")[1];
            _paramsobject[_key] = _val;
        };
        return _paramsobject;
        break;
    case "hash":
        return parser.hash;
        break;
    case "host":
        return parse.host;
        break;
    default:
        return parser.href;
        break;
    }
};

$("header h1").innerHTML = "<a href='/'>" + $("header h1").innerHTML + "</a>";