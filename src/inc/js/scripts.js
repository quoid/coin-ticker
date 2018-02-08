// variables

var body = document.body;
var coins = {};
var last_coins = [];
var ls = localStorage;
var max_checks = 46;
var currency = "USD";
var last_curr = "";
var timeout_id = null;
var last_updated = 0;
var timeout_delay = 0;
var api_throttle = 10000;//10000;

// buttons & inputs
var button_refresh = document.getElementById("button-refresh");
var button_settings = document.getElementById("button-settings");
var button_tracking = document.getElementById("button-tracking");
var button_back = document.getElementById("button-back");
var button_reset = document.getElementById("button-reset");
var button_uncheck_all = document.getElementById("uncheck");
var currency_select = document.getElementById("currency");
var filter_bar = document.getElementById("filter-bar");
var filter_clear = document.getElementById("clear-filter");

//body classes
var settings_page_class = "show-settings";
var tracking_page_class = "show-tracking";
var single_page_class = "show-single";
var loading_class = "loading";
var updating_class = "updating";

//colors
var green = "#4cd964";
var red = "#ff3b30";

var transition_time = 175; //this is the transition time for the view navigation, check off-canvas.scss variable - this is needed to fix bug in Safari
var update_animation_time = 650; //this is the time (in ms) for the update icon to make a full rotation

//helper functions
function cl(msg) {
    console.log(msg);
}

function update_status(str, title) {
    var status_element = document.getElementById("status");
    status_element.innerHTML = str;
    status_element.title = title;
    
}

function fix_safari_scroll(id) {
    document.getElementById(id).style.overflowY = "hidden";
    setTimeout(function() {
        document.getElementById(id).style.overflowY = "scroll";
        document.getElementById(id).removeAttribute("style");
    }, transition_time);
}

function sort_object(obj) { //https://stackoverflow.com/a/29622653/3126477
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

function scroll_top_tracking_page() {
    var tp = document.getElementById("tracking");
    tp.style.overflowY = "scroll";
    tp.scrollTop = 0; //scroll page back to top
    tp.removeAttribute("style");
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

function get_current_date_time(d) {
    var today = new Date(d); //new Date(); outputs like Wed Apr 19 2017 00:25:35 GMT-0400 (EDT)
    var date = today.toString().split(" ", 4).join(" ");
    var time = today.toString().split(" ")[4];
    var hours = time.slice(0, -6);
    var period = "AM";
    if (hours >= 13) {
        hours = hours - 12;
        period = "PM";
    }
    if (hours == "00") {
        hours = "12";
    }
    hours = ("0" + hours).slice(-2);
    var minSec = time.slice(-6);
    return date + " " + hours + minSec + " " + period;
}

function get_last_updated(d) {
    var then = d;
    var now = Date.now();
    var diff = (now - then)/1000; //the difference between the two unix timestamps is reflected in ms, so divide it by 1000 to get differences in seconds

    if (diff < 86400) { //if last updated was in the past 24 hours
        
        var raw = get_current_date_time(then); //e.g. Thu Feb 08 2018 01:18:24 PM
        var time = raw.split(" ").slice(-2, 5)[0].split(":").slice(0,2).join(":"); //change time from 01:18:24 to 01:18
        var period = raw.split(" ").slice(-1, 6)[0]; //just the AM or PM
        
        if (new Date(now).getDate() === new Date(then).getDate()) {
            return "Today at " + time + " " + period;
        } else {
            return "Yesterday at " + time + " " + period;
        }
        
    } else {
        return "More than a 24 hours ago"
    }
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
    body.classList.remove(updating_class);
    update_status("Last updated: " + get_last_updated(last_updated), get_current_date_time(last_updated));
}

// page navigation
function show_settings() {
    if (!body.classList.contains(settings_page_class)) {
        cl("Showing settings page");
        update_status("Settings", "");
        body.classList.add(settings_page_class);
        last_coins = Object.keys(coins);
        last_curr = ls.currency;
    }
}

function show_tracking() {
    if (body.classList.contains(settings_page_class) && !body.classList.contains(tracking_page_class)) {
        body.classList.add(tracking_page_class);
        fix_safari_scroll("tracking");
        cl("Showing tracking page");
    }
}

function back() {
    if (body.classList.contains(settings_page_class) && body.classList.contains(tracking_page_class)) { //on coin tracking page, going back to settings page
        body.classList.remove(tracking_page_class);
    } else if (body.classList.contains(settings_page_class) && !body.classList.contains(tracking_page_class)) { //on settings page, going back to ticker page
        body.classList.remove(settings_page_class);
        hide_settings();
    } /*else if (!body.classList.contains(settings_page_class) && body.classList.contains(single_page_class)) { //on single coin page, going back to ticker page
        body.classList.remove(single_page_class);
    }*/
}

//settings
function set_currency() {
    ls.setItem("currency", currency_select.value);
    currency = currency_select.value;
}

function hide_settings() {
    cl("Hiding settings page");
    clear_filter_bar(event);
    scroll_top_tracking_page();
    
    if (last_curr != ls.currency || !arrays_are_equal(last_coins, Object.keys(coins))) {
        document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
            return e.parentNode.removeChild(e);
        });
        if (Object.keys(coins).length > 0) { //there are coins to track / elements to be built
            build_elements();
        }
    } else {
        if (document.querySelectorAll(".actual").length > 0) { //if there are elements that were previously tracked
            update_status("Last updated: " + get_last_updated(last_updated), get_current_date_time(last_updated));
        } else { //if ticker is empty
            update_status("Ready...", "");
        }
    }
}

