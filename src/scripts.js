// /* jshint quotmark: double *///https://devhints.io/jshint
var btcPrice;
var settingsVisible = false;
var gdaxCoins = [];
var poloniexCoins = [];
var ls = localStorage;
var refreshButton = document.getElementById("refresh");
var openSettings = document.getElementById("openSettings");
var closeSettings = document.getElementById("closeSettings");
var clearChecks = document.getElementById("clearAllCheckboxes");
var welcomeMessage = document.getElementById("welcome");
var gdaxData;
var poloniexData;

var tickers = {
    gdax: "https://api.gdax.com/products/stats",
    poloniex: "https://poloniex.com/public?command=returnTicker"
};

var coinMap = {
    ARDR: "Ardor",
    BCH: "Bitcoin Cash",
    BCN: "Bytecoin",
    BTC: "Bitcoin",
    BTCD: "Bitcoin Dark",
    BTS: "BitShares",
    CLAM: "CLAMs",
    DASH: "Dash",
    DCR: "Decred",
    DGB: "DigiByte",
    DOGE: "Dogecoin",
    EMC2: "Einsteinium",
    ETC: "Ethereum Classic",
    ETH: "Ethereum",
    FCT: "Factom",
    GAME: "Gamecredits",
    GAS: "Gas",
    GNT: "Golem",
    LSK: "Lisk",
    LTC: "Litecoin",
    MAID: "MaidSafeCoin",
    NAV: "Nav Coin",
    NEOS: "Neoscoin",
    OMG: "OmiseGO",
    POT: "Potcoin",
    REP: "Augur",
    SC: "Siacoin",
    STEEM: "STEEM",
    STR: "Stellar",
    STRAT: "Stratis",
    SYS: "Syscoin",
    VTC: "Vertcoin",
    XEM: "Nem",
    XMR: "Monero",
    XRP: "Ripple",
    ZEC: "Zcash",
    ZRX: "0x"
};

//create function for logging message so it's easy to disable verbose logging
function cl(message) {
    //console.log(message);
}

function updateStatus(str) {
    document.getElementById("status").innerHTML = str;
}

function getGdax() {
    //https://stackoverflow.com/q/39542092/
    var xhr = new XMLHttpRequest();
    xhr.timeout = 20000; //after 20 seconds stop trying to get data
    updateStatus("Loading GDAX data...");
    document.body.classList.add("loading");
    
    xhr.onload = function() { //onload happens before onloadend, we use this event to log the btc price so it's available below
        var data = JSON.parse(xhr.responseText);
        for (var key in data) {
            if (key == "BTC-USD") {
                btcPrice = Number(data[key].stats_24hour.last); //always get BTC price, even if user isn't tracking gdax coins
            }
        }
    };
    
    xhr.onloadend = function() {
        if (xhr.status === 200) { //if there were no errors
            cl(btcPrice); //we need the btcPrice variable to be set before we execute the functionality below
            if (gdaxCoins.length > 0) { //check if user is tracking gdax coins
                gdaxData = JSON.parse(xhr.responseText);
                
                for (var i = 0; i < gdaxCoins.length; i++) {
                    if (Object.keys(gdaxData).indexOf(gdaxCoins[i]) > -1) {
                        if (document.querySelectorAll("." + gdaxCoins[i] + ".gdax").length < 1) {
                            buildElement(gdaxCoins[i], "gdax");
                            fillData(gdaxCoins[i], "gdax", gdaxData);
                        } else {
                            fillData(gdaxCoins[i], "gdax", gdaxData);
                        }
                    }
                }
            }
            
            if (poloniexCoins.length > 0) { //check if user is tracking poloniex coins
                //if so, start getting the data
                getPoloniex();
            } else {
                //if not, remove loader and everything
                document.body.classList.remove("loading");
                updateStatus("Last updated: " + getCurrentDateTime());
            }
            
        } else if (xhr.timeout > 0 && xhr.status === 0) { //if a timeout occurs
            console.log("Timeout error getting data from " + tickers.gdax);
            updateStatus("Error, check console...");
        } else {
            console.log("Error getting data from " + xhr.responseURL + " - " + xhr.responseText);
            updateStatus("Error, check console...");
        }
    };
    
    xhr.open('GET', tickers.gdax);
    xhr.send(null);
}

