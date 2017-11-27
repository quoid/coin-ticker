//Watching for var changes
//https://stackoverflow.com/a/37403125/3126477
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Defining_getters_and_setters
var coins = {gdax: [], gemini: [], poloniex: []};
const ls = localStorage;
const welcome = document.getElementById("welcome");
const openSettings = document.getElementById("openSettings");
const exitSettings = document.getElementById("exitSettings");
const clearChecks = document.getElementById("clearChecks");
const pauseButton = document.getElementById("pause");
var gdaxSocket;
var gdaxSubscribe = {"type":"subscribe","channels":[{"name":"ticker_1000","product_ids":["BTC-USD", "LTC-USD", "ETH-USD"]}]};
const coinMap = {
    AMP: "Synereo AMP",
    ARDR: "Ardor",
    BCH: "Bitcoin Cash",
    BCN: "Bytecoin",
    BCY: "BitCrystals",
    BELA: "Bela",
    BLK: "BlackCoin",
    BTC: "Bitcoin",
    BTCD: "Bitcoin Dark",
    BTM: "Bitmark",
    BTS: "BitShares",
    BURST: "Burst",
    CLAM: "CLAMs",
    CVC: "Civic",
    DASH: "Dash",
    DCR: "Decred",
    DGB: "DigiByte",
    DOGE: "Dogecoin",
    EMC2: "Einsteinium",
    ETC: "Ethereum Classic",
    ETH: "Ethereum",
    EXP: "Expanse",
    FCT: "Factom",
    FLDC: "FoldingCoin",
    FLO: "Florincoin",
    GAME: "Gamecredits",
    GAS: "Gas",
    GNO: "Gnosis",
    GNT: "Golem",
    GRC: "Gridcoin Research",
    HUC: "Huntercoin",
    LBC: "LBRY Credits",
    LSK: "Lisk",
    LTC: "Litecoin",
    MAID: "MaidSafeCoin",
    NAUT: "Nautiluscoin",
    NAV: "Nav Coin",
    NEOS: "Neoscoin",
    NMC: "Namecoin",
    NOTE: "DNotes",
    NXC: "Nexium",
    NXT: "NXT",
    OMG: "OmiseGO",
    OMNI: "Omni",
    PASC: "PascalCoin",
    PINK: "Pinkcoin",
    POT: "Potcoin",
    PPC: "Peercoin",
    RADS: "Radium",
    REP: "Augur",
    RIC: "Riecoin",
    SBD: "Steem Dollars",
    SC: "Siacoin",
    SJCX: "Storjcoin X",
    STEEM: "STEEM",
    STORJ: "Storj",
    STR: "Stellar",
    STRAT: "Stratis",
    SYS: "Syscoin",
    VIA: "Viacoin",
    VRC: "VeriCoin",
    VTC: "Vertcoin",
    XBC: "BitcoinPlus",
    XCP: "Counterparty",
    XEM: "Nem",
    XMR: "Monero",
    XPM: "Primecoin",
    XRP: "Ripple",
    XVC: "Vcash",
    ZEC: "Zcash",
    ZRX: "0x"
};

//create function for logging message so it's easy to disable verbose logging
function cl(message) {
    console.log(message);
}

function updateStatus(str) {
    document.getElementById("status").innerHTML = str;
}

//https://stackoverflow.com/a/28191966/3126477
function getKeyByValue(object, value) {
    return Object.keys(object).find(function (key) {
        return object[key] === value;
    });
}

function buildElements() {
    welcome.style.display = "none";
    document.body.classList.add("loading");
    var allCoins = Object.values(coins).toString().split(",").length; //not used
    for (var key in coins) { //iterate through keys
        if (coins[key].length > 0) { //check if key (exchange) has coins being tracked
            var exchange = getKeyByValue(coins, coins[key]); //get the key (exchange) by the value (coins being tracked), save it in a var
            for (var i = 0; i < coins[key].length; i++) { //we know this key has values (exchange has coins to be tracked), iterate through them and build their elements
                var clone = document.getElementById("placeholder").cloneNode(true); //clone placeholder element
                var title = clone.querySelector(".title"); //save title element in var so we can edit the innerHTML
                var coin = getCoin(exchange, coins[key][i]);
                var purchasingCurrency = getPurchasingCurrency(exchange, coins[key][i]);
                cl("Building element for " + coins[key][i] + " from the exchange, " + exchange, coin);
                //title.innerHTML = coinMap[pairSplit[1]] + " <span>Poloniex (" + pairSplit[1] + "/" + pairSplit[0] + ")</span>";
                title.innerHTML = coinMap[coin] + " <span>" + exchange.toUpperCase() + " (" + coin + "/" + purchasingCurrency.toUpperCase() + ")</span>"; //set the title element
                clone.removeAttribute("id"); //remove #placeholder
                clone.removeAttribute("style"); //remove the display: none that exists on placeholder element
                clone.classList.add("actual"); //add actual class to distinguish between placeholder element
                clone.classList.add(coins[key][i]); //add unqiue class that is the coin (in respective exchange format), later we use this to update the data
                clone.classList.add(exchange); //add class for exchange, later we use this to update the data
                clone.classList.add(coin.toLowerCase()); //add non-unique coin class to set proper icon using helper function
                document.getElementById("ticker").appendChild(clone); //add element to ticker
            }
        }
    }
    document.body.classList.remove("loading");
    startSockets();
}