//elements
function build_elements() {
    update_status("Building elements...", "");
    body.classList.add(loading_class);
    for (var key in coins) {
        var clone = document.getElementById("placeholder").cloneNode(true);
        var name = clone.querySelector(".ti-name");
        var symbol = clone.querySelector(".ti-symbol");
        var price = clone.querySelector(".ti-price");
        var change = clone.querySelector(".ti-change");
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
function update() {
    if (document.querySelectorAll(".actual").length > 0) { //if there are elements that have data to update
        var last = Date.now() - last_updated; //log the difference between the current time and last update time set in the getData() function
        timeout_delay = api_throttle - last; //how long to delay the update, to respect API limits
        
        if (!body.classList.contains(loading_class)) { //this checks if user clicked the update button vs startup or rebuilding els
            body.classList.add(updating_class);
        }
        
        if (timeout_delay > 0) { //if the time between api calls is within the threshold set in the api_throttle variable
            cl("Will get updated data from CryptoCompare in " + timeout_delay + "ms");
            var delay;
            if (timeout_delay > 1000) { //if greater than a second
                update_status("Updating data in " + Math.round(timeout_delay/1000) + " seconds...");
                delay = 1000;
            } else if (timeout_delay < 1000 && timeout_delay > 0) { //if less than a second but still greater than 0
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
                get_data();
            }, 500);
        }
    }
}

function get_data() {
    update_status("Getting data from CryptoCompare...", "");
    var endpoint = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + Object.values(coins).toString() + "&tsyms=" + currency;
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
                var price_el = el.querySelector(".amount"); //the element that holds the price data
                var sign_el = el.querySelector(".sign"); //the element that holds the currency sign
                var price_old = el.querySelector(".amount").innerHTML; //old price used to determine if price went up/down since last update
                var price = data["DISPLAY"][key][currency][ "PRICE"].split(" ")[1]; //price data
                var sign = data["DISPLAY"][key][currency][ "TOSYMBOL"]; //currency sign from data, e.g. $ €
                var change_el = el.querySelector(".ti-change"); //the element that holds the 24hr change data
                var change = data["DISPLAY"][key][currency]["CHANGEPCT24HOUR"]; //the 24hr change data
                var i = Object.values(coins).indexOf(key) + 1; //store the index of the coin so we can use it for the increase and decrease price functions (+1 for placholder)
                
                //set currency sign
                sign_el.innerHTML = sign;
                if (sign.length > 1) { //if the currency sign is letters instead of a symbol
                    sign_el.innerHTML = "<span>" + sign + "</span>";
                }
                                
                //add/update price data
                price_el.innerHTML = price;
                if (price_old) { //if there's previously recorded price
                    if (parseFloat(price) > parseFloat(price_old)) { //if price went up
                        cl(key + " price has gone up - old price was " + parseFloat(price_old) + ", new price is " + parseFloat(price));
                        price_increase(i);
                    } else if (parseFloat(price) < parseFloat(price_old)) { //if price went down
                        cl(key + " price has gone down - old price was " + parseFloat(price_old) + ", new price is " + parseFloat(price));
                        price_decrease(i);
                    }
                }
                
                //color 24hr change text
                if (change.startsWith("-")) { //since we're getting back a string, we know it is negative if the string starts with a "-"
                    change_el.style.color = red;
                    change_el.innerHTML = change + "%";
                } else {
                    change_el.style.color = green;
                    change_el.innerHTML = "+" + change + "%";
                }
            }
            
            body.classList.remove(loading_class);
            body.classList.remove(updating_class);
            update_status("Last updated: " + get_last_updated(last_updated), get_current_date_time(last_updated));
        } else if (xhr.timeout > 0 && xhr.status === 0) { //if a timeout occurs
            console.log("Timeout error getting data from " + endpoint);
            update_status("Error, check console...", "");
        } else { //if non-timeout error occurs
            console.log("Error getting data from " + xhr.responseURL + " - " + xhr.responseText);
            update_status("Error, check console...", "");
        }
    }
    
    xhr.send(null);
    
}

function price_increase(i) {
    document.querySelectorAll(".ti-price")[i].classList.add("up");
    setTimeout(function() {
        document.querySelectorAll(".ti-price")[i].classList.remove("up");
    }, 350);
}

function price_decrease(i) {
    document.querySelectorAll(".ti-price")[i].classList.add("down");
    setTimeout(function() {
        document.querySelectorAll(".ti-price")[i].classList.remove("down");
    }, 350);
}

