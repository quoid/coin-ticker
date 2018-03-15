var clusterize;
var chks = [];
var coins = {};
var last_coins = [];
var last_updated = 0;
var last_curr = "";
var ls = localStorage;
var max_checks = 46;
var ux_delay = 0;
var default_coins = {"Bitcoin":"BTC","Ethereum":"ETH","Litecoin":"LTC","Vertcoin":"VTC"};
var currency = "USD";
var timeout_delay = 0;
var timeout_id = null;
var api_throttle = 60000; //10000; //how often a user can request updated price data in ms
var time_between_checks = 86400; //time between motd checks in seconds


//classes
var body = document.body;
var class_app_loading = "loading";
var class_app_updating = "updating";
var class_tracking_page = "show-tracking"; 
var class_checkbox_loading = "checkboxes-loading";
var class_show_checked = "show-checked";
var class_settings_page = "show-settings";
var class_show_alert = "show-alert";
var ti_prefix = "ci_";

//sections
var app_loader = document.getElementById("loader");
var page_tracking = document.getElementById("tracking");

//elements
var filter_bar = document.getElementById("filter-bar");
var filter_clear = document.getElementById("clear-filter");
var currency_select = document.getElementById("currency");
var time_format_toggle = document.getElementById("ampm");
var alert_el = document.getElementById("alert");

//buttons
var button_add_coins = document.getElementById("button-add-coins");
var button_back = document.getElementById("button-back");
var button_uncheck_all = document.getElementById("uncheck-all");
var button_settings = document.getElementById("button-settings");
var button_reset = document.getElementById("reset");
var button_close_motd = document.getElementById("close-alert");

//colors
var green = "#4cd964";
var red = "#ff3b30";

//helpers
function cl(msg) {
    //console.log(msg);
}

function add_class(el, cl) {
    el.classList.add(cl);
}

function remove_class(el, cl) {
    el.classList.remove(cl);
}

function has_class(el, cl) {
    return (el.classList.contains(cl) ? true : false);
}

function getKeyByValue(object, value) { //https://stackoverflow.com/a/28191966/3126477
    return Object.keys(object).find(function (key) {
        return object[key]["values"][1] === value;
    });
}

