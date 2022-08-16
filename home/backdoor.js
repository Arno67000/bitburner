import { mapBuilder } from "./mapBuilder.js";

/** @param {NS} ns */
export async function main(ns) {
    const target = String(ns.args[0]);
    await openBackdoor(ns, target);
    ns.exit();
}

/** @param {Object} map @param {string[]} path @param {string} target*/
function crawlBack(map, path, target) {
    let next = "";
    Object.entries(map).forEach(([key, value]) => {
        if (key === target) {
            next = value;
        }
    });
    if (next !== "home") {
        path.unshift(next);
        return crawlBack(map, path, next);
    } else {
        return path;
    }
}

/** @param {string} commandLine */
export function injectCommand(commandLine) {
        const terminalInput = document.getElementById("terminal-input");
        terminalInput.value = commandLine;
        const handler = Object.keys(terminalInput)[1];
        terminalInput[handler].onChange({ target: terminalInput });
        terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
}

/** @param {NS} ns, @param {string} target */
export async function openBackdoor(ns, target) {
    ns.disableLog("ALL");
    let path = [target];
    const map = await mapBuilder(ns);
    crawlBack(map, path, target);
  
    let backdoor = "";
    path.forEach((name) => backdoor += `connect ${name};` );
    backdoor += "backdoor;";
    injectCommand(backdoor);
    while (true) {
        await ns.sleep(5000);
        const terminalInput = document.getElementById("terminal-input");
        const attributes = terminalInput ? terminalInput.getAttributeNames() : ["disabled"];
        const targeted = ns.getServer(target);
        if (targeted.backdoorInstalled && !attributes.includes("disabled")) {
            injectCommand("home");
            ns.enableLog("ALL");
            break;
        };
    }
    return ns.getServer(target).backdoorInstalled;
}