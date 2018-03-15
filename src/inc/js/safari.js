function open_link(event) {
    //safari.application.activeBrowserWindow.openTab()
    //safari.self.hide();
    var a = safari.application.openBrowserWindow();
    var b = a.activeTab;
    b.url = event.target.dataset.link;
}

window.addEventListener("blur",function() {
    safari.extension.globalPage.contentWindow.ga_end_session();
});

document.getElementById("close-alert").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_close_motd();
});

document.getElementById("button-settings").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_open_settings_page();
});

document.getElementById("button-add-coins").addEventListener("click", function() {
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

document.getElementById("reset").addEventListener("click", function() {
    safari.extension.globalPage.contentWindow.ga_reset_all_settings();
});