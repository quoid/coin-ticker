var bg=chrome.extension.getBackgroundPage();function open_link(e){console.log(e),chrome.tabs.create({url:e.target.dataset.link})}window.addEventListener("load",function(){bg.ga_start_session()}),window.addEventListener("blur",function(){bg.ga_end_session()}),document.getElementById("close-alert").addEventListener("click",function(){bg.ga_close_motd()}),document.getElementById("button-refresh").addEventListener("click",function(){bg.ga_refresh()}),document.getElementById("button-settings").addEventListener("click",function(){bg.ga_open_settings_page()}),document.getElementById("button-add-coins").addEventListener("click",function(){bg.ga_open_tracking_page()}),document.getElementById("button-back").addEventListener("click",function(){document.body.classList.contains("show-tracking")?bg.ga_close_tracking_page():document.body.classList.contains("show-settings")&&bg.ga_close_settings_page()}),document.getElementById("currency").addEventListener("change",function(e){bg.ga_change_currency()}),document.getElementById("ampm").addEventListener("click",function(){bg.ga_change_time_format()}),document.getElementById("reset").addEventListener("click",function(){bg.ga_reset_all_settings()});