function sort_object(obj) { //https://stackoverflow.com/a/29622653/3126477
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

function get_select_index(ele, text) { //https://stackoverflow.com/q/7489982/
    for (var i=0; i<ele.length;i++) {
        if (ele[i].childNodes[0].nodeValue === text){
            return i;
        }
    }
    return undefined;
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

function update_status(str, title) {
    var status_element = document.getElementById("status");
    status_element.innerHTML = str;
    status_element.title = title;
    
}

/*
function get_current_date_time(d) {
    var t = new Date(d); //outputs Wed Apr 19 2017 00:25:35 GMT-0400 (EDT);
    var date = t.toString().split(" ", 4).join(" "); //outputs Web Apr 19 2017
    var time = t.toString().split(" ")[4]; //outpts 00:25:35
    var timezone = t.toString().split(" ")[6]; //otputs (EDT)
    
    var output = date + " " + time + " " + timezone;
    //time formats
    // 24hr - Fri Feb 09 2018 11:49:57 (EST)
    //12hr - Fri Feb 09 2018 11:49:57 AM (EST)
    
    if (ls.ampm) { //if the user has set the time format to AM/PM
        var hours = time.slice(0, -6); //outputs 00, 01, 13 etc...
        var period = "AM";
        if (hours >= 13) {
            hours = hours - 12;
            period = "PM";
        }
        if (hours == "12") {
            hours = "12";
            period = "PM";
        }
        if (hours == "00") {
            hours = "12";
        }
        hours = ("0" + hours).slice(-2); //adds a 0 in front of all hours, takes the last 2 integers
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
*/

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

function remove_data_request_delay() {
    cl("Cancelling the deffered data request");
    clearTimeout(timeout_id);
    timeout_id = null;
    remove_class(body, class_app_updating);
    update_status("Last updated: " + last_updated, last_updated);
}

//tracking page
function init_clusterize() {
    clusterize = new Clusterize({
        scrollId: "checkboxes",
        contentId: "contentArea",
        rows_in_block: 20,
        show_no_data_row: false,
        callbacks: {
            onUpdate: clusterize_on_update
        }
    });
}

function clusterize_on_update() {
    if (clusterize.getRowsAmount() > 1) {
        remove_class(page_tracking, class_checkbox_loading);
    }
}

function build_checkboxes() {
    for (var i = 0; i < coin_list.length; i++) {
        var name = coin_list[i]["name"];
        var sym = coin_list[i]["symbol"].toString();
        chks.push({
            active: true,
            checked: false,
            markup: "<div class='ck-parent'>" +
                        "<input type='checkbox' class='ck' id='" + sym + "' value='" + sym + "' data-name='" + name + "'>" +
                        "<label for='" + sym + "'>" +
                            name + " (" + sym + ")" +
                        "</label>" +
                    "</div>",
            values: [name, sym]
        });
        if (coins.hasOwnProperty(name)) { //if coin is present in coin object
            chks[i].checked = true;
            chks[i].markup = chks[i].markup.replace("><label", " checked><label"); //set as checked in html
        }
    }
    setTimeout(function() {
        clusterize.update(filtered_checkboxes(chks));
    }, ux_delay);
}

function filtered_checkboxes(rows) {
    var results = [];
    for (var i = 0; i < chks.length; i++) {
        if (rows[i].active) {
            results.push(chks[i].markup);
        }
    }
    return results;
}

//filter bar
function search_checkboxes() {
    var term = filter_bar.value.toUpperCase();
    var flag_checked = /(^|\W):check($|\W)|(^|\W):checke($|\W)|(^|\W):checked($|\W)/gi;
    //add top filter for top 10 (put rank in coin_list.json)
    
    if (term.startsWith(":") && flag_checked.exec(term)) {
        if (Object.keys(coins).length > 0) {
            add_class(page_tracking, class_show_checked);
        }
        for (var i = 0; i < chks.length; i++) {
            var suitable = false;
            if (chks[i].checked === true) {
                suitable = true;
            }
            chks[i].active = suitable;
        }
        clusterize.update(filtered_checkboxes(chks));
    } else {
        remove_class(page_tracking, "show-checked");
        for (var i = 0; i < chks.length; i++) {
            var suitable = false;
            for (var j = 0; j < chks[i].values.length; j++) {
                if (chks[i].values[j].toString().toUpperCase().indexOf(term) + 1) {
                    suitable = true;
                }
            }
            chks[i].active = suitable;
        }
        clusterize.update(filtered_checkboxes(chks));
    }
}

function show_filter_clear() {
    var l = filter_bar.value.length;
    if (l > 0) {
        filter_clear.style.display = "block";
    } else {
        filter_clear.removeAttribute("style");
    }
}

function clear_filter_bar(e) {
    filter_bar.value = "";
    show_filter_clear();
    search_checkboxes();
    if (has_class(body, class_tracking_page)) {
        filter_bar.focus();
    }
}

//checkboxes
function save_setting(event) {
    var name = event.target.dataset.name
    var symbol = event.target.id;
    if (Object.keys(coins).length < max_checks) {
        var i = getKeyByValue(chks, symbol); //get the index of the coin in object
        if (event.target.checked) { //when ticking a checkbox
            coins[name] = symbol; //push to coins object
            chks[i].checked = true; //mark as checked in chks object
            chks[i].markup = chks[i].markup.replace("><label", " checked><label"); //set as checked in html
            if (!ls.order) { //only sort if the user has not set a custom order
                coins = sort_object(coins); //sort the coins object alphabetically by name (not symbol)
            }
            ls.setItem("coins", JSON.stringify(coins)); //save to local storage
            ls.removeItem("coins_manually_cleared");
        } else { //when unticking a checkbox
            delete coins[name]; //delete key/value from object
            chks[i].checked = false; //mark as checked in chks object
            chks[i].markup = chks[i].markup.replace(" checked><label", "><label"); //removed checked attribute in markup
            ls.setItem("coins", JSON.stringify(coins)); //overwrite local storage
            if (Object.keys(coins).length < 1) { //if it was the last coin (meaning user is no longer tracking any coins)
                ls.removeItem("coins"); //remove the local storage item
                ls.removeItem("order");
                ls.setItem("coins_manually_cleared", true);
            }
        }
    } else {
        cl("Too many coins are being tracked, remove some, then try again");
        event.preventDefault();
        return false;
    }
}

function uncheck_all() {
    for (var key in coins) {
        var sym = coins[key];
        var i = getKeyByValue(chks, sym);
        chks[i].checked = false;
        chks[i].markup = chks[i].markup.replace(" checked><label", "><label");
        document.getElementById(sym).checked = false;
    }
    coins = {};
    ls.removeItem("coins");
    ls.setItem("coins_manually_cleared", true);
    clear_filter_bar();
}

//ticker
function build_elements() {
    update_status("Building elements...", "");
    add_class(body, class_app_loading);
    for (var key in coins) {
        var clone = document.getElementById("placeholder").cloneNode(true);
        var name = clone.querySelector(".ti-name");
        var symbol = clone.querySelector(".ti-symbol");
        var price = clone.querySelector(".ti-price");
        var change = clone.querySelector(".ti-change");
        clone.removeAttribute("id");
        clone.classList.add(ti_prefix + coins[key].toLowerCase());
        clone.classList.add("actual");
        name.innerHTML = key;
        symbol.innerHTML = coins[key];
        document.getElementById("ticker").insertBefore(clone, document.getElementById("welcome"));
    }
    update();
}

function update() {
    if (document.querySelectorAll(".actual").length > 0) { //if there are elements that have data to update
        var last = Date.now() - last_updated; //log the difference between the current time and last update time set in the getData() function
        timeout_delay = api_throttle - last; //how long to delay the update, to respect API limits
        if (!has_class(body, class_app_loading)) { //this checks if user clicked the update button vs startup or rebuilding els
            add_class(body, class_app_updating);
        }
        if (timeout_delay > 0) { //if the time between api calls is within the threshold set in the api_throttle variable
            return;
            cl("Will get updated data in " + timeout_delay + "ms");
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
            setTimeout(function() {
                get_coin_data();
            }, ux_delay);
        }
    }
}

function get_coin_data() {
    check_motd();
    update_status("Getting data...", "");
    var endpoint = "https://api.coinmarketcap.com/v1/ticker/?convert=" + currency + "&limit=0";
    //endpoint = "/inc/cmc.json";
    var xhr = new XMLHttpRequest();
    xhr.timeout = 20000;
    xhr.open('GET', endpoint);
    xhr.onloadstart = function() {
        last_updated = Date.now();
        ls.setItem("last_updated", last_updated);
    }
    xhr.onloadend = function() {
        if (xhr.status === 200) { //if there were no errors
            var data = JSON.parse(xhr.responseText);
            for (var key in data) {
                var name = data[key]["name"];
                var sym = data[key]["symbol"];
                var price = data[key]["price_" + currency.toLowerCase()];
                var change = data[key]["percent_change_24h"];
                var last = parseInt(data[key]["last_updated"]);
            
                if (Object.values(coins).indexOf(sym) > -1) {
                    var el = document.querySelector("." + ti_prefix + sym.toLowerCase());
                    var price_el = el.querySelector(".amount");
                    var change_el = el.querySelector(".ti-change");
                    price_el.innerHTML = price;
                    change_el.innerHTML = change + "%";
                }
            }
            remove_class(body, class_app_loading);
            remove_class(body, class_app_updating);
            update_status("Last updated: " + last_updated);
        } else {
            
        }
    }
    xhr.send(null);
}

function get_coin_data_old() {
    check_motd();
    update_status("Getting data...", "");
    var endpoint = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + Object.values(coins).toString() + "&tsyms=" + currency;
    var xhr = new XMLHttpRequest();
    xhr.timeout = 20000; //after 20 seconds stop trying to get data
    xhr.open('GET', endpoint);
    xhr.onloadstart = function() {
        last_updated = Date.now();
        ls.setItem("last_updated", last_updated);
    }
    xhr.onloadend = function() {
        if (xhr.status === 200) { //if there were no errors
            var data = JSON.parse(xhr.responseText);
            for (var key in data["DISPLAY"]) {
                var el = document.querySelector("." + ti_prefix + key.toLowerCase()); //the element where we should put the data
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
            
            remove_class(body, class_app_loading);
            remove_class(body, class_app_updating);
            update_status("Last updated: " + last_updated, last_updated);
        } else {
            console.log(xhr);
            console.log("Error getting data from " + endpoint);
            update_status("Error, check console...", "");
        }
        
    }
    xhr.send(null);
}

//motd
function check_motd() {
    if (!ls.motd_cleared && ls.motd) { //if the user has not manually closed the motd & motd exist in local storage
        add_class(body, class_show_alert);
        alert_el.getElementsByTagName("span")[0].innerHTML = ls.motd;
    }
    
    if (!ls.last_motd_check || ((Date.now()/1000) - (parseInt(ls.last_motd_check)/1000) > time_between_checks)) { //no motd ever checked or time between checks hit
        ls.setItem("last_motd_check", Date.now());
        ls.removeItem("motd_cleared")
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
            if (data["enabled"] != "false") {
                var message = data["message"][Math.floor(Math.random() * data["message"].length)];
                ls.setItem("motd", message);
                alert_el.getElementsByTagName("span")[0].innerHTML = message;
                add_class(body, class_show_alert);
            }
        } else {
            alert_el.getElementsByTagName("span")[0].innerHTML = "Error, check console";
             console.log("Error getting data from " + xhr.responseURL + " - " + xhr.responseText);
        }
    }
    xhr.send(null);
}

//settings
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
    ls.clear(); //clear all local storage
    ls.setItem("currency", "USD"); //set the default currency in local storage
    ls.setItem("coins", JSON.stringify(default_coins)); //set local storage to default coins
    currency = "USD"; //set the global variable to the default currency
    currency_select.selectedIndex = get_select_index(currency_select, "USD"); //select the default value for the currency select element
    document.getElementById("ampm").checked = false; //set the time format to the default setting (24 hour time)
    coins = JSON.parse(ls.coins); //set the global coins variable to the default coins
    document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
        return e.parentNode.removeChild(e);
    });
    remove_class(body, class_settings_page);
    build_elements();
}