function getPoloniex() {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 20000;
    updateStatus("Loading Poloniex data...");
    
    xhr.onloadend = function() {
        if (xhr.status === 200) {
            poloniexData = JSON.parse(xhr.responseText);
            
            for (var i = 0; i < poloniexCoins.length; i++) {
                if (Object.keys(poloniexData).indexOf(poloniexCoins[i]) > -1) {
                    if (document.querySelectorAll("." + poloniexCoins[i] + ".poloniex").length < 1) {
                        buildElement(poloniexCoins[i], "poloniex");
                        fillData(poloniexCoins[i], "poloniex", poloniexData);
                    } else {
                        fillData(poloniexCoins[i], "poloniex", poloniexData);
                    }
                }
            }

            document.body.classList.remove("loading");
            updateStatus("Last updated: " + getCurrentDateTime());
        } else if (xhr.timeout > 0 && xhr.status === 0) {
            console.log("Timeout error getting data from " + tickers.poloniex);
            updateStatus("Error, check console...");
        } else {
            console.log("Error getting data from " + xhr.responseURL + " - " + xhr.responseText);
            updateStatus("Error, check console...");
        }
    };
    
    xhr.open('GET', tickers.poloniex);
    xhr.send(null);
}

function buildElement(pair, exchange) {
    var clone = document.getElementById("placeholder").cloneNode(true);
    var pairSplit;
    var title = clone.querySelector(".title");
    
    //determine exchange, we will be splitting the values differently between each exchange
    if (exchange === "gdax") {
        pairSplit = pair.split("-");
        title.innerHTML = coinMap[pairSplit[0]] + " <span>GDAX (" + pairSplit[0] + "/" + pairSplit[1] + ")</span>";
    } else if (exchange === "poloniex") {
        pairSplit = pair.split("_");
        title.innerHTML = coinMap[pairSplit[1]] + " <span>Poloniex (" + pairSplit[1] + "/" + pairSplit[0] + ")</span>";
    }
    
    clone.removeAttribute("id");
    clone.removeAttribute("style");
    clone.classList.add(pair);
    clone.classList.add(exchange);
    clone.classList.add("actual");
    document.getElementById("ticker").appendChild(clone);
}

function fillData(pair, exchange, data) {
    var el = document.querySelector("." + pair + "." + exchange);
    var last = el.querySelector(".last");
    var low = el.querySelector(".low");
    var high = el.querySelector(".high");
    var change = el.querySelector(".change");
    
    if (exchange === "gdax") { //if the purchasing currency is BTC, convert it to USD
        var pairSplit = pair.split("-");
        if (pairSplit[1] === "USD") {
            last.innerHTML = "$" + makeNum(data[pair].stats_24hour.last);
            low.innerHTML = "$" + makeNum(data[pair].stats_24hour.low);
            high.innerHTML = "$" + makeNum(data[pair].stats_24hour.high);
        } else if (pairSplit[1] === "BTC") {
            last.innerHTML = "$" + makeNum(data[pair].stats_24hour.last * btcPrice);
            low.innerHTML = "$" + makeNum(data[pair].stats_24hour.low * btcPrice);
            high.innerHTML = "$" + makeNum(data[pair].stats_24hour.high * btcPrice);
        }
        change.innerHTML =  percChange(data[pair].stats_24hour.open, data[pair].stats_24hour.last) + "%";
        
        if (parseFloat(percChange(data[pair].stats_24hour.open, data[pair].stats_24hour.last)) < 0) {
            change.style.color = "red"; //if % change is negative make text red
        } else {
            change.style.color = "green"; //if % change is positive make text green
        }
    } else if (exchange === "poloniex") {
        last.innerHTML = "$" + makeNum(data[pair].last * btcPrice);
        low.innerHTML = "$" + makeNum(data[pair].low24hr * btcPrice);
        high.innerHTML = "$" + makeNum(data[pair].high24hr * btcPrice);
        change.innerHTML = parseFloat(data[pair].percentChange*100).toFixed(2) + "%";
        
        if (parseFloat(parseFloat(data[pair].percentChange*100).toFixed(2)) < 0) {
            change.style.color = "red";
        } else {
            change.style.color = "green";
        }
    }
}

function makeNum(str) {
    var makeNumA;
    if (str > 1) {
        makeNumA = parseFloat(str);
        return makeNumA.toFixed(2);
    } else if (str > 0.1) {
        makeNumA = parseFloat(str);
        return makeNumA.toFixed(3);
    } else if (str > 0.01) {
        makeNumA = parseFloat(str);
        return makeNumA.toFixed(4);
    } else {
        makeNumA = parseFloat(str);
        return makeNumA.toFixed(5);
    }
}

