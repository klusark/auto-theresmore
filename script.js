// ==UserScript==
// @name         auto-theresmore
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       klusark
// @match        https://www.theresmoregame.com/play/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theresmoregame.com
// @downloadURL  https://raw.githubusercontent.com/klusark/auto-theresmore/main/script.js
// @grant        none
// ==/UserScript==

(function() {

    var resources = {

    }

    function getResources() {
        var rnodes = document.getElementById("root").children[1].children[0].children[0].children[0].children[0].children[0].children[0]
        for (var i = 0; i < rnodes.childElementCount; ++i) {
            var row = rnodes.children[i]
            var resource = row.children[0].children[0].innerHTML
            var rate = parseFloat(row.children[2].innerHTML)
            if (! (resource in resources)) {
                resources[resource] = {}
            }
            resources[resource].rate = rate
        }
    }

    function updateTooltip(node) {
        console.log("Tooltip Update")

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
            var has = false
            if (neededhtml.indexOf("(") == -1) {
                has = true
            //    continue
            }
            var split = neededhtml.split(" ")
            var needed = parseInt(split[0].replaceAll(",",""))


            var val = "stuff"
            if (resource in resources) {
                val = Math.round(needed / resources[resource].rate)
            }
            row.children[0].innerHTML = resource + " ["+val+"]"
        }
    }


    function updateTooltipObserved(m) {
        getResources();
        updateTooltip(m);

    };

    const observer = new MutationObserver((m) => {
        console.log("Body Observe", m)
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
                console.log("Tooltip Observe", m)
                updateTooltipObserved(content)
            });
            getResources();
            updateTooltip(content);
            if (node.children[0].children[0].childElementCount == 0) {
                observer2.observe(node.children[0].children[0], {subtree: false, childList : true});
            }
        }
    });



    observer.observe(document.getElementsByTagName("body")[0], {subtree: false, childList : true});



    var html = `<div style="z-index: 9999;visibility: visible;position: absolute;inset: 0px auto auto 0px;margin: 0px;transform: translate(0px, 500px);">
   <div class="tippy-box !max-w-[300px]" data-state="visible" tabindex="-1" data-animation="fade" role="tooltip" data-placement="bottom" style="max-width: 350px; transition-duration: 300ms;">
      <div data-state="visible" style="transition-duration: 300ms;">
         <div>
            <p class="3xl:pt-2 text-base font-bold !text-violet-900 dark:!text-violet-300">Auto Settings</p>
            <input type="checkbox" id="autobuyenabled" >
			 <label for="autobuy">Choose a building:</label>

             <select name="autobuy" id="autobuy" style="color: black; height: 300px" multiple>
             </select>
         </div>
      </div>
   </div>
</div>`

    document.body.insertAdjacentHTML("beforeend", html)

    setTimeout(function() {
        var buttons = document.getElementsByTagName("button")
        var autobuy = document.getElementById("autobuy")
        autobuy.innerHTML = ""
        for (var i = 0; i < buttons.length; ++i) {
            var name = buttons[i].childNodes[0].textContent
            if (name == "") {
                continue
            }
            var option = document.createElement("option");
            option.text = name;
            autobuy.add(option);
        }
    }, 1000);


    setInterval(function () {
        var enabled = document.getElementById("autobuyenabled")
        var autobuy = document.getElementById("autobuy")
        if (!enabled.checked) {
            return
        }

        var buttons = document.getElementsByTagName("button")
        for (var i = 0; i < buttons.length; ++i) {
            var name = buttons[i].childNodes[0].textContent
            for (var j = 0; j < autobuy.selectedOptions.length; ++j) {
                if (name != autobuy.selectedOptions[j].innerText) {
                    continue
                }
                if (buttons[i].classList.contains("btn-off")) {
                    continue;
                }
                //console.log("Would click", name)
                buttons[i].click();
            }
        }

    }, 1000);










})();
