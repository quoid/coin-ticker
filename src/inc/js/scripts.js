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
var api_throttle = 10000; //how often a user can request updated price data in ms
var time_between_checks = 600; //time between motd checks in seconds

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
var time_format_toggle = document.getElementById("ampm");
var button_close_motd = document.getElementById("close-alert");

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
    //console.log(msg);
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
    var t = new Date(d); //outputs Wed Apr 19 2017 00:25:35 GMT-0400 (EDT);
    var date = t.toString().split(" ", 4).join(" "); //outputs Web Apr 19 2017
    var time = t.toString().split(" ")[4]; //outpts 00:25:35
    var timezone = t.toString().split(" ")[6]; //otputs (EDT)
    
    var output = date + " " + time + " " + timezone;
    //time formats
    // 24hr - Fri Feb 09 2018 11:49:57 (EST)
    //12hr - Fri Feb 09 2018 11:49:57 AM (EST)
    
    if (ls.ampm) { //if the user has set the time format to AM/PM (if this setting doesn't exist, user kept default format at 24 hour clock)
        var hours = time.slice(0, -6); //outputs 00
        var period = "AM";
        if (hours >= 13) {
            hours = hours - 12;
            period = "PM";
        }
        if (hours == "00") {
            hours = "12";
        }
        hours = ("0" + hours).slice(-2);
        var min_sec = time.slice(-6);
        output = date + " " + hours + min_sec + " " + period + " " + timezone;
    }
    
    return output;
}

function format_last_updated(d) {
    var then = d;
    var now = Date.now();
    var diff = (now - then)/1000; //the difference between the two unix timestamps is reflected in ms, so divide it by 1000 to get differences in seconds
    var output;
            
    if (diff < 86400) { //if difference is less than 24 hours
        var raw = get_current_date_time(then);
        var time = raw.split(" ").slice(4, 5)[0].split(":").slice(0,2).join(":"); //in both 12/24 time format, the time portion is in the 4 index, remove seconds here
        var hour = time.split(":").slice(0,1)[0]; //get hour for adding AM/PM

        if (parseInt(hour) > 0 && parseInt(hour) < 10) {
            time = time.substring(1);
        }
                
        if (new Date(now).getDate() === new Date(then).getDate()) { //compares the days within the 24 hour to see if they occured on the same day
            output = "Today at " + time;
        } else {
            output= "Yesterday at " + time;
        }
        
        if (ls.ampm) {
            var period = raw.split(" ").slice(5, 6);
            output += " " + period;
        }
        
    } else {
        output = "More than a 24 hours ago";
    }
    
    return output;
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
    update_status("Last updated: " + format_last_updated(last_updated), get_current_date_time(last_updated));
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

function get_select_index(ele, text) { //https://stackoverflow.com/q/7489982/
    for (var i=0; i<ele.length;i++) {
        if (ele[i].childNodes[0].nodeValue === text){
            return i;
        }
    }
    return undefined;
}

//settings
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
            update_status("Last updated: " + format_last_updated(last_updated), get_current_date_time(last_updated));
        } else { //if ticker is empty
            update_status("Ready...", "");
        }
    }
}

function set_currency() {
    ls.setItem("currency", currency_select.value);
    currency = currency_select.value;
}

function change_time_format(event) {
    if (event.target.checked) { //when enabling AM/PM
        cl("ampm turned on");
        ls.setItem("ampm", "on");
    } else {
        cl("am pm turned off");
        ls.removeItem("ampm");
    }
}

function reset() {
    ls.clear();
    document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
        return e.parentNode.removeChild(e);
    });
    clear_all_checked();
    document.getElementById("ampm").checked = false;
    body.classList.remove(settings_page_class);
    ls.setItem("currency", "USD");
    document.getElementById("c_usd").setAttribute("selected", "selected");
    currency_select.selectedIndex = get_select_index(currency_select, "USD");
    currency = "USD";
    update_status("Ready...", "");
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
        clone.classList.add(coins[key].toLowerCase());
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
                var el = document.querySelector("." + key.toLowerCase()); //the element where we should put the data
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
            update_status("Last updated: " + format_last_updated(last_updated), get_current_date_time(last_updated));
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

