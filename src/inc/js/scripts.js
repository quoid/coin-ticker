var body = document.body;

var transition_time = 175; //this is the transition time for the different views, check off-canvas.scss variable - this is needed to fix bug in Safari

//buttons & inputs
var button_refresh = document.getElementById("button-refresh");
var button_settings = document.getElementById("button-settings");
var button_tracking = document.getElementById("button-tracking");
var button_back = document.getElementById("button-back");
var button_reset = document.getElementById("button-reset");
var currency_select = document.getElementById("currency");
var filter_bar = document.getElementById("filter-bar");
var filter_clear = document.getElementById("clear-filter");

//body classes
var settings_page_class = "show-settings";
var tracking_page_class = "show-tracking";
var single_page_class = "show-single";

var green = "#4cd964";
var red = "#ff3b30";

var coins = {};
var last_coins = [];
var ls = localStorage;
var max_checks = 46;
var last_curr = "";

function cl(msg) {
    console.log(msg);
}

function fix_safari_scroll(id) {
    document.getElementById(id).style.overflowY = "hidden";
    setTimeout(function() {
        document.getElementById(id).style.overflowY = "scroll";
        document.getElementById(id).removeAttribute("style");
    }, transition_time);
}

function update_status(str) {
    document.getElementById("status").innerHTML = str;
}

function sort_object(obj) { //https://stackoverflow.com/a/29622653/3126477
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

function show_settings() {
    if (!body.classList.contains(settings_page_class)) {
        cl("Showing settings page");
        update_status("Settings");
        body.classList.add(settings_page_class);
        last_coins = Object.keys(coins);
        last_curr = ls.currency;
        
    }
}

function hide_settings() {
    cl("Hiding settings page");
    clear_filter_bar(event);
    
    if (last_curr != ls.currency) {
        
    }
    
}

function show_tracking() {
    if (body.classList.contains(settings_page_class) && !body.classList.contains(tracking_page_class)) {
        body.classList.add(tracking_page_class);
        document.getElementById("tracking").scrollTop = 0; //scroll page back to top
        fix_safari_scroll("tracking");
    }
}

function back() {
    if (body.classList.contains(settings_page_class) && body.classList.contains(tracking_page_class)) { //on coin tracking page, go back to settings page
        body.classList.remove(tracking_page_class);
    } else if (body.classList.contains(settings_page_class) && !body.classList.contains(tracking_page_class)) { //on settings page, go back to ticker page
        hide_settings();
        body.classList.remove(settings_page_class);
    } else if (!body.classList.contains(settings_page_class) && body.classList.contains(single_page_class)) { //on single coin page, go back to ticker page
        body.classList.remove(single_page_class);
    }
}

//filter
function show_filter_clear() {
    var l = filter_bar.value.length;
    if (l > 0) {
        filter_clear.style.display = "block";
    } else {
        filter_clear.removeAttribute("style");
    }
}

function clear_filter_bar(event) {
    if (event.type === "click" || event.keyCode === 13 || event.type === "blur") {
        filter_bar.value = "";
        filter_bar.blur();
        filter_clear.blur();
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
        cl("Search flag detected");
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
        cl("No search flag detected, filtering as usual");
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

//checkboxes
function save_setting(event) {
    var name = event.target.dataset.name; //name = Bitcoin, Litecoin, etc...
    var symbol = event.target.id; //id = BTC, LTC, etc...
    if (document.querySelectorAll(".ck:checked").length < max_checks) { //user can allow track up to this amount, due to API limits
        if (event.target.checked) { //when ticking a checkbox
            coins[name] = symbol; //push to coins object
            if (!ls.order) { //only sort if the user has not set a custom order
                coins = sort_object(coins); //sort the coins object alphabetically by name (not symbol)
            }
            ls.setItem("coins", JSON.stringify(coins)); //save to local storage
        } else { //when unticking a checkbox
            delete coins[name]; //delete key/value from object
            ls.setItem("coins", JSON.stringify(coins)); //overwrite local storage
            if (Object.keys(coins).length < 1) { //if it was the last coin (meaning user is no longer tracking any coins)
                ls.removeItem("coins"); //remove the local storage item
                ls.removeItem("order");
            }
        }
    } else {
        cl("Too many coins are being tracked, remove some, then try again");
        event.preventDefault();
        return false;
    }
}


//event listeners
button_settings.addEventListener("click", show_settings);
button_back.addEventListener("click", back);
button_tracking.addEventListener("click", show_tracking);

filter_bar.addEventListener("keyup", show_filter_clear);
filter_bar.addEventListener("keyup", filter_coins);
filter_clear.addEventListener("click", clear_filter_bar);
filter_clear.addEventListener("keydown", clear_filter_bar);


/*
function toggleClass(el, cl) {
    if (el.classList.contains(cl)) {
        el.classList.remove(cl);
    } else {
        el.classList.add(cl);
    }
}

document.getElementById("button-refresh").addEventListener("click", function(){
    if (!document.body.classList.contains("updating")) {
        document.body.classList.add("updating");
        setTimeout(function(){
            document.body.classList.remove("updating");
        }, 1950);
    }
});

document.getElementById("button-settings").addEventListener("click", function(){
    if (!document.body.classList.contains("show-settings")) {
        document.body.classList.add("show-settings");
    }
});


document.getElementById("button-tracking").addEventListener("click", function(){
    if (document.body.classList.contains("show-settings") && !document.body.classList.contains("show-tracking")) {
        document.body.classList.add("show-tracking");
    }
});



document.getElementById("si").addEventListener("click", function(){
    if (!document.body.classList.contains("show-settings") && !document.body.classList.contains("show-single")) {
        document.body.classList.add("show-single");
    }
});




document.getElementById("button-back").addEventListener("click", function(){
    if (document.body.classList.contains("show-settings") && document.body.classList.contains("show-tracking")) {
        document.body.classList.remove("show-tracking");
    } else if (document.body.classList.contains("show-settings") && !document.body.classList.contains("show-tracking")) {
        document.body.classList.remove("show-settings");
    } else if (!document.body.classList.contains("show-settings") && document.body.classList.contains("show-single")) {
        document.body.classList.remove("show-single");
    }
});
*/