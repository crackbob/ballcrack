import hooks from "./hooks";
import moduleManager from "./Module/moduleManager";
import shadowWrapper from "./shadowWrapper";

import clickGUICSS from "./Module/modules/visual/styles/clickgui.css";
import events from "./events";
import interactionUtils from "./utils/interactionUtils";
import blockUtils from "./utils/blockUtils";
import packetUtils from "./utils/packetUtils";
import commandManager from "./Command/commandManager";
import reactUtils from "./utils/reactUtils";
import mobxUtils from "./utils/mobxUtils";

function loadCSS (css) {
    const style = document.createElement('style');
    style.textContent = css;
    shadowWrapper.wrapper.appendChild(style);
}

const productSans = new FontFace("Product Sans", "url(https://fonts.gstatic.com/s/productsans/v19/pxiDypQkot1TnFhsFMOfGShVF9eO.woff2)", {
    style: "normal", weight: "400"
});

productSans.load().then((loadedFace) => document.fonts.add(loadedFace));

const inter300 = new FontFace("Inter", "url(https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa.woff2)", {
    style: "normal", weight: "300" 
});

inter300.load().then((loadedFace) => document.fonts.add(loadedFace));

loadCSS(clickGUICSS);

function init () {
    moduleManager.init();
    hooks.getGameScript();
    hooks.hookOnTick();
    packetUtils.init();
    commandManager.init();

    document.addEventListener("keydown", (e) => {
        events.emit("keydown", e.code);
    });

    setInterval(() => {
        events.emit("render");
    }, (1000 / 60));

    let debug = true;

    if (debug) {
        window.ballcrack = { 
            hooks, shadowWrapper, moduleManager, interactionUtils,
            blockUtils, packetUtils, commandManager, reactUtils, mobxUtils
        }
    }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