//tracking page filtering
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
            button_uncheck_all.style.display = "block"; //show uncheck all button
            for (var i = 0; i < check.length; i++) { //iterate through elements
                var input = check[i].getElementsByTagName("input")[0]; //the actual checkbox element
                if (input.checked) { //if checkbox is checked
                    check[i].style.display = ""; //make sure it's display isn't "none"
                } else {
                    check[i].style.display = "none"; //hide non-checked elements
                }
            }
        } else { //user is using a search flag but there aren't any flag matches, so show all checkboxes
            button_uncheck_all.removeAttribute("style"); //make sure uncheck all button isn't showing
            for (var i = 0; i < check.length; i++) {
                check[i].style.display = "";
            }
        }
    } else {
        cl("No search flag detected, filtering as usual");
        button_uncheck_all.removeAttribute("style"); //make sure uncheck all button isn't showing
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


//tracking checkboxes
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

function clear_all_checked() {
    var checkboxes = document.getElementsByClassName("ck");
    for(var i = 0; i < checkboxes.length; i++){
        var checkbox = checkboxes[i];
        if(checkbox.checked === true) {
            checkbox.checked = false;
        }
        coins = {};
        ls.removeItem("coins");
    }
}

//start
function start() {
    update_status("Starting...", "");
    if (Object.keys(coins).length > 0) { //if there are coins set to be tracked
        if (document.querySelectorAll(".actual").length < 1) { //if the coin elements are not yet built
            build_elements();
        } else {
            update();
        }
        
    } else {
        update_status("Ready...", "");
    }
}

// event listeners
button_settings.addEventListener("click", show_settings);
button_tracking.addEventListener("click", show_tracking);
button_back.addEventListener("click", back);

filter_bar.addEventListener("keyup", show_filter_clear);
filter_clear.addEventListener("click", clear_filter_bar);
filter_clear.addEventListener("keydown", clear_filter_bar);
filter_bar.addEventListener("keyup", filter_coins);
button_uncheck_all.addEventListener("click", clear_all_checked);

currency_select.addEventListener("change", set_currency);

button_refresh.addEventListener("click", function() {
    if (!body.classList.contains(updating_class)) { //make sure data isn't already updating
        update();
    }
});

window.addEventListener("blur", function() {
    cl("Window or extension lost focus");
    if (timeout_id != null) {
        remove_data_request_delay();
    }
    
    if (body.classList.contains(tracking_page_class)) {
        body.classList.remove(tracking_page_class);
    }
    
    if (body.classList.contains(settings_page_class)) {
        body.classList.remove(settings_page_class);
        //hide_settings();
        clear_filter_bar(event);
        scroll_top_tracking_page();
        update_status("Last updated: " + get_last_updated(last_updated), get_current_date_time(last_updated));
    }
    
});

function cv() {
    
}

//check for updates
function check_new_version() {
    //this will check if there's a new version of the plugin available to users
    //first we check if the user has suppressed checks
    
    if (!ls.checkVersion) { //if version checking in on
        
        if (!ls.lastVersionCheck) { //if no version check has occured yet
            ls.setItem("lastVersionCheck", Date.now());
        }
        
        /*
        console.log(new Date(Date.now()), new Date(parseInt(ls.lastVersionCheck)));
        var d = (Date.now()/1000) - (parseInt(ls.lastVersionCheck)/1000);
        console.log(d);
        */
    }
    
    /*
    console.log("checking for a new version");
    var a = "https://raw.githubusercontent.com/quoid/coin-ticker/master/coin_ticker.plist";
    var xhr = new XMLHttpRequest();
    var parser = new DOMParser();
    xhr.open('GET', a);
    xhr.onloadend = function() {
        if (xhr.status === 200) { //if there were no errors
            var data = parser.parseFromString(xhr.responseText,"text/xml");
            var a = data.getElementsByTagName("dict")[1];
            var b = a.getElementsByTagName("key");
            console.log(a.childNodes[15].innerHTML);
        }
    }
    xhr.send(null);
    */
}

//on load
function load_settings() {
    if (ls.coins) { //check if local storage exists for coin to track
        cl("Local storage exists for coin tracking, loading it");
        coins = JSON.parse(ls.coins); //set the global object to whatever is in the local storage for tracked coins
        for (var key in coins) { //tick the appropiate checkboxes for the coins that are in local storage
            document.getElementById(coins[key]).setAttribute("checked", true);
        }
    }
    if (!ls.currency) { //checks if the local storage setting for currency does NOT exist
        ls.setItem("currency", "USD"); //if it doesn't, that means this is the first time using the extension, so we set the currency to default value (usd)
    } else { //if the local storage setting for currency does exist...
        cl("Local storage exists for currency, loading it");
        currency = ls.currency; //set the global variable for currency to whatever is in local storage
        currency_select.options[currency_select.selectedIndex].removeAttribute("selected"); //remove the selected attribute from the default currency setting (usd)
        document.getElementById("c_" + ls.currency.toLowerCase()).setAttribute("selected", "selected"); //set the selected attribute for whatever is set in local storage
    }
}

load_settings();
check_new_version();