function percChange(open, last) {
    var decrease = open - last;
    var div = decrease / open;
    var change = div * 100;
    var value = parseFloat(change * -1).toFixed(2);
    return value;
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

function refresh() {
    if (localStorage.length > 0) {
        getGdax();
        disableButtons();
    }
}

function start() {
    updateStatus("Starting...");
    if (ls.length > 0) { //if the user is already tracking some coins
        welcomeMessage.style.display = "none";
        getGdax();
    } else {
        updateStatus("Ready...");
    }
}

function disableButtons() {
    refreshButton.disabled = true;
    openSettings.classList.add("disabled");
    document.body.classList.add("timer-on");
    setTimeout(function(){
        refreshButton.disabled = false;
        openSettings.classList.remove("disabled");
        document.body.classList.remove("timer-on");
    }, 3000);
}

function saveSetting(el) {
    var exchange = el.dataset.exchange;
    var pair = el.value;
    var index;

    if (el.checked) { //when user checks a currency pair
        switch (String(exchange)) {
            case "gdax":
                gdaxCoins.push(pair); //update the gdaxCoins array
                gdaxCoins.sort(); //sort the array in alphabetical order
                ls.setItem(exchange, gdaxCoins); //update the localStorage for exchange
                break;
            case "poloniex":
                poloniexCoins.push(pair);
                poloniexCoins.sort();
                ls.setItem(exchange, poloniexCoins);
                break;
        }
    } else { //when user UNchecks a currency pair
        switch (String(exchange)) {
            case "gdax":
                index = gdaxCoins.indexOf(pair); //find index in the array for currency pair
                gdaxCoins.splice(index, 1); //remove it from array
                ls.setItem(exchange, gdaxCoins); //update the localStorage for exchange
                
                if (gdaxCoins.length < 1) { //if there are no more items in the gdaxCoins array
                    ls.removeItem(exchange); //remove the item from localStorage
                }
                break;
            case "poloniex":
                index = poloniexCoins.indexOf(pair);
                poloniexCoins.splice(index, 1);
                ls.setItem(exchange, poloniexCoins);
                
                if (poloniexCoins.length < 1) {
                    ls.removeItem(exchange);
                }
                break;
        }
    }
}

function loadSettings() {
    if (ls.length > 0) { //check if there is localStorage for this page/extension
        cl("local storage exists, we should load it");
        var newArray;
        
        if (Object.keys(ls).indexOf("gdax") > -1) { //if a localStorage key named gdax exists
            newArray = ls.gdax.split(","); ///split the localStorage string at the comma
            gdaxCoins = newArray; //set the new array for gdaxCoins
            
            for (var i=0; i<newArray.length; i++) { //re-check all checkboxes in localStorage
                document.getElementById(newArray[i]).setAttribute("checked", true);
            }
        }
        
        if (Object.keys(ls).indexOf("poloniex") > -1) {
            newArray = ls.poloniex.split(",");
            poloniexCoins = newArray;
            
            for (var a=0; a<newArray.length; a++) {
                document.getElementById(newArray[a]).setAttribute("checked", true);
            }
            
        }
    }
}

function showSettingsPage() {
    cl("opening settings page");
    settingsVisible = true;
    document.body.classList.add("show-settings");
}

function closeSettingsPage() {
    cl("closing settings page");
    document.body.classList.remove("show-settings");
    document.querySelectorAll(".actual").forEach(function (e) {
        return e.parentNode.removeChild(e);
    });
    settingsVisible = false;
    
    if (ls.length > 0) { //if the user now tracking coins
        getGdax();
        welcomeMessage.style.display = "none";
    } else {
        welcomeMessage.removeAttribute("style");
    }
    
}

function clearAllChecked() {
    var checkboxes = document.getElementsByClassName("ck");
    for(var i = 0; i < checkboxes.length; i++){
        var checkbox = checkboxes[i];
        if(checkbox.checked === true) {
            checkbox.checked = false;
        }
        ls.clear();
        gdaxCoins = [];
        poloniexCoins = [];
    }
}

clearChecks.addEventListener("click", clearAllChecked);
refreshButton.addEventListener("click", refresh);
openSettings.addEventListener("click", showSettingsPage);
closeSettings.addEventListener("click", closeSettingsPage);

loadSettings();