//drag & drop
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
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData('Text', this.id);
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
    
    //if dragging on top of el being dragged, remove the dragover class from other elements
    if (dragging === dragon) {
        if (document.querySelectorAll(".dragover").length > 0) {
            document.querySelector(".dragover").classList.remove("dragover");
        }
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

//navigation
function show_tracking_page() {
    last_coins = Object.keys(coins);
    add_class(body, class_tracking_page);
    add_class(page_tracking, class_checkbox_loading);
    update_status("Select your coins", "");
    build_checkboxes();
    filter_bar.focus();
}

function hide_tracking_page() {
    remove_class(body, class_tracking_page);
    clear_filter_bar();
    clusterize.clear();
    chks = [];
    if (!arrays_are_equal(last_coins, Object.keys(coins))) { //user changed the coins to be tracking whilst in tracking page
        document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
            return e.parentNode.removeChild(e);
        });
        if (Object.keys(coins).length > 0) { //there are still coins to be tracked
            build_elements(); //rebuild all the coin elements and fetch new data
        } else { //there are no longer coins to be tracked
            update_status("Ready...", ""); 
        }
    } else { //user entered tracking page, but changed nothing
        if (document.querySelectorAll(".actual").length > 0) { //if there are elements that were previously tracked
            update_status("Last updated: " + last_updated, last_updated);
        } else {
            update_status("Ready...", "");
        }
    }
}

