var clusterize,chks=[],coins={},last_coins=[],last_updated=0,last_curr="",ls=localStorage,max_checks=46,ux_delay=300,default_coins={Bitcoin:"BTC",Ethereum:"ETH",Litecoin:"LTC",Vertcoin:"VTC"},currency="USD",timeout_delay=0,timeout_id=null,api_throttle=1e4,time_between_checks=86400,body=document.body,class_app_loading="loading",class_app_updating="updating",class_tracking_page="show-tracking",class_checkbox_loading="checkboxes-loading",class_show_checked="show-checked",class_settings_page="show-settings",class_show_alert="show-alert",ti_prefix="ci_",app_loader=document.getElementById("loader"),page_tracking=document.getElementById("tracking"),filter_bar=document.getElementById("filter-bar"),filter_clear=document.getElementById("clear-filter"),currency_select=document.getElementById("currency"),time_format_toggle=document.getElementById("ampm"),alert_el=document.getElementById("alert"),button_add_coins=document.getElementById("button-add-coins"),button_back=document.getElementById("button-back"),button_uncheck_all=document.getElementById("uncheck-all"),button_settings=document.getElementById("button-settings"),button_reset=document.getElementById("reset"),button_refresh=document.getElementById("button-refresh"),button_close_motd=document.getElementById("close-alert"),green="#4cd964",red="#ff3b30";function cl(e){}function add_class(e,t){e.classList.add(t)}function remove_class(e,t){e.classList.remove(t)}function has_class(e,t){return!!e.classList.contains(t)}function getKeyByValue(e,t){return Object.keys(e).find(function(a){return e[a].values[1]===t})}function sort_object(e){return Object.keys(e).sort().reduce(function(t,a){return t[a]=e[a],t},{})}function get_select_index(e,t){for(var a=0;a<e.length;a++)if(e[a].childNodes[0].nodeValue===t)return a}function arrays_are_equal(e,t){if(e.length!==t.length)return!1;for(var a=0,s=e.length;a<s;a++)if(e[a]!==t[a])return!1;return!0}function update_status(e,t){var a=document.getElementById("status");a.innerHTML=e,a.title=t}function get_current_date_time(e){var t=new Date(e),a=t.toString().split(" ",4).join(" "),s=t.toString().split(" ")[4],c=t.toString().split(" ")[6],n=a+" "+s+" "+c;if(ls.ampm){var r=s.slice(0,-6),l="AM";r>=13&&(r-=12,l="PM"),"00"==r&&(r="12"),n=a+" "+(r=("0"+r).slice(-2))+s.slice(-6)+" "+l+" "+c}return n}function format_last_updated(e){var t,a=e,s=Date.now();if((s-a)/1e3<86400){var c=get_current_date_time(a),n=c.split(" ").slice(4,5)[0].split(":").slice(0,2).join(":"),r=n.split(":").slice(0,1)[0];if(parseInt(r)>0&&parseInt(r)<10&&(n=n.substring(1)),t=new Date(s).getDate()===new Date(a).getDate()?"Today at "+n:"Yesterday at "+n,ls.ampm)t+=" "+c.split(" ").slice(5,6)}else t="More than a 24 hours ago";return t}function price_increase(e){document.querySelectorAll(".ti-price")[e].classList.add("up"),setTimeout(function(){document.querySelectorAll(".ti-price")[e].classList.remove("up")},350)}function price_decrease(e){document.querySelectorAll(".ti-price")[e].classList.add("down"),setTimeout(function(){document.querySelectorAll(".ti-price")[e].classList.remove("down")},350)}function remove_data_request_delay(){cl("Cancelling the deffered data request"),clearTimeout(timeout_id),timeout_id=null,remove_class(body,class_app_updating),update_status("Last updated: "+format_last_updated(last_updated),get_current_date_time(last_updated))}function init_clusterize(){clusterize=new Clusterize({scrollId:"checkboxes",contentId:"contentArea",rows_in_block:20,show_no_data_row:!1,callbacks:{onUpdate:clusterize_on_update}})}function clusterize_on_update(){clusterize.getRowsAmount()>1&&remove_class(page_tracking,class_checkbox_loading)}function build_checkboxes(){for(var e=0;e<coin_list.length;e++){var t=coin_list[e].name,a=coin_list[e].symbol.toString();chks.push({active:!0,checked:!1,markup:"<div class='ck-parent'><input type='checkbox' class='ck' id='"+a+"' value='"+a+"' data-name='"+t+"'><label for='"+a+"'>"+t+" ("+a+")</label></div>",values:[t,a]}),coins.hasOwnProperty(t)&&(chks[e].checked=!0,chks[e].markup=chks[e].markup.replace("><label"," checked><label"))}setTimeout(function(){clusterize.update(filtered_checkboxes(chks))},ux_delay)}function filtered_checkboxes(e){for(var t=[],a=0;a<chks.length;a++)e[a].active&&t.push(chks[a].markup);return t}function search_checkboxes(){var e=filter_bar.value.toUpperCase();if(e.startsWith(":")&&/(^|\W):check($|\W)|(^|\W):checke($|\W)|(^|\W):checked($|\W)/gi.exec(e)){Object.keys(coins).length>0&&add_class(page_tracking,class_show_checked);for(var t=0;t<chks.length;t++){var a=!1;!0===chks[t].checked&&(a=!0),chks[t].active=a}clusterize.update(filtered_checkboxes(chks))}else{remove_class(page_tracking,"show-checked");for(t=0;t<chks.length;t++){a=!1;for(var s=0;s<chks[t].values.length;s++)chks[t].values[s].toString().toUpperCase().indexOf(e)+1&&(a=!0);chks[t].active=a}clusterize.update(filtered_checkboxes(chks))}}function show_filter_clear(){filter_bar.value.length>0?filter_clear.style.display="block":filter_clear.removeAttribute("style")}function clear_filter_bar(e){filter_bar.value="",show_filter_clear(),search_checkboxes(),has_class(body,class_tracking_page)&&filter_bar.focus()}function save_setting(e){var t=e.target.dataset.name,a=e.target.id;if(!(Object.keys(coins).length<max_checks))return cl("Too many coins are being tracked, remove some, then try again"),e.preventDefault(),!1;var s=getKeyByValue(chks,a);e.target.checked?(coins[t]=a,chks[s].checked=!0,chks[s].markup=chks[s].markup.replace("><label"," checked><label"),ls.order||(coins=sort_object(coins)),ls.setItem("coins",JSON.stringify(coins)),ls.removeItem("coins_manually_cleared")):(delete coins[t],chks[s].checked=!1,chks[s].markup=chks[s].markup.replace(" checked><label","><label"),ls.setItem("coins",JSON.stringify(coins)),Object.keys(coins).length<1&&(ls.removeItem("coins"),ls.removeItem("order"),ls.setItem("coins_manually_cleared",!0)))}function uncheck_all(){for(var e in coins){var t=coins[e],a=getKeyByValue(chks,t);chks[a].checked=!1,chks[a].markup=chks[a].markup.replace(" checked><label","><label"),document.getElementById(t).checked=!1}coins={},ls.removeItem("coins"),ls.setItem("coins_manually_cleared",!0),clear_filter_bar()}function build_elements(){update_status("Building elements...",""),add_class(body,class_app_loading);for(var e in coins){var t=document.getElementById("placeholder").cloneNode(!0),a=t.querySelector(".ti-name"),s=t.querySelector(".ti-symbol");t.querySelector(".ti-price"),t.querySelector(".ti-change");t.removeAttribute("id"),t.classList.add(ti_prefix+coins[e].toLowerCase()),t.classList.add("actual"),a.innerHTML=e,s.innerHTML=coins[e],document.getElementById("ticker").insertBefore(t,document.getElementById("welcome"))}update()}function update(){if(document.querySelectorAll(".actual").length>0){var e,t=Date.now()-last_updated;if(timeout_delay=api_throttle-t,has_class(body,class_app_loading)||add_class(body,class_app_updating),timeout_delay>0)cl("Will get updated data from CryptoCompare in "+timeout_delay+"ms"),timeout_delay>1e3?(update_status("Updating data in "+Math.round(timeout_delay/1e3)+" seconds..."),e=1e3):timeout_delay<1e3&&timeout_delay>0&&(update_status("Updating data in "+timeout_delay+" ms..."),e=timeout_delay),timeout_id=setTimeout(function(){timeout_delay-=e,clearTimeout(timeout_id),timeout_id=null,update()},e);else setTimeout(function(){get_coin_data()},ux_delay)}}function get_coin_data(){check_motd(),update_status("Getting data from CryptoCompare...","");var e="https://min-api.cryptocompare.com/data/pricemultifull?fsyms="+Object.values(coins).toString()+"&tsyms="+currency,t=new XMLHttpRequest;t.timeout=2e4,t.open("GET",e),t.onloadstart=function(){last_updated=Date.now(),ls.setItem("last_updated",last_updated)},t.onloadend=function(){if(200===t.status){var a=JSON.parse(t.responseText);for(var s in a.DISPLAY){var c=document.querySelector("."+ti_prefix+s.toLowerCase()),n=c.querySelector(".amount"),r=c.querySelector(".sign"),l=c.querySelector(".amount").innerHTML,o=a.DISPLAY[s][currency].PRICE.split(" ")[1],i=a.DISPLAY[s][currency].TOSYMBOL,d=c.querySelector(".ti-change"),u=a.DISPLAY[s][currency].CHANGEPCT24HOUR,_=Object.values(coins).indexOf(s)+1;r.innerHTML=i,i.length>1&&(r.innerHTML="<span>"+i+"</span>"),n.innerHTML=o,l&&(parseFloat(o)>parseFloat(l)?(cl(s+" price has gone up - old price was "+parseFloat(l)+", new price is "+parseFloat(o)),price_increase(_)):parseFloat(o)<parseFloat(l)&&(cl(s+" price has gone down - old price was "+parseFloat(l)+", new price is "+parseFloat(o)),price_decrease(_))),u.startsWith("-")?(d.style.color=red,d.innerHTML=u+"%"):(d.style.color=green,d.innerHTML="+"+u+"%")}remove_class(body,class_app_loading),remove_class(body,class_app_updating),update_status("Last updated: "+format_last_updated(last_updated),get_current_date_time(last_updated))}else console.log(t),console.log("Error getting data from "+e),update_status("Error, check console...","")},t.send(null)}function check_motd(){!ls.motd_cleared&&ls.motd&&(add_class(body,class_show_alert),alert_el.getElementsByTagName("span")[0].innerHTML=ls.motd),(!ls.last_motd_check||Date.now()/1e3-parseInt(ls.last_motd_check)/1e3>time_between_checks)&&(ls.setItem("last_motd_check",Date.now()),ls.removeItem("motd_cleared"),get_motd())}function get_motd(){var e=new XMLHttpRequest;e.timeout=2e4,e.open("GET","https://raw.githubusercontent.com/quoid/coin-ticker/motd/motd.json"),e.onloadend=function(){if(200===e.status){var t=JSON.parse(e.responseText);if("false"!=t.enabled){var a=t.message[Math.floor(Math.random()*t.message.length)];ls.setItem("motd",a),alert_el.getElementsByTagName("span")[0].innerHTML=a,add_class(body,class_show_alert)}}else alert_el.getElementsByTagName("span")[0].innerHTML="Error, check console",console.log("Error getting data from "+e.responseURL+" - "+e.responseText)},e.send(null)}function set_currency(){ls.setItem("currency",currency_select.value),currency=currency_select.value}function change_time_format(e){e.target.checked?(cl("ampm turned on"),ls.setItem("ampm","on")):(cl("am pm turned off"),ls.removeItem("ampm"))}function reset(){ls.clear(),ls.setItem("currency","USD"),ls.setItem("coins",JSON.stringify(default_coins)),currency="USD",currency_select.selectedIndex=get_select_index(currency_select,"USD"),document.getElementById("ampm").checked=!1,coins=JSON.parse(ls.coins),document.querySelectorAll(".actual").forEach(function(e){return e.parentNode.removeChild(e)}),remove_class(body,class_settings_page),build_elements()}function mousedown(e){var t=e.target.closest(".actual");cl("Turning drag on for elment with class name '"+t.className+"'"),t.setAttribute("draggable",!0)}function mouseup(e){var t=e.target.closest(".actual");t.classList.contains(".dragging")||t.removeAttribute("draggable")}function dragstart(e){e.target.classList.contains("actual")?(cl("Dragging started for element with class name '"+e.target.className+"'"),e.target.classList.add("dragging"),e.dataTransfer.effectAllowed="copy",e.dataTransfer.setData("Text",this.id)):e.preventDefault()}function dragend(e){e.target.classList.contains("actual")&&(e.target.classList.remove("dragging"),e.target.removeAttribute("draggable"),document.querySelectorAll(".dragover").length>0&&document.querySelector(".dragover").classList.remove("dragover"))}function dragenter(e){var t=e.target,a=document.querySelector(".dragging");t.classList.contains("actual")||(t=e.target.closest(".actual")),t.classList.contains("dragging")||t==a.nextSibling||(document.querySelectorAll(".dragover").length>0&&document.querySelector(".dragover").classList.remove("dragover"),t.classList.add("dragover")),a===t&&document.querySelectorAll(".dragover").length>0&&document.querySelector(".dragover").classList.remove("dragover")}function dragover(e){e.preventDefault()}function drop(e){e.preventDefault();var t=document.querySelector(".dragging"),a=e.target;e.target.classList.contains("actual")||(a=e.target.closest(".actual")),document.getElementById("ticker").insertBefore(t,a),set_coins_order()}function set_coins_order(){var e=document.querySelectorAll(".actual");coins={},ls.removeItem("coins");for(var t=0;t<e.length;t++){var a=e[t].querySelector(".ti-name").innerHTML,s=e[t].querySelector(".ti-symbol").innerHTML;coins[a]=s}ls.setItem("coins",JSON.stringify(coins)),ls.order||ls.setItem("order","custom")}function show_tracking_page(){last_coins=Object.keys(coins),add_class(body,class_tracking_page),add_class(page_tracking,class_checkbox_loading),update_status("Select your coins",""),build_checkboxes()}function hide_tracking_page(){remove_class(body,class_tracking_page),clear_filter_bar(),clusterize.clear(),chks=[],arrays_are_equal(last_coins,Object.keys(coins))?document.querySelectorAll(".actual").length>0?update_status("Last updated: "+format_last_updated(last_updated),get_current_date_time(last_updated)):update_status("Ready...",""):(document.querySelectorAll(".actual").forEach(function(e){return e.parentNode.removeChild(e)}),Object.keys(coins).length>0?build_elements():update_status("Ready...",""))}function show_settings_page(){cl("Showing settings page"),add_class(body,class_settings_page),last_curr=ls.currency,update_status("Settings","")}function hide_settings_page(){remove_class(body,class_settings_page),last_curr!=ls.currency&&Object.keys(coins).length>0?(document.querySelectorAll(".actual").forEach(function(e){return e.parentNode.removeChild(e)}),build_elements()):update_status("Last updated: "+format_last_updated(last_updated),get_current_date_time(last_updated))}function navigate_back(){has_class(body,class_tracking_page)?hide_tracking_page():has_class(body,class_settings_page)&&hide_settings_page()}function start(){update_status("Starting...",""),Object.keys(coins).length>0?document.querySelectorAll(".actual").length<1?build_elements():update():update_status("Ready...","")}function load_settings(){ls.coins?coins=JSON.parse(ls.coins):ls.coins||ls.coins_manually_cleared||(ls.setItem("coins",JSON.stringify(default_coins)),coins=default_coins),ls.currency?(currency=ls.currency,currency_select.selectedIndex=-1,document.getElementById("c_usd").removeAttribute("selected"),currency_select.selectedIndex=get_select_index(currency_select,ls.currency),document.getElementById("c_"+ls.currency.toLowerCase()).setAttribute("selected","selected")):ls.setItem("currency","USD"),ls.ampm&&(cl("Local storage exists for time format, loading it"),time_format_toggle.checked=!0),ls.last_updated&&(last_updated=ls.last_updated)}document.getElementById("ticker").addEventListener("mousedown",function(e){"ti-icon"===e.target.className&&mousedown(e)}),document.getElementById("ticker").addEventListener("mouseup",function(e){"ti-icon"===e.target.className&&mouseup(e)}),document.getElementById("ticker").addEventListener("dragstart",function(e){e.target.classList.contains("actual")&&dragstart(e)}),document.getElementById("ticker").addEventListener("dragend",function(e){e.target.classList.contains("actual")&&dragend(e)}),document.getElementById("ticker").addEventListener("dragenter",function(e){e.target.classList.contains("actual")&&dragenter(e)}),document.getElementById("ticker").addEventListener("dragover",function(e){e.target.classList.contains("actual")&&dragover(e)}),document.getElementById("ticker").addEventListener("drop",function(e){e.target.classList.contains("actual")&&drop(e)}),button_add_coins.addEventListener("click",show_tracking_page),button_back.addEventListener("click",navigate_back),filter_bar.addEventListener("input",function(){search_checkboxes(),show_filter_clear()}),filter_clear.addEventListener("click",clear_filter_bar),filter_clear.addEventListener("keydown",clear_filter_bar),page_tracking.addEventListener("click",function(e){"ck"===e.target.className&&save_setting(e)}),button_uncheck_all.addEventListener("click",uncheck_all),button_settings.addEventListener("click",show_settings_page),currency_select.addEventListener("change",set_currency),time_format_toggle.addEventListener("click",change_time_format),button_reset.addEventListener("click",reset),button_refresh.addEventListener("click",function(){has_class(body,class_app_updating)||update()}),button_close_motd.addEventListener("click",function(){ls.setItem("motd_cleared","true"),remove_class(body,class_show_alert)}),document.addEventListener("click",function(e){"A"===event.target.tagName&&open_link(e)}),window.addEventListener("blur",function(){cl("Window or extension lost focus"),update_status("blur",""),update_status("Last updated: "+format_last_updated(last_updated),get_current_date_time(last_updated)),null!=timeout_id&&remove_data_request_delay(),has_class(body,class_tracking_page)&&(arrays_are_equal(last_coins,Object.keys(coins))||document.querySelectorAll(".actual").forEach(function(e){return e.parentNode.removeChild(e)}),remove_class(body,class_tracking_page),clear_filter_bar(),clusterize.clear(),chks=[]),has_class(body,class_settings_page)&&(last_curr!=ls.currency&&document.querySelectorAll(".actual").forEach(function(e){return e.parentNode.removeChild(e)}),remove_class(body,class_settings_page))}),window.addEventListener("load",function(){load_settings(),init_clusterize(),start()});