//check for MOTD
function check_motd() {
    
    if (!ls.motdCleared) {
        document.getElementById("alert").style.display = "block";
        document.getElementById("alert").getElementsByTagName("span")[0].innerHTML = ls.motd;
    }
    
    if (!ls.lastCheck || ((Date.now()/1000) - (parseInt(ls.lastCheck)/1000) > time_between_checks)) { //no motd ever checked or time between checks hit
        ls.setItem("lastCheck", Date.now());
        ls.removeItem("motdCleared")
        get_motd();
    }
}

function get_motd() {
    var endpoint = "https://raw.githubusercontent.com/quoid/coin-ticker/motd/motd.json";
    var xhr = new XMLHttpRequest();
    xhr.timeout = 20000;
    xhr.open('GET', endpoint);
    xhr.onloadend = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            document.getElementById("alert").style.display = "block";
            if (data["enabled"] != "false") {
                var message = data["message"][Math.floor(Math.random() * data["message"].length)];
                ls.setItem("motd", message);
                document.getElementById("alert").getElementsByTagName("span")[0].innerHTML = message;
                document.getElementById("alert").style.display = "block";
            }
        } else if (xhr.timeout > 0 && xhr.status === 0) {
            console.log("Timeout error getting data from " + endpoint);
        } else {
             console.log("Error getting data from " + xhr.responseURL + " - " + xhr.responseText);
        }
    }
    xhr.send(null);
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

//drag n drop
//turns on dragging for the element by clicking it's coin icon
function mousedown(event) {
    var p = event.target.closest(".actual");
    cl("Turning drag on for elment with class name '" + p.className + "'");
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
        cl("Dragging started for element with class name '" + event.target.className + "'");
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
//elements that precede the element being dragged that aren't last in the list (last part of this needs to be completed)
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
    ls.removeItem("coins");
    for (var i = 0; i < actual.length; i++) {
        var name = actual[i].querySelector(".ti-name").innerHTML;
        var symbol = actual[i].querySelector(".ti-symbol").innerHTML;
        coins[name] = symbol;
    }
    ls.setItem("coins",JSON.stringify(coins));
    if (!ls.order) {
        ls.setItem("order", "custom");
    }
}

//start
function start() {
    update_status("Starting...", "");
    check_motd();
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
button_reset.addEventListener("click", reset);

filter_bar.addEventListener("keyup", show_filter_clear);
filter_clear.addEventListener("click", clear_filter_bar);
filter_clear.addEventListener("keydown", clear_filter_bar);
filter_bar.addEventListener("keyup", filter_coins);
button_uncheck_all.addEventListener("click", clear_all_checked);

currency_select.addEventListener("change", set_currency);

time_format_toggle.addEventListener("click", change_time_format);

button_refresh.addEventListener("click", function() {
    if (!body.classList.contains(updating_class)) { //make sure data isn't already updating
        update();
    }
});
button_close_motd.addEventListener("click", function(){
    ls.setItem("motdCleared", "true");
    document.getElementById("alert").removeAttribute("style");
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
        update_status("Last updated: " + format_last_updated(last_updated), get_current_date_time(last_updated));
    }
    
});

//on load
function load_settings() {
    if (ls.coins) { //check if local storage exists for coin to track
        cl("Local storage exists for coin tracking, loading it");
        coins = JSON.parse(ls.coins); //set the global object to whatever is in the local storage for tracked coins
        for (var key in coins) { //tick the appropiate checkboxes for the coins that are in local storage
            document.getElementById(coins[key]).checked = true;
        }
    }
    if (!ls.currency) { //checks if the local storage setting for currency does NOT exist
        ls.setItem("currency", "USD"); //if it doesn't, that means this is the first time using the extension, so we set the currency to default value (usd)
    } else { //if the local storage setting for currency does exist...
        cl("Local storage exists for currency, loading it");
        currency = ls.currency; //set the global variable for currency to whatever is in local storage
        currency_select.selectedIndex = -1; //reset the selected option for currency select
        document.getElementById("c_usd").removeAttribute("selected"); //remove the default selected option (USD)
        currency_select.selectedIndex = get_select_index(currency_select, ls.currency); //set the locally stored currency as the selection
        document.getElementById("c_" + ls.currency.toLowerCase()).setAttribute("selected", "selected"); //set the selected attribute
    }
    if (ls.ampm) { //user has turned on AM/PM time format previously
        cl("Local storage exists for time format, loading it");
        document.getElementById("ampm").checked = true;
    }
}

load_settings();