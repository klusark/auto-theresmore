// ==UserScript==
// @name         auto-theresmore
// @namespace    http://tampermonkey.net/
// @version      5
// @description  try to take over the world!
// @author       klusark
// @match        https://www.theresmoregame.com/play/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theresmoregame.com
// @grant        none
// ==/UserScript==

(function() {

    var resources = {

    }

    var lastMove = 0

    document.addEventListener("mousemove", function() {
        lastMove = new Date().getTime()
    });

    function getCurrentTab() {
        var tabs = document.getElementById("main-tabs")
        var buttons = tabs.getElementsByTagName("button")
        for (var i = 0; i < buttons.length; ++i) {
            var button = buttons[i]
            if (button.ariaSelected == "true") {
                return button.childNodes[1].textContent
            }
        }
    }
    function getCurrentSubTab() {
        var currentTab = getCurrentTab()
        var textIndex = 0
        if (currentTab == "Magic") {
            textIndex = 1
        }


        var buttons = document.getElementById("maintabs-container").children[1].children[0].children[0].children[0].children
        for (var i = 0; i < buttons.length; ++i) {
            var button = buttons[i]
            if (button.ariaSelected == "true") {
                return button.childNodes[textIndex].textContent
            }
        }
    }

    function changeTab(name) {
        var tabs = document.getElementById("main-tabs")
        var buttons = tabs.getElementsByTagName("button")
        for (var i = 0; i < buttons.length; ++i) {
            var button = buttons[i]
            if (button.childNodes[1].textContent == name) {
                button.click();
                return true;
            }
        }
        return false;
    }

    function changeSubTab(name) {
        var currentTab = getCurrentTab()
        var textIndex = 0
        if (currentTab == "Magic") {
            textIndex = 1
        }
        var buttons = document.getElementById("maintabs-container").children[1].children[0].children[0].children[0].children
        for (var i = 0; i < buttons.length; ++i) {
            var button = buttons[i]
            if (button.childNodes[textIndex].textContent == name) {
                button.click();
                return;
            }
        }
    }

    function getResources() {
        var rnodes = document.getElementById("root").children[1].children[0].children[0].children[0].children[0].children[0].children[0]
        for (var i = 0; i < rnodes.childElementCount; ++i) {
            var row = rnodes.children[i]
            var resource = row.children[0].children[0].innerHTML
            if (! (resource in resources)) {
                resources[resource] = {}
            }
            var rate = parseFloat(row.children[2].innerHTML)
            var current = row.children[1].childNodes[0].textContent
            var limit = row.children[1].childNodes[2].textContent

            resources[resource].rate = rate
            resources[resource].current = parseInt(current.replaceAll(",",""))
            resources[resource].limit = parseInt(limit.replaceAll(",",""))
            if (limit.indexOf("K") != -1) {
                resources[resource].limit *= 1000
            }
            if (current.indexOf("K") != -1) {
                resources[resource].current *= 1000
            }
        }
    }

    function updateTooltip(node) {
        //console.log("Tooltip Update")

        try {
            if (node == undefined) {
                node = document.getElementsByClassName("tippy-content")[0]
            }
            var rtab = node.children[0].children[2].children[0].children[0]
        } catch (e) {
            return
        }
        for (var i = 0; i < rtab.childElementCount; ++i) {
            var row = rtab.children[i]
            var resource = row.children[0].innerHTML.split(" ")[0]
            var neededhtml = row.children[1].innerHTML
            var split = neededhtml.split(" ")
            var needed = parseInt(split[0].replaceAll(",",""))

            if (!(resource in resources)) {
                continue
            }

            if (split[0].indexOf("K") != -1) {
                needed *= 1000
            }

            var val = Math.round(needed / resources[resource].rate)

            if (needed > resources[resource].limit) {
                val = "X"
            }

            row.children[0].innerHTML = resource + " ["+val+"]"
        }
    }


    function updateTooltipObserved(m) {
        getResources();
        updateTooltip(m);

    };

    const observer = new MutationObserver((m) => {
        //console.log("Body Observe", m)
        for (var i = 0; i < m.length; ++i) {
            if (m[i].addedNodes.length == 0) {
                continue
            }
            var node = m[i].addedNodes[0]

            var contentl = node.getElementsByClassName("tippy-content")
            if (contentl.length == 0) {
                continue
            }
            var content = contentl[0]

            const observer2 = new MutationObserver(function (m) {
                //console.log("Tooltip Observe", m)
                updateTooltipObserved(content)
            });
            getResources();
            updateTooltip(content);
            if (content.children[0].childElementCount == 0) {
                observer2.observe(content.children[0], {subtree: false, childList : true});
            }
        }
    });






    var html = `
<div style="z-index: 9999;visibility: visible;position: absolute;inset: 0px auto auto 0px;margin: 0px;transform: translate(0px, 500px);">
  <div class="tippy-box !max-w-[300px]" data-state="visible" tabindex="-1" data-animation="fade" role="tooltip" data-placement="bottom" style="max-width: 350px; transition-duration: 300ms;">
    <div data-state="visible" style="transition-duration: 300ms;">
      <div>
        <p class="3xl:pt-2 text-base font-bold !text-violet-900 dark:!text-violet-300">Auto Settings</p>
        <label for="autotabenabled">Auto Tab</label>
        <input type="checkbox" id="autotabenabled" >
        <br>
        <label for="autoresearchenabled">Auto Research</label>
        <input type="checkbox" id="autoresearchenabled" >
        <br>
        <label for="autoprayerenabled">Auto Prayer</label>
        <input type="checkbox" id="autoprayerenabled" >
        <br>
        <label for="autobuyenabled">Auto Building</label>
        <input type="checkbox" id="autobuyenabled" >
        <br>
        <label for="autobuynewenabled">Buy New Building</label>
        <input type="checkbox" id="autobuynewenabled" >
        <br>

        <select name="autobuy" id="autobuy" style="color: black; height: 300px" multiple>
        </select>
      </div>
    </div>
  </div>
</div>`

    document.body.insertAdjacentHTML("beforeend", html)

    function updateBuildings() {
        if (getCurrentTab() != "Build") {
            return
        }
        var container = document.getElementsByClassName("tab-container")[0]
        var buttons = container.getElementsByTagName("button")
        var autobuy = document.getElementById("autobuy")
        var enabled = document.getElementById("autobuynewenabled")
        var previousButton = ""
        //autobuy.innerHTML = ""
        for (var i = 0; i < buttons.length; ++i) {
            var name = buttons[i].childNodes[0].textContent
            if (name == "" || name == "Pillars of mana") {
                continue
            }
            if (buttons[i].classList.contains("btn-cap")) {
                continue;
            }
            var found = false
            var prevElementidx = -1
            for (var j = 0; j < autobuy.options.length; ++j) {
                if (name == autobuy.options[j].innerText) {
                    found = true
                    break
                }
                if (previousButton == autobuy.options[j].innerText) {
                    prevElementidx = j
                }
            }
            previousButton = name

            if (found) {
                continue
            }
            var option = document.createElement("option");
            option.text = name;
            autobuy.add(option, prevElementidx+1);
            if (enabled.checked) {
                option.setAttribute('selected', 'selected');
            }
        }
    }

    setTimeout(updateBuildings, 50);
    setInterval(updateBuildings, 1000);

    function processAuto(currentTab, currentSubTab) {
        var enabled, autobuy, container, buttons, i, j, name;
        if (currentTab == "Build") {
            enabled = document.getElementById("autobuyenabled")
            autobuy = document.getElementById("autobuy")
            if (!enabled.checked) {
                return
            }

            container = document.getElementsByClassName("tab-container")[0]
            buttons = container.getElementsByTagName("button")
            var done = false
            for (i = 0; i < buttons.length; ++i) {
                name = buttons[i].childNodes[0].textContent
                for (j = 0; j < autobuy.selectedOptions.length; ++j) {
                    if (name != autobuy.selectedOptions[j].innerText) {
                        continue
                    }
                    if (buttons[i].classList.contains("btn-off")) {
                        continue;
                    }
                    if (buttons[i].classList.contains("btn-progress")) {
                        done = true
                        break;
                    }
                    //console.log("Would click", name)
                    buttons[i].click();
                    done = true
                    break;
                }
                if (done) {
                    break
                }
            }
        } else if (currentTab == "Research") {
            enabled = document.getElementById("autoresearchenabled")
            if (!enabled.checked) {
                return
            }

            var noAuto = ["A moonlight night", "Dragon assault"]

            container = document.getElementsByClassName("tab-container")
            if (container.length == 0) {
                return
            }

            buttons = container[0].getElementsByTagName("button")
            for (i = 0; i < buttons.length; ++i) {
                if (buttons[i].classList.contains("btn-off")) {
                    continue;
                }
                if (buttons[i].classList.contains("btn-progress")) {
                    break;
                }
                name = buttons[i].childNodes[0].textContent

                if (noAuto.includes(name)) {
                    continue;
                }
                //console.log("Would click", name)
                buttons[i].click();
                break;
            }
        } else if (currentTab == "Magic" && currentSubTab == "Prayers") {
            enabled = document.getElementById("autoprayerenabled")
            if (!enabled.checked) {
                return
            }

            container = document.getElementsByClassName("tab-container")
            if (container.length == 0) {
                return
            }

            buttons = container[0].getElementsByTagName("button")
            for (i = 0; i < buttons.length; ++i) {
                if (buttons[i].classList.contains("btn-off")) {
                    continue;
                }
                if (buttons[i].classList.contains("btn-progress")) {
                    break;
                }
                name = buttons[i].childNodes[0].textContent

                buttons[i].click();
                break;
            }
        }
    }

    function autoTab(currentTab, currentSubTab) {
        var enabled = document.getElementById("autotabenabled")

        if (!enabled.checked) {
            return
        }
        var target = ""
        var subTarget = ""
        if (currentTab == "Build") {
            target = "Research"
        } else if (currentTab == "Research") {
            target = "Magic"
        } else if (currentTab == "Magic" && currentSubTab != "Prayers") {
            subTarget = "Prayers"
        } else if (currentTab == "Magic" && currentSubTab == "Prayers") {
            target = "Build"
        } else {
            target = "Build"
        }

        if (target != "") {
            var changed = changeTab(target)
            if (!changed) {
                changeTab("Build")
            }
        }
        if (subTarget != "") {
            changeSubTab(subTarget);
        }
    }

    setInterval(function () {
        var currentTime = new Date().getTime()

        if (currentTime - lastMove < 5000) {
            return
        }


        var currentTab = getCurrentTab()
        var currentSubTab = getCurrentSubTab()

        processAuto(currentTab, currentSubTab);

        autoTab(currentTab, currentSubTab)



    }, 1000);

    observer.observe(document.getElementsByTagName("body")[0], {subtree: false, childList : true});


})();
