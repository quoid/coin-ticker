var bg = chrome.extension.getBackgroundPage();

function open_link(event) {
    console.log(event);
    chrome.tabs.create({ url: event.target.dataset.link });
}

window.onload = function() {
    //start session
    bg.ga_start_session();
    start();
}

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