// ==UserScript==
// @name         auto-theresmore
// @namespace    http://tampermonkey.net/
// @version      6
// @description  try to take over the world!
// @author       klusark
// @match        https://www.theresmoregame.com/play/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theresmoregame.com
// @grant        none
// ==/UserScript==

(function() {

    var resources = {

    }
    var enabledOptions = {
    }

    var lastMove = 0

    function resetMove(event) {
        if (!event.isTrusted) {
            return
        }
        lastMove = new Date().getTime()
    }

    document.addEventListener("mousemove", resetMove);
    document.addEventListener("click", resetMove);

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
        var buttons = document.querySelectorAll("#maintabs-container > div > div > div > div.grid > button")
        for (var i = 0; i < buttons.length; ++i) {
            var button = buttons[i]
            if (button.childNodes[textIndex].textContent == name) {
                button.click();
                return;
            }
        }
    }

    function getResources() {
        var rnodes = document.querySelector("#root > div > div > div > div > div > table > tbody")
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
        <label for="autoall">Auto All</label>
        <input type="checkbox" id="autoall">
        <br>
        <label for="autotabenabled">Auto Tab</label>
        <input type="checkbox" id="autotabenabled" >
        <br>
        <label for="autocloseenabled">Auto Close</label>
        <input type="checkbox" id="autocloseenabled" >
        <br>
        <label for="autoresearchenabled">Auto Research</label>
        <input type="checkbox" id="autoresearchenabled" >
        <br>
        <label for="autoprayerenabled">Auto Prayer</label>
        <input type="checkbox" id="autoprayerenabled" >
        <br>
        <label for="autopopenabled">Auto Population</label>
        <input type="checkbox" id="autopopenabled" >
        <br>
        <label for="autobuyenabled">Auto Building</label>
        <input type="checkbox" id="autobuyenabled" >
        <br>
        <label for="autobuynewenabled">Buy New Building</label>
        <input type="checkbox" id="autobuynewenabled" >
        <br>

        <select name="autobuy" id="autobuy" style="color: black; height: 300px" multiple></select><br>
        <label for="autoattackenabled">Auto Attack</label>
        <input type="checkbox" id="autoattackenabled" >
        <br>
        <label for="autoarmyenabled">Auto Army</label>
        <input type="checkbox" id="autoarmyenabled" >
        <br>
        <label for="autoexploreenabled">Auto Explore</label>
        <input type="checkbox" id="autoexploreenabled" >
        <br>
        <select name="autoarmy" id="autoarmy" style="color: black" multiple>
          <option>Scout</option>
          <option>Explorer</option>
          <option>Warrior</option>
          <option>Heavy warrior</option>
          <option>Battle Angel</option>
          <option>Knight</option>
          <option>Bombard</option>
        </select>
      </div>
    </div>
  </div>
</div>`

    document.body.insertAdjacentHTML("beforeend", html)

    var all = document.getElementById("autoall")
    all.onchange = function () {
        document.getElementById("autotabenabled").checked = true
        //document.getElementById("autoarmyenabled").checked = true
        //document.getElementById("autoexploreenabled").checked = true
        document.getElementById("autoprayerenabled").checked = true
        document.getElementById("autoresearchenabled").checked = true
        document.getElementById("autobuyenabled").checked = true
        document.getElementById("autobuynewenabled").checked = true
        document.getElementById("autocloseenabled").checked = true
        //document.getElementById("autoattackenabled").checked = true
        document.getElementById("autopopenabled").checked = true
    }

    function updateBuildings() {
        if (getCurrentTab() != "Build") {
            return
        }
        var container = document.getElementsByClassName("tab-container")[0]
        var buttons = container.getElementsByTagName("button")
        var autobuy = document.getElementById("autobuy")
        var previousButton = ""
        var noList = [
            "Harvest Shrine",
            "War Shrine",
            "Mind Shrine",
            "Statue of Atamar",
            "Statue of Firio",
            "Statue of Lurezia"
        ]
        for (var i = 0; i < buttons.length; ++i) {
            var name = buttons[i].childNodes[0].textContent
            if (name == "" || noList.includes(name)) {
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
            if (enabledOptions.buyNew) {
                option.setAttribute('selected', 'selected');
            }
        }

        for (i = 0; i < autobuy.options.length; ++i) {
            found = false
            for (j = 0; j < buttons.length; ++j) {
                name = buttons[j].childNodes[0].textContent
                if (buttons[j].classList.contains("btn-cap")) {
                    continue;
                }
                if (name == autobuy.options[i].innerText) {
                    found = true
                    break
                }
            }
            if (!found) {
                autobuy.remove(i)
            }
        }
    }

    setTimeout(updateBuildings, 50);
    setInterval(updateBuildings, 1000);

    function processAuto(currentTab, currentSubTab) {
        var enemies = document.querySelectorAll("#headlessui-portal-root>div>div>div>div>div>div>div>div>div>table>tbody>tr")
        if (enabledOptions.close && enemies.length == 0) {
            var button = document.querySelector("#headlessui-portal-root>div>div>div>div>div>div>div>button")
            if (button) {
                button.click()
                return
            }
        }

        var autobuy, container, buttons, i, j, name, getall, min;
        if (currentTab == "Build") {
            autobuy = document.getElementById("autobuy")
            if (!enabledOptions.buy) {
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
                    buttons[i].click();
                    done = true
                    break;
                }
                if (done) {
                    break
                }
            }
        } else if (currentTab == "Research") {
            if (!enabledOptions.research) {
                return
            }

            var noAuto = [
                "A moonlight night",
                "Dragon assault",
                "Mysterious robbery",
                'The Fallen Angel reveal',
                'Persuade the nobility',
                'Persuade the people',
                "Infuse the Flame",
                "Exhibit the Flame",
                "Military Colony",
                "Beacon of Faith",
                "Productive Hub"
            ]

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
                buttons[i].click();
                break;
            }
        } else if (currentTab == "Magic" && currentSubTab == "Prayers") {
            if (!enabledOptions.prayer) {
                return
            }

            noAuto = [
                "Protection power", "Incremental power",
                "Desire for Abundance", "Desire for Magic", "Desire for War",
                "Accept the Druid", "Banish the Druid",
            ]

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

                buttons[i].click();
                break;
            }
        } else if (currentTab == "Army" && currentSubTab == "Explore") {
            if (!enabledOptions.explore) {
                return
            }

            container = document.getElementsByClassName("tab-container")
            if (container.length == 0) {
                return
            }

            getall = document.querySelector(".tab-container>div>div>div>div>div.right-0>button");
            if (getall) {
                getall.click();
            } else {
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
                if (buttons[i].classList.contains("btn-blue")) {
                    buttons[i].click();
                    break;
                }
            }
        } else if (currentTab == "Army" && currentSubTab == "Army") {
            autobuy = document.getElementById("autoarmy")
            if (!enabledOptions.army) {
                return
            }

            container = document.getElementsByClassName("tab-container")[0]
            buttons = container.getElementsByTagName("button")
            done = false
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
                    buttons[i].click();
                    done = true
                    break;
                }
                if (done) {
                    break
                }
            }
        } else if (currentTab == "Army" && currentSubTab == "Attack") {
            if (!enabledOptions.attack) {
                return
            }

            enemies = document.querySelectorAll("#headlessui-portal-root>div>div>div>div>div>div>div>div>div>table>tbody>tr")

            if (enemies.length) {
                min = 99
                var e
                for (i = 0; i < enemies.length; ++i) {
                    e = enemies[i]
                    var skulls = e.querySelectorAll("td>div>svg").length
                    if (skulls < min) {
                        min = skulls
                    }
                }

                for (i = 0; i < enemies.length; ++i) {
                    e = enemies[i]
                    skulls = e.querySelectorAll("td>div>svg").length
                    if (skulls == min) {
                        break
                    }
                }

                e.click()
                return
            }

            getall = document.querySelector(".tab-container>div>div>div>div>div.right-0>button");
            if (getall) {
                getall.click();
            } else {
                return
            }

            buttons = document.querySelectorAll(".tab-container>div>div>div>div>div.flex-wrap>button")

            var select = buttons[0]
            var go = buttons[1]

            if (select.innerHTML == "Select an enemy to attack") {
                select.click()
                return
            }
            go.click()
        } else if (currentTab == "Population") {
            if (!enabledOptions.pop) {
                return
            }

            var data = {}
            min = 999

            var pops = document.querySelectorAll("#maintabs-container>div>div>.tab-container>div>div>div")
            for (i = 0; i < pops.length; ++i) {
                var pop = pops[i]
                var amount = pop.querySelector("div>div>input")
                var label = pop.querySelector("div>div>h5")
                var s = amount.value.split(" / ")
                var d = { current: parseInt(s[0]), max: parseInt(s[1])}
                data[label.innerHTML] = d
                if (d.current != d.max && d.current < min) {
                    min = d.current
                }
            }

            for (i = 0; i < pops.length; ++i) {
                pop = pops[i]
                amount = pop.querySelector("div>div>input")
                s = amount.value.split(" / ")
                d = { current: parseInt(s[0]), max: parseInt(s[1])}
                buttons = pop.querySelectorAll("div>div>button")
                if (d.current != d.max && d.current == min) {
                    buttons[2].click()
                    return
                }
            }
        }
    }

    function getEnabledOptions() {
        return {
            tab: document.getElementById("autotabenabled").checked,
            army: document.getElementById("autoarmyenabled").checked,
            explore: document.getElementById("autoexploreenabled").checked,
            prayer: document.getElementById("autoprayerenabled").checked,
            research: document.getElementById("autoresearchenabled").checked,
            buy: document.getElementById("autobuyenabled").checked,
            buyNew: document.getElementById("autobuynewenabled").checked,
            close: document.getElementById("autocloseenabled").checked,
            attack: document.getElementById("autoattackenabled").checked,
            pop: document.getElementById("autopopenabled").checked,
        }
    }

    function getNextTab(currentTab, currentSubTab) {
        var target = ""
        var subTarget = ""

        if (currentTab == "Build") {
            target = "Research"
        } else if (currentTab == "Research") {
            target = "Population"
        } else if (currentTab == "Population") {
            target = "Magic"
        } else if (currentTab == "Magic" && currentSubTab != "Prayers") {
            target = "Magic"
            subTarget = "Prayers"
        } else if (currentTab == "Magic" && currentSubTab == "Prayers") {
            target = "Army"
        } else if (currentTab == "Army" && currentSubTab == "Explore") {
            target = "Army"
            subTarget = "Army"
        } else if (currentTab == "Army" && currentSubTab == "Army") {
            target = "Army"
            subTarget = "Attack"
        } else if (currentTab == "Army" && currentSubTab == "Attack") {
            target = "Build"
            subTarget = "Explore"
        } else if (currentTab == "Army" && currentSubTab != "Explore") {
            target = "Army"
            subTarget = "Explore"
        } else {
            target = "Build"
        }
        var next = false
        if (target == "Research" && !enabledOptions.research) {
            next = true
        } else if (target == "Population" && !enabledOptions.pop) {
            next = true
        } else if (target == "Magic" && !enabledOptions.prayer) {
            next = true
        } else if (target == "Army" && !(enabledOptions.army || enabledOptions.explore || enabledOptions.attack)) {
            next = true
        }

        if (next) {
            return getNextTab(target, subTarget)
        }

        return [target, subTarget]
    }

    function autoTab(currentTab, currentSubTab) {
        enabledOptions = getEnabledOptions()

        if (!enabledOptions.tab) {
            return
        }

        var [target, subTarget] = getNextTab(currentTab, currentSubTab)


        if (target != "" && target != "currentTab") {
            var changed = changeTab(target)
            if (!changed) {
                changeTab("Build")
            }
        }
        if (subTarget != "" && subTarget != "currentSubTab") {
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


    }, 311);

    setInterval(function () {
        var currentTime = new Date().getTime()

        if (currentTime - lastMove < 5000) {
            return
        }


        var currentTab = getCurrentTab()
        var currentSubTab = getCurrentSubTab()


        autoTab(currentTab, currentSubTab)


    }, 4999);

    observer.observe(document.getElementsByTagName("body")[0], {subtree: false, childList : true});


})();
