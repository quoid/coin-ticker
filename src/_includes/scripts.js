var last_updated = 0;
var timeout_id = null;
var timeout_delay = 0;
var last_coins = [];
var coins = {};
var ls = localStorage;
var filter_bar = document.getElementById("filter-bar");
var filter_icon = document.getElementById("filter-icon");
var filter_clear = document.getElementById("clear-filter");
var button_clear_checks = document.getElementById("clear-checkboxes");
var button_show_settings = document.getElementById("show-settings");
var button_hide_settings = document.getElementById("hide-settings");
var button_update = document.getElementById("update");
var green = "#4cd964";
var red = "#ff3b30";
var max_checks = 50;

//helper functions
function cl(msg) { //create function for logging message so it's easy to disable verbose logging for production
    //console.log(msg);
}

function update_status(str) {
    document.getElementById("status").innerHTML = str;
}

function disable_buttons() {
    button_show_settings.classList.add("disabled");
    button_update.disabled = true;
}

function enable_buttons() {
    button_show_settings.classList.remove("disabled");
    button_update.disabled = false;
}

function sort_object(obj) { //https://stackoverflow.com/a/29622653/3126477
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

function arrays_are_equal(arr1, arr2) { //https://stackoverflow.com/a/22395370/3126477
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

function price_increase(i) {
    document.querySelectorAll(".price")[i].classList.add("up");
    setTimeout(function() {
        document.querySelectorAll(".price")[i].classList.remove("up");
    }, 250);
}

function price_decrease(i) {
    document.querySelectorAll(".price")[i].classList.add("down");
    setTimeout(function() {
        document.querySelectorAll(".price")[i].classList.remove("down");
    }, 250);
}

function delay_data_request(ms) { //this isn't currently used
    cl("Will get updated data from CryptoCompare in " + ms + "ms");
    update_status("Updating data in " + Math.round(ms/1000) + " seconds...");
    timeout_id = setTimeout(function() {
        getData();
        clearTimeout(timeout_id);
        timeout_id = null;
    }, ms);
}

function remove_data_request_delay() {
    cl("Cancelling the deffered data request");
    clearTimeout(timeout_id);
    timeout_id = null;
    document.body.classList.remove("data-updating");
    update_status("Last updated: " + get_current_date_time(new Date(last_updated)));
    enable_buttons();
}

function get_current_date_time(d) {
    var today = d //new Date(); outputs like Wed Apr 19 2017 00:25:35 GMT-0400 (EDT)
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

function format_number(x) { //https://stackoverflow.com/a/2901298/3126477
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


//not used
function time_since(date) { //https://stackoverflow.com/a/3177838/3126477
    var seconds = Math.floor((new Date() - date) / 1000);
    interval = Math.floor(seconds / 86400); //1 day, in seconds
    
    if (interval > 1) {
        return "more than days ago";
    }
    
    interval = Math.floor(seconds / 3600); //1 hour, in seconds
    if (interval > 1) {
        return interval + " hours ago";
    }
    
    interval = Math.floor(seconds / 60); //1 minute, in seconds
    if (interval > 1) {
        return interval + " minutes ago";
    }
    
    if (seconds >= 60 && seconds <= 120) {
        return "a minute ago";
    }
    
    if (seconds < 10) {
        return "moments ago";
    }
    return Math.floor(seconds) + " seconds ago";
    
}

//elements
function build_elements() {
    update_status("Building elements...");
    document.body.classList.add("elements-loading");
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
    update();
}

//data
function getData() {
    update_status("Getting data from CryptoCompare...");
    var endpoint = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + Object.values(coins).toString() + "&tsyms=USD";
    var xhr = new XMLHttpRequest();
    cl("Requesting data from " + endpoint);
    xhr.timeout = 20000; //after 20 seconds stop trying to get data
    xhr.open('GET', endpoint);
    
    xhr.onloadstart = function() {
        last_updated = Date.now();
    }
    
    xhr.onloadend = function() {
        if (xhr.status === 200) { //if there were no errors
            var data = JSON.parse(xhr.responseText);
            for (var key in data["DISPLAY"]) {
                var el = document.querySelector("." + key); //the element where we should put the data
                var price_el = el.querySelector(".price"); //the element that holds the price data
                var change_el = el.querySelector(".change"); //the element that holds the 24hr change data
                var price = data["DISPLAY"][key]["USD"]["PRICE"].replace(/\s/g,''); //the price data
                var change = data["DISPLAY"][key]["USD"]["CHANGEPCT24HOUR"]; //the 24hr change data
                var price_old = price_el.innerHTML; //the old price when updating, we use this to determine if it went up or down from last recorded price
                var change_old = change_el.innerHTML; //the old 24hr change, used to determine if it went up or down from last recorded 24hr change
                var i = Object.values(coins).indexOf(key) + 1; //store the index of the coin so we can use it for the increase and decrease price functions (+1 for placholder)
                
                if (data["RAW"][key]["USD"]["PRICE"] > 9999) { //for some reason large number only have 1 deciimal point
                    var a = format_number(data["RAW"][key]["USD"]["PRICE"]);
                    price = "$" + a;
                }
                
                
                //add/update price data
                if (price_old) { //if there's previously recorded price
                    if (price > price_old) { //if price went up
                        cl(key + " price has gone up - old price was " + price_old + ", new price is " + price);
                        price_el.innerHTML = price;
                        price_increase(i);
                    } else if (price < price_old) { //if price went down
                        cl(key + " price has gone down - old price was " + price_old + ", new price is " + price);
                        price_el.innerHTML = price;
                        price_decrease(i);
                    }
                } else { //no data yet added
                    price_el.innerHTML = price;
                }
                
                //add/update 24hr change data
                if (change != change_old) { //no special styling if change goes up or down, so we only update change if it changes
                    
                    //color 24hr change text
                    if (change.startsWith("-")) { //since we're getting back a string, we know it is negative if the string starts with a "-"
                        change_el.style.color = red;
                        change_el.innerHTML = change + "%";
                    } else {
                        change_el.style.color = green;
                        change_el.innerHTML = "+" + change + "%";
                    }
                }

            }
            //after for loop
            document.body.classList.remove("elements-loading");
            document.body.classList.remove("data-updating");
            update_status("Last updated: " + get_current_date_time(new Date(last_updated)));
            enable_buttons();
            cl("Data request complete");
        } else if (xhr.timeout > 0 && xhr.status === 0) { //if a timeout occurs
            console.log("Timeout error getting data from " + endpoint);
            update_status("Error, check console...");
        } else { //if non-timeout error occurs
            console.log("Error getting data from " + xhr.responseURL + " - " + xhr.responseText);
            update_status("Error, check console...");
        }
    }
    
    xhr.send(null);
}

function update() {
    if (document.querySelectorAll(".actual").length > 0) { //if there are elements that have data to update
        var last = Date.now() - last_updated; //log the difference between the current time and last update time set in the getData() function
        timeout_delay = 10000 - last; //how long to delay the update, to respect API limits
        disable_buttons();
        if (!document.body.classList.contains("elements-loading")) {
            document.body.classList.add("data-updating");
        }
        
        if (timeout_delay > 0) {
            cl("Will get updated data from CryptoCompare in " + timeout_delay + "ms");
            var delay;
            if (timeout_delay > 1000) {
                update_status("Updating data in " + Math.round(timeout_delay/1000) + " seconds...");
                delay = 1000;
            } else if (timeout_delay < 1000 && timeout_delay > 0) {
                update_status("Updating data in " + timeout_delay + " ms...");
                delay = timeout_delay;
            }
            timeout_id = setTimeout(function() {
                timeout_delay = timeout_delay - delay;
                clearTimeout(timeout_id);
                timeout_id = null;
                update();
            }, delay);
        } else {
            setTimeout(function() { //gives a better ux by showing the loading icon longer so user knows it is being updated
                getData();
            }, 500);
        }
    }
}

//filter
function filter_focus() {
    filter_bar.style.textAlign = "left";
    filter_icon.style.left = "22px";
}

function filter_blur() {
    var l = filter_bar.value.length;
    if (l < 1) {
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
    if (event.type === "click" || event.keyCode === 13 || event.type === "blur") {
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

//settings
function show_settings() {
    cl("Showing settings page");
    update_status("Settings");
    document.body.classList.add("settings");
    disable_buttons();
    last_coins = Object.keys(coins);
    document.getElementById("main").scrollTop = 0;
    //safari.extension.globalPage.contentWindow.ga_settings_page();
}

function hide_settings() {
    cl("Hiding settings page");
    update_status("Last updated: " + get_current_date_time(new Date(last_updated)));
    document.body.classList.remove("settings");
    document.getElementById("main").scrollTop = 0;
    clear_filter_bar(event);
    //safari.extension.globalPage.contentWindow.ga_ticker_page();
    if (Object.keys(coins).length < 1 && arrays_are_equal(last_coins, Object.keys(coins))) { //entered settings with no coins being tracked and exited the same
        //nothing being tracked so do nothing
        enable_buttons();
        update_status("Ready...");
    } else if (!arrays_are_equal(last_coins, Object.keys(coins))) { //entered settings with or without coins being tracked and changed coins to be tracked
        document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
            return e.parentNode.removeChild(e);
        });
        if (Object.keys(coins).length < 1) { //if coins are no longer being tracked
            update_status("Ready...");
            enable_buttons();
        } else {
            build_elements();
        }
    } else if (arrays_are_equal(last_coins, Object.keys(coins))) { //entered settings with coins being tracked and changed nothing
        if (document.querySelectorAll(".actual").length < 1) { //elements aren't already built for some reason
            build_elements();
        } else {
            enable_buttons();
        }
    }
}

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
        event.preventDefault();
        return false;
        cl("Too many coins are being tracked, remove some, then try again");
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

function load_settings() {
    if (ls.coins) {
        cl("Local storage exists, loading it");
        coins = JSON.parse(ls.coins);
        for (var key in coins) {
            document.getElementById(coins[key]).setAttribute("checked", true);
        }
    }
}

//start/open popover
function start() {
    update_status("Starting...");
    
    if (Object.keys(coins).length > 0) {
        if (document.querySelectorAll(".actual").length < 1) {
            build_elements();
        } else {
            if (timeout_id === null) {
                update();
            }
        }
    } else {
        update_status("Ready...");
    }
}

//drag n drop
//turns on dragging for the element by clicking it's coin icon
function mousedown(event) {
    var p = event.target.closest(".actual");
    //console.log("Turning drag on for elment with class name '" + p.className + "'");
    p.setAttribute("draggable", true);
}

//if the users clicks, but dragging does not start, immediately turn off the dragging capabailities
function mouseup(event) {
    var p = event.target.closest(".actual");
    if (!p.classList.contains(".dragging")) {
        p.removeAttribute("draggable");
    }
}

function dragstart(event) {
    if (event.target.classList.contains("actual")) {
        //console.log("Dragging started for element with class name '" + event.target.className + "'");
        event.target.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
    } else {
        event.preventDefault();
    }
}

function dragend(event) {
    if (event.target.classList.contains("actual")) {
        event.target.classList.remove("dragging");
        event.target.removeAttribute("draggable");
        if (document.querySelectorAll(".dragover").length > 0) {
            document.querySelector(".dragover").classList.remove("dragover");
        }
    }
}


//don't apply the effect to
//child elements
//elements that are being dragged
//elements the precede the element being dragged that aren't last in the list (last part of this needs to be completed)
function dragenter(event) {
    var dragon = event.target; //element that is getting dragged ONTO
    var dragging = document.querySelector(".dragging"); //element being dragged
    
    //if element being dragged onto is a child element of an .actual element, target the parent
    if (!dragon.classList.contains("actual")) { 
        dragon = event.target.closest(".actual");
    }
    
    //if NOT the element being dragged & not the immediate nextSibling of the element being dragged
    if (!dragon.classList.contains("dragging") && dragon != dragging.nextSibling) {
        //if another element has the dragover class, remove it before applying to new element
        if (document.querySelectorAll(".dragover").length > 0) {
            document.querySelector(".dragover").classList.remove("dragover");
        }
        dragon.classList.add("dragover");
    }
}

function dragover(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    var dragging = document.querySelector(".dragging");
    var dropping = event.target;
    if (!event.target.classList.contains("actual")) {
        dropping = event.target.closest(".actual");
    }
    document.getElementById("ticker").insertBefore(dragging, dropping);
    set_coins_order();
}

function set_coins_order() {
    var actual = document.querySelectorAll(".actual");
    coins = {};
    ls.clear();
    for (var i = 0; i < actual.length; i++) {
        var name = actual[i].querySelector(".name").innerHTML;
        var symbol = actual[i].querySelector(".symbol").innerHTML;
        coins[name] = symbol;
    }
    ls.setItem("coins",JSON.stringify(coins));
    if (!ls.order) {
        ls.setItem("order", "custom");
    }
}

//event listeners
button_show_settings.addEventListener("click", show_settings);
button_hide_settings.addEventListener("click", hide_settings);
button_clear_checks.addEventListener("click", clear_all_checked);
filter_bar.addEventListener("focus", filter_focus);
filter_bar.addEventListener("blur", filter_blur);
filter_bar.addEventListener("keyup", show_filter_clear);
filter_bar.addEventListener("keyup", filter_coins);
filter_clear.addEventListener("click", clear_filter_bar);
filter_clear.addEventListener("keydown", clear_filter_bar);
button_update.addEventListener("click", function() {
    update();
    //safari.extension.globalPage.contentWindow.ga_update_event();
});
window.addEventListener("blur", function() {
    cl("Window or extension lost focus");
    if (timeout_id != null) {
        remove_data_request_delay();
    }
    
    if (document.body.classList.contains("settings")) {
        hide_settings();
    }
    //safari.extension.globalPage.contentWindow.ga_close_event();
});

load_settings();
start();