function show_settings_page() {
    cl("Showing settings page");
    add_class(body, class_settings_page);
    last_curr = ls.currency;
    update_status("Settings", "");
}

function hide_settings_page() {
    remove_class(body, class_settings_page);
    if (last_curr != ls.currency && Object.keys(coins).length > 0) {
        document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
            return e.parentNode.removeChild(e);
        });
        build_elements();
    } else {
        update_status("Last updated: " + last_updated, last_updated);
    }
}

function navigate_back() {
    if (has_class(body, class_tracking_page)) { //on tracking page
        hide_tracking_page();
    } else if (has_class(body, class_settings_page)) {
        hide_settings_page();
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

//onload
function load_settings() {
    if (ls.coins) {
        coins = JSON.parse(ls.coins);
    } else if (!ls.coins && !ls.coins_manually_cleared) {
        ls.setItem("coins", JSON.stringify(default_coins));
        coins = default_coins;
    }
    if (!ls.currency) { //checks if the local storage setting for currency does NOT exist
        ls.setItem("currency", "USD"); //set the default currency
    } else { //if the local storage setting for currency does exist...
        currency = ls.currency; //set the global variable for currency to whatever is in local storage
        currency_select.selectedIndex = -1; //reset the selected option for currency select
        document.getElementById("c_usd").removeAttribute("selected"); //remove selected attr from option within select element
        currency_select.selectedIndex = get_select_index(currency_select, ls.currency); //set the locally stored currency as the selection
        document.getElementById("c_" + ls.currency.toLowerCase()).setAttribute("selected", "selected"); //set the selected attribute
    }
    if (ls.ampm) { //user has turned on AM/PM time format previously
        cl("Local storage exists for time format, loading it");
        time_format_toggle.checked = true;
    }
    if (ls.last_updated) { //checks if local storage for last updated exists
        last_updated = ls.last_updated;
    }
}

document.getElementById("ticker").addEventListener("mousedown", function(event) {
    if (event.target.className === "ti-icon") {
        mousedown(event);
    }
});

document.getElementById("ticker").addEventListener("mouseup", function(event) {
    if (event.target.className === "ti-icon") {
        mouseup(event);
    }
});

document.getElementById("ticker").addEventListener("dragstart", function(event) {
    if (event.target.classList.contains("actual")) {
        dragstart(event);
    }    
});

document.getElementById("ticker").addEventListener("dragend", function(event) {
    if (event.target.classList.contains("actual")) {
        dragend(event);
    }    
});

document.getElementById("ticker").addEventListener("dragenter", function(event) {
    if (event.target.classList.contains("actual")) {
        dragenter(event);
    }    
});

document.getElementById("ticker").addEventListener("dragover", function(event) {
    if (event.target.classList.contains("actual")) {
        dragover(event);
    }    
});

document.getElementById("ticker").addEventListener("drop", function(event) {
    if (event.target.classList.contains("actual")) {
        drop(event);
    }    
});
button_add_coins.addEventListener("click", show_tracking_page);
button_back.addEventListener("click", navigate_back);
filter_bar.addEventListener("input", function() {
    search_checkboxes();
    show_filter_clear();
});
filter_clear.addEventListener("click", clear_filter_bar);
filter_clear.addEventListener("keydown", clear_filter_bar);
page_tracking.addEventListener("click", function(e) {
    if (e.target.className === "ck") {
        save_setting(e);
    }
});
button_uncheck_all.addEventListener("click", uncheck_all);
button_settings.addEventListener("click", show_settings_page);
currency_select.addEventListener("change", set_currency);
time_format_toggle.addEventListener("click", change_time_format);
button_reset.addEventListener("click", reset);
button_close_motd.addEventListener("click", function() {
    ls.setItem("motd_cleared", "true");
    remove_class(body, class_show_alert);
});
document.addEventListener("click", function(e) { //open links
    if (event.target.tagName === "A") {
        open_link(e);
    }
});

/*
//extension close
window.addEventListener("blur",function() {
    cl("Window or extension lost focus");
    update_status("blur", "");
    update_status("Last updated: " + last_updated, last_updated);
    if (timeout_id != null) {
        remove_data_request_delay();
    }
    if (has_class(body, class_tracking_page)) {
        if (!arrays_are_equal(last_coins, Object.keys(coins))) {
            document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
                return e.parentNode.removeChild(e);
            });
        }
        remove_class(body, class_tracking_page);
        clear_filter_bar();
        clusterize.clear();
        chks = [];
    }
    if (has_class(body, class_settings_page)) {
        if (last_curr != ls.currency) {
            document.querySelectorAll(".actual").forEach(function(e) { //remove all coin elements
                return e.parentNode.removeChild(e);
            });
        }
        remove_class(body, class_settings_page);
    }
});

window.addEventListener("load",function() {
    load_settings();
    init_clusterize();
});
*/