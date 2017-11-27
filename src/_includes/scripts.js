var last_updated;
var interval_id = null;
var last_coins = [];
var coins = {};
var ls = localStorage;
var filter_bar = document.getElementById("filter-bar");
var filter_icon = document.getElementById("filter-icon");
var filter_clear = document.getElementById("clear-filter");
var clear_checks = document.getElementById("clear-checkboxes");
var open_settings = document.getElementById("open-settings");
var exit_settings = document.getElementById("exit-settings");
var pause_button = document.getElementById("pause");
var ep = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,XMR,DASH,BCH,ETC&tsyms=USD";

//helper functions
function cl(msg) { //create function for logging message so it's easy to disable verbose logging for production
    console.log(msg);
}

function update_status(str) {
    document.getElementById("status").innerHTML = str;
}

//https://stackoverflow.com/a/29622653/3126477
function sort_object(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

//https://stackoverflow.com/a/22395370/3126477
function arrays_are_equal(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = 0, len = arr1.length; i < len; i++){
        if (arr1[i] !== arr2[i]){
            return false;
        }
    }
    return true;
}

function getCurrentDateTime() {
    var today = new Date(); //outputs like Wed Apr 19 2017 00:25:35 GMT-0400 (EDT)
    var date = today.toString().split(" ", 4).join(" ");
    var time = today.toString().split(" ")[4];
    var hours = time.slice(0, -6);
    if (hours >= 13) {
        hours = hours - 12;
    }
    if (hours == "00") {
        hours = "12";
    }
    hours = ("0" + hours).slice(-2);
    var minSec = time.slice(-6);
    return date + " " + hours + minSec;
}

function disable_buttons() {
    open_settings.classList.add("disabled");
    pause_button.disabled = true;
}

function enable_buttons() {
    open_settings.classList.remove("disabled");
    pause_button.disabled = false;
}

//data
function getData() {
    update_status("Getting data from CryptoCompare...");
    var endpoint = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + Object.values(coins).toString() + "&tsyms=USD";
    var xhr = new XMLHttpRequest();
    xhr.timeout = 20000; //after 20 seconds stop trying to get data
    xhr.open('GET', endpoint);
    
    xhr.onloadend = function() {
        if (xhr.status === 200) { //if there were no errors
            var data = JSON.parse(xhr.responseText);
            for (var key in data["DISPLAY"]) {
                var el = document.querySelector("." + key);
                var price = data["DISPLAY"][key]["USD"]["PRICE"].replace(/\s/g,''); //remove white space that shows up before $ symbol
                var change = data["DISPLAY"][key]["USD"]["CHANGEPCT24HOUR"];
                var old_price = el.querySelector(".price").innerHTML;
                
                if (old_price) {
                    if (price > old_price) {
                        console.log("price went up - old price was " +  old_price + ", new price is " + price);
                        el.querySelector(".price").innerHTML = price;
                        //add class and remove with settimeout
                    } else if (price < old_price) {
                        console.log("price dropped - old price was " +  old_price + ", new price is " + price);
                        el.querySelector(".price").innerHTML = price;
                    } else {
                        console.log("old price and new price are the same");
                    }
                } else {
                    el.querySelector(".price").innerHTML = price;
                }
                
                if (change.startsWith("-")) {
                    el.querySelector(".change").innerHTML = change + "%";
                    el.querySelector(".change").style.color = "#ff3b30";
                } else {
                    el.querySelector(".change").innerHTML = "+" + change + "%";
                    el.querySelector(".change").style.color = "#4cd964";
                }
            }
            if (document.body.classList.contains("data-updating")) {
                document.body.classList.remove("data-updating");
            }
            if (interval_id === null) {
                cl("turning on auto updates");
                interval_id = setInterval(function() { update(); }, 11000);
            }
            document.body.classList.remove("elements-loading");
            update_status("Last updated: " + getCurrentDateTime());
            enable_buttons();
        } else if (xhr.timeout > 0 && xhr.status === 0) { //if a timeout occurs
            console.log("Timeout error getting data from " + endpoint);
            update_status("Error, check console...");
        } else { //if error occurs
            console.log("Error getting data from " + xhr.responseURL + " - " + xhr.responseText);
            update_status("Error, check console...");
        }
    }
    
    xhr.send(null);
}

function update() {
    cl("Getting updated data");
    document.body.classList.add("data-updating");
    getData();
}

function pause() {
    if (interval_id !=null) {
        cl("auto updates turned off");
        clearInterval(interval_id);
        interval_id = null;
        pause_button.innerHTML = "Resume";
    } else {
        update();
        pause_button.innerHTML = "Pause";
    }
}

