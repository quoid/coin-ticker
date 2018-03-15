var bg = chrome.extension.getBackgroundPage();

function open_link(event) {
    var url = event.target.dataset.link;
    var creating = browser.tabs.create({
        url: url
    });
    creating.then(function() {
            browser.extension.getViews()[1].close()
        }, 
        function() {
            console.log('Error opening link...');
        }
    );
}

window.addEventListener("load",function() {
    bg.ga_start_session();
});

window.addEventListener("blur",function() {
    bg.ga_end_session();
});

document.getElementById("close-alert").addEventListener("click", function() {
    bg.ga_close_motd();
});

document.getElementById("button-settings").addEventListener("click", function() {
    bg.ga_open_settings_page();
});

document.getElementById("button-add-coins").addEventListener("click", function() {
    bg.ga_open_tracking_page();
});

document.getElementById("button-back").addEventListener("click", function() {
    if (document.body.classList.contains("show-tracking")) {
        bg.ga_close_tracking_page();
    } else if (document.body.classList.contains("show-settings")) {
        bg.ga_close_settings_page();
    }
});

document.getElementById("currency").addEventListener("change", function(e) {
    bg.ga_change_currency();
});

document.getElementById("reset").addEventListener("click", function() {
    bg.ga_reset_all_settings();
});