function getCoin(exchange, pair) {
    if (exchange === "gdax") {
        return pair.split("-")[0];
    }
    if (exchange === "gemini") {
        return pair.substring(-3, 3).toUpperCase();
    }
    if (exchange === "poloniex") {
        return pair.split("_")[1];
    }
}

function getPurchasingCurrency(exchange, pair) {
    if (exchange === "gdax") {
        return pair.split("-")[1].toLowerCase();
    }
    if (exchange === "gemini") {
        return pair.substring(3, 6);
    }
    if (exchange === "poloniex") {
        return pair.split("_")[0].toLowerCase();
    }
}

function loadSettings() {
    if (ls.coins) { //check if localStorage from previous session was saved
        cl("Local storage exists, loading it");
        coins = JSON.parse(ls.coins); //set var coins object to localStorage contents 
        for (var key in coins) { //iterate through keys of newly updated coins object
            if (coins[key].length > 0) { //find which exchange in the coins object is tracking specific coins
                for (var i = 0; i < coins[key].length; i++) { //iterate exchanges' arrays and set them as checked on settings page
                    document.getElementById(coins[key][i]).setAttribute("checked", true); //each checkbox has a unqiue idea which is the array value in the coins object's exchange
                }
            }
        }
    }
}

//WebSocket functions
function startSockets() {
    gdaxSocket = new WebSocket("wss://ws-feed.gdax.com");
    gdaxSocket.onopen = function(event) {
        cl("Connection opened to " + event.target.URL);
        gdaxSocket.send(JSON.stringify(gdaxSubscribe));
        //socketStatus.gdaxStatus = "connected";
    }
    gdaxSocket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        cl(data["price"]);
        var el = "." + data["product_id"];
        var h = document.querySelector(el);
        var price = data["price"];
        var last = data;
        var p = h.querySelector(".last");
        p.innerHTML = data["price"];
        cl(data);
    }
    gdaxSocket.onclose = function(event) {
        console.log(event);
    }
}

function pause() {
    //need to check if socket is open!
    gdaxSocket.close();
    //socketStatus.gdaxStatus = "disconnected";
}

//Settings page functions
function saveSetting(el) {
    var exchange = el.dataset.exchange;
    var pair = el.value;

    if (el.checked) { //if checking box
        coins[exchange].push(pair); //update the array within the coins object
        coins[exchange].sort(); //sort the array within the coins object
        ls.setItem("coins", JSON.stringify(coins)); //update localStorage
    } else { //if unchecking box
        var index = coins[exchange].indexOf(pair); //get the index of the selected coin in the array
        coins[exchange].splice(index, 1); //remove it from array
        ls.setItem("coins", JSON.stringify(coins)); //update localStorage
        if (Object.values(coins).toString().replace(/,/g , "").length < 1) { //if no more coins are being tracked
            ls.clear(); //clear the localStorage
        }
    }
    
}

function clearAllCheckboxes() {
    var checkboxes = document.getElementsByClassName("ck");
    for(var i = 0; i < checkboxes.length; i++) { //iterate through all checkboxes and set them to "unchecked"
        checkboxes[i].checked = false;
    }
    ls.clear(); //clear the localStorage
    coins = {gdax: [], gemini: [], poloniex: []}; //empty coins object's arrays
}

function disableButtons() {
    pause.disabled = true;
    openSettings.classList.add("disabled");
}

function enableButtons() {
    pause.disabled = false;
    openSettings.classList.remove("disabled");
}

function showSettingsPage() {
    document.body.classList.add("show-settings");
    disableButtons();
    //remove all elements when entering settings page - there is a better way to do this (possibly compare NodeList on exit?)
    document.querySelectorAll(".actual").forEach(function (e) {
        return e.parentNode.removeChild(e);
    });
}

function exitSettingsPage() {
    document.body.classList.remove("show-settings");
    enableButtons();
    
    if (ls.coins) {
        buildElements();
    } else {
        welcome.removeAttribute("style");
    }
    
}

//start
function start() {
    updateStatus("Starting...");
    if (ls.coins) { //if the user is already tracking some coins
        buildElements();
    } else {
        updateStatus("Ready...");
    }
}

//Event Listeners
openSettings.addEventListener("click", showSettingsPage);
exitSettings.addEventListener("click", exitSettingsPage);
clearChecks.addEventListener("click", clearAllCheckboxes);
pauseButton.addEventListener("click", pause);

loadSettings();