var express = require("express");
var app = express();
var fs = require("fs");
var http = require("http").Server(app);
var io = require("socket.io")(http);

var paf = process.cwd() + "/public/";

var fsOptions = {
    encoding: "utf8"
};

if (!fs.existsSync(paf + "quizzes")) {
    fs.mkdirSync(paf + "quizzes");
}

if (!fs.existsSync(paf + "results")) {
    fs.mkdirSync(paf + "results");
}

app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.sendfile(paf + "index.html");
});

app.get("/survey", function (req, res) {
    if (Object.keys(req.query).length > 0) {
        var slug = Object.keys(req.query)[0];

        fs.exists(paf + "quizzes/" + slug + ".json", function (exists) {
            if (exists) {
                res.sendfile(paf + "quiz.html");
            } else {
                res.render("error", { error: "404" });
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/create", function (req, res) {
    res.sendfile(paf + "newcreate.html");
});

app.get("/submit", function (req, res) {
    var slug = decodeURIComponent(req.query.slug);
    var results = JSON.parse(decodeURIComponent(req.query.json));
    var title = decodeURIComponent(req.query.title);

    var resultsFilePath = paf + "results/" + slug + ".json";

    fs.exists(resultsFilePath, function (exists) {
        if (exists) {
            fs.readFile(resultsFilePath, fsOptions, function (err, data) {
                data = JSON.parse(data);
                data.results.push(results);

                fs.writeFile(resultsFilePath, JSON.stringify(data), fsOptions, function () {
                    res.redirect("/results?" + slug);
                    console.log("wrote new response to '" + slug + "'");
                });
            });
        } else {
            var fileSetup = {
                "title": title,
                "results": [results]
            }

            fs.writeFile(resultsFilePath, JSON.stringify(fileSetup), fsOptions, function () {
                res.redirect("/results?" + slug);
                console.log("wrote first response to '" + slug + "'");
            });
        }
    });
});

app.get("/submitcreate", function (req, res) {
    var slug = decodeURIComponent(req.query.slug);

    fs.exists(paf + "quizzes/" + slug + ".json", function (exists) {
        if (!exists) {
            fs.writeFile(paf + "quizzes/" + slug + ".json", decodeURIComponent(req.query.json), fsOptions, function (err) {
                if (err) {
                    res.render("error", { error: "500" });
                } else {
                    console.log("created new survey: '" + slug + "'");
                    res.redirect("survey?" + slug);
                }
            });
        } else {
            res.render("error", { error: "500" });
        }
    });
});

app.get("/results", function (req, res) {
    res.sendfile(paf + "results.html");
});

app.get("/tos", function (req, res) {
    res.sendfile(paf + "tos.html");
});

app.get("/random", function (req, res) {
    fs.readdir(paf + "quizzes/", function (err, files) {
        try {
            files = files.filter(function (val) {
                return val.substring(val.lastIndexOf("."), val.length) === ".json";
            });

            var chosenFile = files[Math.round(Math.random() * (files.length - 1))];
            chosenFile = chosenFile.substring(0, chosenFile.lastIndexOf(".json"));
            res.redirect("survey?" + chosenFile);
        } catch (e) {
            res.render("error", { error: "500" });
        }
    });
});

app.get(/^(.+)$/, function (req, res) {
    fs.exists(paf + req.params[0], function (exists) {
        if (exists) {
            res.sendfile(paf + req.params[0]);
        } else {
            res.render("error", { error: "404" });
        }
    });
});

io.on("connection", function (socket) {
    socket.on("check slug", function (slug) {
        fs.exists(paf + "quizzes/" + slug + ".json", function (exists) {
            if (exists) {
                socket.emit("slug taken");
            } else {
                socket.emit("slug available");
            }
        });
    });
});

http.listen(3000, function () {
    console.log("Qwipi running on *:3000");
});