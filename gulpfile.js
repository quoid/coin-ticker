"use strict";

//https://nodejs.org/api/fs.html
var fs = require("fs");

//https://github.com/cheeriojs/cheerio
var cheerio = require("cheerio");
var $ = cheerio.load(fs.readFileSync("./src/partials/checkboxes.html"));

//https://github.com/sindresorhus/del
var del = require("del");

//https://github.com/gulpjs/gulp
var gulp = require("gulp");

//https://github.com/wizicer/gulp-csvtojson
var csvtojson = require("gulp-csvtojson");

//https://github.com/cjroth/gulp-filelist
var filelist = require("gulp-filelist");

//https://github.com/coderhaoxin/gulp-file-include
var fileinclude = require("gulp-file-include");

//https://github.com/ThierrySpetebroot/gulp-fn
var gulpFn  = require("gulp-fn");

//https://github.com/jonschlinkert/gulp-htmlmin
var htmlmin = require("gulp-htmlmin");

//https://github.com/fmal/gulp-inline-source
var inlinesource = require("gulp-inline-source");

//https://github.com/dlmanning/gulp-sass
var sass = require("gulp-sass");

//https://github.com/avevlad/gulp-connect
var connect = require("gulp-connect");

//colors - https://stackoverflow.com/a/41407246/3126477
/*task order
    - set version
    - empty coins.scss
    - empty #checkboxes html element within checkbox.html
    - create coins.json
    - convert coins.csv to coins.json
    - create checkbox element from coins.json
    - create coin-icon sass var from icons.json
    - convert sass to scss
    - pull in file-includes
        - popover.html
        - settings.html
        - ticker.html
    - inline css/js
    - minify html/css/js
    - remove
        - icons.json
        - coins.json
        - main.css
        - partials folder that got copied over in file-includes task
*/

gulp.task("empty", function() {
    console.log("\x1b[31m%s\x1b[0m", "Emptying files...");
    $("#checkboxes").empty();
    fs.writeFileSync("./src/partials/checkboxes.html", $.html());
    fs.writeFileSync("./src/sass/coins.scss", "");
});

gulp.task("create", function() {
    fs.writeFile("./src/icons.json", "", function(err) {
        if (err) {
            console.log("\x1b[31m%s\x1b[0m", "Failed create icons.json file");
        } else {
            console.log("\x1b[32m%s\x1b[0m", "Sucessfully created icons.json");
            gulp.start("icons");
        }
    });
});

gulp.task("icons", function() {
    console.log("\x1b[32m%s\x1b[0m", "Creating filename array from files in /img/coins folder...");
    return gulp.src("./src/img/coins/*")
        .pipe(filelist("icons.json", {
            flatten: true,
            removeExtensions: true
        }))
        .pipe(gulp.dest("./src"));
});

gulp.task("csv", function() {
    console.log("\x1b[32m%s\x1b[0m", "Converting CSV to JSON...");
    return gulp.src("./src/coins.csv")
        .pipe(csvtojson({toArrayString:true}))
        .pipe(gulp.dest("./src"));
});

gulp.task("checkboxes", ["csv"], function() {
    gulp.src("./src/coins.json")
        .pipe(gulpFn(function(file) {
            var data = JSON.parse(file.contents.toString("utf8"));
            for (var key in data) {
                var name = data[key]["name"];
                var sym = data[key]["symbol"];
                $("#checkboxes").append(''+
                    '<div title="' + name + ' ' + sym + '">'+
                        '<input type="checkbox" class="ck" id="' + sym + '" value="' + sym + '" data-name="' + name + '" onclick="save_setting(event);">'+
                    '   <label for="' + sym + '">' + name + ' (' + sym + ')</label>'+
                    '</div>');
            }
            fs.writeFile("./src/partials/checkboxes.html", $.html(), function(err) {
                if (err) {
                    console.log("\x1b[31m%s\x1b[0m", "Failed to write to HTML file");
                } else {
                    console.log("\x1b[32m%s\x1b[0m", "Sucessfully wrote to HTML file");
                    gulp.start("include");
                }
            });
        }));
});

gulp.task("coins_var", ["icons"], function() {
    gulp.src("./src/icons.json")
        .pipe(gulpFn(function(file) {
            var data = JSON.parse(file.contents.toString("utf8"));
            var text = "";
            for (var key in data) {
                var sym = data[key];
                if (key == 0) {
                    text += '$coins:' + '"' + sym.toLowerCase() +'",';
                } else if (key == Object.keys(data).length - 1) {
                    text += '"' + sym.toLowerCase() +'";';
                } else {
                    text += '"' + sym.toLowerCase() +'",';
                }
            }
            fs.writeFile("./src/sass/coins.scss", text, function(err) {
                if (err) {
                    console.log("\x1b[31m%s\x1b[0m", "Failed to write to coins.scss file");
                } else {
                    console.log("\x1b[32m%s\x1b[0m", "Sucessfully wrote to coins.sccs file");
                    gulp.start("remove");
                }
            });
        }));
});

gulp.task("include", function() {
    console.log("\x1b[32m%s\x1b[0m", "Including necessary files...");
    gulp.src(["./src/**/*.html"])
        .pipe(fileinclude({
            prefix: "@@",
            basepath: "@root"
        }))
        .pipe(gulp.dest("./dist"));
});

gulp.task("sass", function() {
    console.log("\x1b[32m%s\x1b[0m", "Converting SASS to CSS...");
    return gulp.src("./src/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("./src"));
});

gulp.task("inline", ["sass"], function () {
    console.log("\x1b[32m%s\x1b[0m", "Inlining CSS/JS...");
    return gulp.src("./dist/popover.html")
        .pipe(inlinesource())
        .pipe(gulp.dest("./dist"));
});

gulp.task("minify", ["inline"], function() {
    console.log("\x1b[32m%s\x1b[0m", "Minifying...");
    return gulp.src("./dist/popover.html")
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeOptionalTags: false
        }))
        .pipe(gulp.dest("./dist"));
});

gulp.task("move", ["minify"], function() {
    console.log("\x1b[32m%s\x1b[0m", "Moving files...");
    return gulp.src("./src/img/**")
        .pipe(gulp.dest("./dist/img"))
        .pipe(connect.reload());
});

gulp.task("remove", ["move"], function() {
    console.log("\x1b[31m%s\x1b[0m", "Removing unnecessary files...");
    return del([
        "./src/icons.json",
        "./src/coins.json",
        "./src/main.css",
        "./src/partials/version.html",
        "./dist/partials/**"
    ]);
});

gulp.task("version", function() {
    var version = require('./package.json').version;
    console.log("\x1b[32m%s\x1b[0m", "Setting version...");
    fs.writeFileSync("./src/partials/version.html", "&nbsp;" + version); 
});

gulp.task("build", ["version", "empty", "create", "csv", "checkboxes", "coins_var"]);

gulp.task("watch", function() {
    gulp.watch(["./src/**/*.scss", "./src/popover.html", "./src/*.js"], ["build"]);
});

gulp.task("server", ["watch"], function() {
    connect.server({
        root: "dist",
        livereload: true,
        fallback: "./dist/popover.html"
    });;
});