function build_elements() {
    update_status("Building elements...");
    for (var key in coins) {
        var clone = document.getElementById("placeholder").cloneNode(true);
        var name = clone.querySelector(".name");
        var symbol = clone.querySelector(".symbol");
        var price = clone.querySelector(".price");
        var change = clone.querySelector(".change");
        clone.removeAttribute("id");
        clone.removeAttribute("style");
        clone.classList.add(coins[key]);
        clone.classList.add("actual");
        name.innerHTML = key;
        symbol.innerHTML = coins[key];
        document.getElementById("ticker").insertBefore(clone, document.getElementById("welcome"));
    }
    getData();
}

//filter
function filter_focus() {
    filter_bar.style.textAlign = "left";
    filter_icon.style.marginLeft = 0;
}

function filter_blur() {
    var len = filter_bar.value.length;
    if (len < 1) {
        filter_bar.removeAttribute("style");
        filter_icon.removeAttribute("style");
    }
}

function show_filter_clear() {
    var l = filter_bar.value.length;
    if (l > 0) {
        filter_bar.classList.add("show-clear");
    } else {
        filter_bar.classList.remove("show-clear")
    }
}

function clear_filter_bar(event) {
    if (event.type === "click" || event.keyCode === 13) {
        filter_bar.value = "";
        filter_bar.blur();
        filter_clear.blur();
        filter_blur();
        show_filter_clear();
        filter_coins();
    }
}

function filter_coins() {
    var parent = document.getElementById("checkboxes");
    var check = parent.getElementsByTagName("div");
    var term = filter_bar.value.toUpperCase();
    var flag_checked = /(^|\W):check($|\W)|(^|\W):checke($|\W)|(^|\W):checked($|\W)/gi;
    
    if (term.startsWith(":")) { //check if user is entering a special search flag
        cl("search flag detected");
        if (flag_checked.exec(term)) { //if user is searching for elements that are already checked
            for (var i = 0; i < check.length; i++) { //iterate through elements
                var input = check[i].getElementsByTagName("input")[0]; //the actual checkbox element
                if (input.checked) { //if checkbox is checked
                    check[i].style.display = ""; //make sure it's display isn't "none'
                } else {
                    check[i].style.display = "none"; //hide non-checked elements
                }
            }
        } else { //user is using a search flag but there aren't any flag matches, so show all checkboxes
            for (var i = 0; i < check.length; i++) {
                check[i].style.display = "";
            }
        }
    } else {
        cl("no search flag detected, filtering as usual");
        for (var i = 0; i < check.length; i++) {
            var label = check[i].getElementsByTagName("label")[0];
            if (label.innerHTML.toUpperCase().indexOf(term) > - 1) {
                check[i].style.display = "";
            } else {
                check[i].style.display = "none";
            }
        }
    }
}

//settings
function show_settings() {
    cl("showing settings page");
    disable_buttons();
    document.body.classList.add("show-settings");
    last_coins = Object.keys(coins);
}

function hide_settings() {
    if (arrays_are_equal(last_coins, Object.keys(coins))) { //check if changes were made to the coin tracking array
        document.body.classList.remove("show-settings"); //no changes detected
        enable_buttons();
    } else {
        document.querySelectorAll(".actual").forEach(function (e) {
            return e.parentNode.removeChild(e);
        });
        if (Object.keys(coins).length < 1) { //user removed all coins to track
            document.body.classList.remove("show-settings");
            enable_buttons();
        } else {
            document.body.classList.remove("show-settings");
            document.body.classList.add("elements-loading");
            build_elements();
        }
    }
}

function clear_all_checked() {
    var checkboxes = document.getElementsByClassName("ck");
    for(var i = 0; i < checkboxes.length; i++){
        var checkbox = checkboxes[i];
        if(checkbox.checked === true) {
            checkbox.checked = false;
        }
        coins = {};
        ls.clear();
    }
}

function save_setting(el) {
    var name = el.dataset.name;
    var symbol = el.id;
    if (el.checked) {
        coins[name] = symbol;
        coins = sort_object(coins);
        ls.setItem("coins", JSON.stringify(coins));
    } else {
        delete coins[name];
        ls.setItem("coins", JSON.stringify(coins));
        if (Object.keys(coins).length < 1) {
            ls.removeItem("coins");
        }
    }
}

function load_settings() {
    if (ls.coins) {
        cl("local storage exists, we should load it");
        coins = JSON.parse(ls.coins);
        for (var key in coins) {
            document.getElementById(coins[key]).setAttribute("checked", true);
        }
    }
}

filter_bar.addEventListener("focus", filter_focus);
filter_bar.addEventListener("blur", filter_blur);
filter_bar.addEventListener("keyup", show_filter_clear);
filter_bar.addEventListener("keyup", filter_coins);
filter_clear.addEventListener("click", clear_filter_bar);
filter_clear.addEventListener("keydown", clear_filter_bar);
clear_checks.addEventListener("click", clear_all_checked);
open_settings.addEventListener("click", show_settings);
exit_settings.addEventListener("click", hide_settings);
pause_button.addEventListener("click", pause);

load_settings();