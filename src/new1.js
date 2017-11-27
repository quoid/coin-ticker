//Watching for var changes
//https://stackoverflow.com/a/37403125/3126477
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Defining_getters_and_setters
var btcPrice;
var gdaxCoins = [];
var geminiCoins = [];
var poloniexCoins = [];
var ls = localStorage;
var gdaxSocket;
var gdaxSubscribe = {"type":"subscribe","channels":[{"name":"ticker","product_ids":["BTC-USD"]}]};
var geminiSocket;
var poloniexSocket;
var welcomeMessage = document.getElementById("welcome");

var coinMap = {
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

var socketStatus = {
    gdax: "disconnected",
    gemini: "disconnected",
    poloniex: "disconnected",
    get getAllStatus() { 
        return "gdax: " + this.gdax + " / gemini: " + this.gemini + " / poloniex: " + this.poloniex;
    },
    set gdaxStatus(status) {
        this.gdax = status;
        changeStatusIcon(status, "gdax");
    },
    set geminiStatus(status) {
        this.gemini = status;
        changeStatusIcon(status, "gemini");
    },
    set poloniexStatus(status) {
        this.poloniex = status;
        changeStatusIcon(status, "poloniex");
    }
};

function changeStatusIcon(y, exchange) {
    cl("Changing to " + y + " on the " + exchange + " socket");
    if (y === "connecting") {
        document.getElementById(exchange + "Status").classList.add("connecting");
    } else if (y === "connected") {
        document.getElementById(exchange + "Status").classList.add("connected");
    } else if (y === "disconnected") {
        document.getElementById(exchange + "Status").removeAttribute("class");
    }
}

//create function for logging message so it's easy to disable verbose logging
function cl(message) {
    console.log(message);
}

function updateStatus(str) {
    document.getElementById("status").innerHTML = str;
}

function saveSetting(el) {
    var exchange = el.dataset.exchange;
    var pair = el.value;
    var index;

    if (el.checked) { //if checkbox is not already checked
        switch (String(exchange)) {
            case "gdax":
                gdaxCoins.push(pair); //update the gdaxCoins array
                gdaxCoins.sort(); //sort the array in alphabetical order
                ls.setItem(exchange, gdaxCoins); //update the localStorage for exchange
                break;
            case "gemini":
                geminiCoins.push(pair);
                geminiCoins.sort();
                ls.setItem(exchange, geminiCoins);
                break;
            case "poloniex":
                poloniexCoins.push(pair);
                poloniexCoins.sort();
                ls.setItem(exchange, poloniexCoins);
                break;
        }
    } else { //if checkbox is already checked
        switch (String(exchange)) {
            case "gdax":
                index = gdaxCoins.indexOf(pair); //find index in the array for currency pair
                gdaxCoins.splice(index, 1); //remove it from array
                ls.setItem(exchange, gdaxCoins); //update the localStorage for exchange
                
                if (gdaxCoins.length < 1) { //if there are no more items in the gdaxCoins array
                    ls.removeItem(exchange); //remove the item from localStorage
                }
                break;
            case "gemini":
                index = geminiCoins.indexOf(pair);
                geminiCoins.splice(index, 1);
                ls.setItem(exchange, geminiCoins);
                
                if (geminiCoins.length < 1) {
                    ls.removeItem(exchange);
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
            
            for (var i = 0; i < newArray.length; i++) { //re-check all checkboxes in localStorage
                document.getElementById(newArray[i]).setAttribute("checked", true);
            }
        }
        
        if (Object.keys(ls).indexOf("gemini") > -1) {
            newArray = ls.gemini.split(",");
            geminiCoins = newArray;
            
            for (var i = 0; i < newArray.length; i++) {
                document.getElementById(newArray[i]).setAttribute("checked", true);
            }
        }
        
        if (Object.keys(ls).indexOf("poloniex") > -1) {
            newArray = ls.poloniex.split(",");
            poloniexCoins = newArray;
            
            for (var i = 0; i < newArray.length; i++) {
                document.getElementById(newArray[i]).setAttribute("checked", true);
            }
        }
    }
}

function startSockets() {
    if (ls.length > 0) {
        gdaxSocket = new WebSocket("wss://ws-feed.gdax.com");
        gdaxSocket.onopen = function(event) {
            cl("Connection opened to " + event.target.URL);
            gdaxSocket.send(JSON.stringify(gdaxSubscribe));
            socketStatus.gdaxStatus = "connected";
        }
        
        gdaxSocket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            cl(data);
        }
        
        gdaxSocket.onerror = function(event) {
            console.log(event);
        }
        
        gdaxSocket.onclose = function(event) {
            console.log(event);
        }
    }
}

function buildElements() {
    welcomeMessage.style.display = "none";
    document.body.classList.add("loading");
    
    if (gdaxCoins.length > 0) {
        for (var i = 0; i < gdaxCoins.length; i++) {
            var clone = document.getElementById("placeholder").cloneNode(true);
            var title = clone.querySelector(".title");
            var pairSplit = gdaxCoins[i].split("-");
            title.innerHTML = coinMap[pairSplit[0]] + " <span>GDAX (" + pairSplit[0] + "/" + pairSplit[1] + ")</span>";
            clone.removeAttribute("id");
            clone.removeAttribute("style");
            clone.classList.add(gdaxCoins[i]);
            clone.classList.add("gdax");
            clone.classList.add("actual");
            clone.classList.add(pairSplit[0].toLowerCase());
            document.getElementById("ticker").appendChild(clone);
            console.log(i);
        }
    }
    
    if (geminiCoins.length > 0) {
        for (var i = 0; i < geminiCoins.length; i++) {
            var clone = document.getElementById("placeholder").cloneNode(true);
            var title = clone.querySelector(".title");
            var pairSplit = geminiCoins[i].substring(0, 3);
            console.log(geminiCoins[i].substring(-3, 3));
        }
    }
    
    if (poloniexCoins.length > 0) {
        for (var i = 0; i < poloniexCoins.length; i++) {
            var clone = document.getElementById("placeholder").cloneNode(true);
            var title = clone.querySelector(".title");
            var pairSplit = poloniexCoins[i].split("_");
            title.innerHTML = coinMap[pairSplit[1]] + " <span>Poloniex (" + pairSplit[1] + "/" + pairSplit[0] + ")</span>";
            clone.removeAttribute("id");
            clone.removeAttribute("style");
            clone.classList.add(poloniexCoins[i]);
            clone.classList.add("poloniex");
            clone.classList.add("actual");
            clone.classList.add(pairSplit[1].toLowerCase());
            document.getElementById("ticker").appendChild(clone);
            console.log(i);
        }
    }
    
    console.log("done");
    document.body.classList.remove("loading");
}

function showSettings() {
    var body = document.body;
    if (document.body.classList.contains("show-settings")) { //hide settings page
        document.body.classList.remove("show-settings");
        //startSockets(); //only if there stopped
        
        if (ls.length > 0) { //if user is now tracking coins
            buildElements();
        }
        
    } else { //show settings page
        document.body.classList.add("show-settings");
        //remove all element when entering settings, we should only do this if something changes
        document.querySelectorAll(".actual").forEach(function (e) {
            return e.parentNode.removeChild(e);
        });
    }
}

function pause() {
    //need to check if socket is open!
    gdaxSocket.close();
    socketStatus.gdaxStatus = "disconnected";
}

document.getElementById("openSettings").addEventListener("click", showSettings);
document.getElementById("pause").addEventListener("click", pause);

loadSettings();