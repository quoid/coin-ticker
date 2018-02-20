"use strict";

//https://nodejs.org/api/fs.html
var fs = require("fs");

//https://github.com/gulpjs/gulp
var gulp = require("gulp");

//https://github.com/cjroth/gulp-filelist
var filelist = require("gulp-filelist");

//https://github.com/ThierrySpetebroot/gulp-fn
var gulpFn  = require("gulp-fn");

//https://github.com/sindresorhus/del
var del = require("del");

gulp.task("create", function() {
    fs.writeFile("./icons.json", "", function(err) {
        if (err) {
            console.log("\x1b[31m%s\x1b[0m", "Failed create icons.json file");
        } else {
            console.log("\x1b[32m%s\x1b[0m", "Sucessfully created icons.json");
            //gulp.start("icons");
        }
    });
});

gulp.task("icons", ["create"], function() {
    console.log("\x1b[32m%s\x1b[0m", "Creating filename array from files in /img/coins folder...");
    return gulp.src("./src/inc/img/coins/*")
        .pipe(filelist("icons.json", {
            flatten: true,
            removeExtensions: true
        }))
        .pipe(gulp.dest("./"));
});

gulp.task("coins_var", ["icons"], function() {
    gulp.src("./icons.json")
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
            fs.writeFile("./src/_sass/_coins.scss", text, function(err) {
                if (err) {
                    console.log("\x1b[31m%s\x1b[0m", "Failed to write to coins.scss file");
                } else {
                    console.log("\x1b[32m%s\x1b[0m", "Sucessfully wrote to coins.sccs file");
                    gulp.start("del");
                }
            });
        }));
});

gulp.task("del", function() {
    console.log("\x1b[31m%s\x1b[0m", "Removing unnecessary files...");
    return del([
        "./icons.json"
    ]);
});

gulp.task("default", ["coins_var"]);