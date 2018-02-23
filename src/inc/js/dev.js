function open_link(event) {
    var url = event.target.dataset.link;
    var win = window.open(url, "_blank");
    win.focus();
}

//ga
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics_debug.js','ga');

window.ga_debug = {trace: false};
ga("create", "UA-110620814-1", "auto", {
    "storage": "none",
    'clientId': window.localStorage.getItem('ga_clientId')
});

ga(function(tracker) {
    window.localStorage.setItem('ga_clientId', tracker.get('clientId'));
});

function ga_start_session() {
    ga("send", "pageview", "/ticker.html", {"sessionControl": "start"});
    ga("send", "event", "tickerV2", "open-extension");
    ga("set", "dimension1", localStorage.currency);
    //ga("send", "pageview", "/ticker.html");
}

function ga_end_session() {
    ga("send", "event", "tickerV2", "close-extension");
}

function ga_close_motd() {
    ga("send", "event", "tickerV2", "close-motd");
}

function ga_refresh() {
    ga("send", "event", "tickerV2", "refresh-ticker");
    ga("set", "dimension1", localStorage.currency);
}

function ga_open_settings_page() {
    ga("send", "pageview", "/settings.html");
    ga("send", "event", "tickerV2", "open-settings");
}

function ga_close_settings_page() {
    ga("send", "pageview", "/ticker.html");
    ga("send", "event", "tickerV2", "close-settings");
}

function ga_open_tracking_page() {
    ga("send", "pageview", "/tracking.html");
    ga("send", "event", "tickerV2", "open-tracking");
}

function ga_close_tracking_page() {
    ga("send", "pageview", "/settings.html");
    ga("send", "event", "tickerV2", "close-tracking");
}

function ga_change_currency() {
    ga("send", "event", "tickerV2", "change-currency");
}

function ga_change_time_format() {
    ga("send", "event", "tickerV2", "change-time-format");
}

function ga_reset_all_settings() {
    ga("send", "event", "tickerV2", "reset-settings");
}

//never copy this line
document.getElementById("start").addEventListener("click", function() {
    ga_start_session();
});

window.onblur = function() {
    ga_end_session();
}

document.getElementById("close-alert").addEventListener("click", function() {
    ga_close_motd();
});

document.getElementById("button-refresh").addEventListener("click", function() {
    ga_refresh();
});

document.getElementById("button-settings").addEventListener("click", function() {
    ga_open_settings_page();
});

document.getElementById("button-tracking").addEventListener("click", function() {
    ga_open_tracking_page();
});

document.getElementById("button-back").addEventListener("click", function() {
    if (document.body.classList.contains("show-tracking")) {
        ga_close_tracking_page();
    } else if (document.body.classList.contains("show-settings")) {
        ga_close_settings_page();
    }
});

document.getElementById("currency").addEventListener("change", function(e) {
    ga_change_currency();
});

document.getElementById("ampm").addEventListener("click", function() {
    ga_change_time_format();
});

document.getElementById("button-reset").addEventListener("click", function() {
    ga_reset_all_settings();
});