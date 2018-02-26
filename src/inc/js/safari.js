//open links
function open_link(event) {
    var a = safari.application.openBrowserWindow();
    var b = a.activeTab;
    b.url = event.target.dataset.link;
}

window.onblur = function() {
    safari.extension.globalPage.contentWindow.ga_end_session();
}

document.getElementById("close-alert").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_close_motd();
});

document.getElementById("button-refresh").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_refresh();
});

document.getElementById("button-settings").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_open_settings_page();
});

document.getElementById("button-tracking").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_open_tracking_page();
});

document.getElementById("button-back").addEventListener("click", function() {
    if (document.body.classList.contains("show-tracking")) {
        safari.extension.globalPage.contentWindow.ga_close_tracking_page();
    } else if (document.body.classList.contains("show-settings")) {
        safari.extension.globalPage.contentWindow.ga_close_settings_page();
    }
});

document.getElementById("currency").addEventListener("change", function(e) {
    safari.extension.globalPage.contentWindow.ga_change_currency();
});

document.getElementById("ampm").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_change_time_format();
});

document.getElementById("button-reset").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_reset_all_settings();
});