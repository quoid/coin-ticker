//Watching for var changes
//https://stackoverflow.com/a/37403125/3126477
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Defining_getters_and_setters

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
    console.log("Changing to " + y + " on the " + exchange + " socket");
}

function showSettings() {
    var body = document.body;
    if (document.body.classList.contains("show-settings")) {
        document.body.classList.remove("show-settings");
    } else {
        document.body.classList.add("show-settings");
    }
}

document.getElementById("openSettings").addEventListener("click", showSettings);