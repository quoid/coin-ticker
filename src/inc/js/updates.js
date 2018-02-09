//check for updates
function check_new_version() { //this will check if there's a new version of the extension available to users
    
    var time_between_checks = 60;
    
    if (ls.canUpdate === "true") {
        document.getElementById("alert").style.display = "block";
    }
    
    if (!ls.checkVersion) { //if version checking in on
        if (!ls.lastVersionCheck || (Date.now()/1000) - (parseInt(ls.lastVersionCheck)/1000) > time_between_checks) { //no version ever checked or time between checks hit
            ls.setItem("lastVersionCheck", Date.now());
            ls.removeItem("canUpdate");
            get_version_from_repository();
        }
    }
}

function get_version_from_repository() {
    var a = "https://raw.githubusercontent.com/quoid/coin-ticker/v2.0/etc/version.json";
    var xhr = new XMLHttpRequest();
    xhr.open('GET', a);
    xhr.onloadend = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if (data.enabled === "false") {
                ls.setItem("checkVersion", "false");
            } else {
                if (data.version != ls.version) {
                    document.getElementById("alert").style.display = "block";
                    ls.setItem("canUpdate", "true");
                }
            }
        }
    }
    xhr.send(null);
}

//on clear message, remove canUpdate

function set_version() {
    localStorage.setItem("version", safari.extension.displayVersion);
}

check_new_version();