import { openBackdoor } from "./backdoor.js";
import { unlock } from "./unlock.js";

/** @param {NS} ns */
export async function main(ns) {
    await autoRun(ns);
    ns.exit();
}

/** @param {NS} ns */
export async function autoRun(ns) {
    const alreadyAttackedList = [];
    const unattackableList = [];

    // reset value because array content persist between run
    scannedServers.length = 0;
    // scan all servers
    scanner(ns, "home");

    // Preparing sorted servers
    const targets = {
        toLightHack: [],
        toGrow: [],
        toRemoteHack: [],
        toHack: [],
        toUnlock: [],
    };

    scannedServers.forEach((serverName) => {
        const server = ns.getServer(serverName);
        const RAM = server.maxRam;

        // check if server is too strong
        if (serverUnattackable(ns, server)) {
            unattackableList.push(serverName);
            return;
        }
        // check if server has no money (factions servers)
        if (serverUnlockable(server)) {
            targets.toUnlock.push(serverName);
            return;
        }
        // check if server cannot run scripts locally BUT got money
        if (serverRemotelyHackable(ns, server)) {
            targets.toRemoteHack.push(serverName);
            return;
        }
        // small servers we need to grow more from 'home' OR server getting poor after hacks
        if (
            (RAM <= 16 && ns.getRunningScript("grow.js", "home", serverName) === null)|| 
            (
                server.moneyMax * 0.75 > server.moneyAvailable && 
                ns.getRunningScript("grow.js", "home", serverName) === null &&
                server.moneyAvailable > 0
            )
        ) {
            targets.toGrow.push(serverName);
        }
        //check if server has already been hacked
        if (serverAlreadyHacked(ns, server)) {
            alreadyAttackedList.push(serverName);
            return;
        }

        /**
         * Here RAM && serverMoney are available
         * */

        if (RAM < 8) {
            // very small server , too small for a batch, we'll launch smaller attack script
            targets.toLightHack.push(serverName);
        } else {
            targets.toHack.push(serverName);
        }
    });
    ns.tprint("**** unattackableList : ", unattackableList, "  ****");

    ns.tprint(`\nTARGETS : \n${JSON.stringify(targets)}`);
    const targetList = Object.values(targets).flat();
    for (const target of targetList) {
        unlock(ns, target);
        let backDoorOpened = ns.getServer(target).backdoorInstalled;
        while (!backDoorOpened) {
            backDoorOpened = await openBackdoor(ns, target);
        }
    }
    // RUNNING
    targets.toLightHack.forEach((target) =>
        ns.run("attack.js", 1, target, "lightHack.js")
    );
    targets.toHack.forEach((target) => ns.run("batcher.js", 1, target));
    targets.toRemoteHack.forEach((target) =>
        ns.run("remoteHack.js", 1, target, 80)
    );
    targets.toGrow.forEach((target) =>
        ns.run("distantRun.js", 1, target, "grow.js", 8)
    );

    // Logging attacked servers
    ns.write(
        "autoLog.txt",
        `\r\n ${new Date().toLocaleTimeString()} : ${JSON.stringify(
            targetList
        )}`,
        "a"
    );
    return;
}

const scannedServers = [];

/** @param {NS} ns @param {string} host*/
function scanner(ns, host) {
    const servers = ns.scan(host);

    for (const server of servers) {
        if (!scannedServers.includes(server) && server !== "home") {
            scannedServers.push(server);
            scanner(ns, server);
        }
    }
}

/** @param {NS} ns @param {Server} server*/
function serverUnattackable(ns, server) {
    return (
        (server.numOpenPortsRequired === 5 &&
            !ns.fileExists("SQLInject.exe", "home")) ||
        (server.numOpenPortsRequired === 4 &&
            !ns.fileExists("HTTPWorm.exe", "home")) ||
        (server.numOpenPortsRequired === 3 &&
            !ns.fileExists("relaySMTP.exe", "home")) ||
        (server.numOpenPortsRequired === 2 &&
            !ns.fileExists("FTPCrack.exe", "home")) ||
        (server.numOpenPortsRequired === 1 &&
            !ns.fileExists("BruteSSH.exe", "home")) ||
        server.requiredHackingSkill > ns.getPlayer().hacking
    );
}

/** @param {Server} server*/
function serverUnlockable(server) {
    return (
        (server.moneyAvailable === 0 && !server.hasAdminRights) ||
        !server.backdoorInstalled
    );
}

/** @param {NS} ns @param {Server} server*/
function serverAlreadyHacked(ns, server) {
    return (
        server.moneyAvailable === 0 ||
        ns.getRunningScript(
            "hack.js",
            "home",
            server.hostname,
            0,
            server.hostname
        ) !== null ||
        server.ramUsed > 0
    );
}

/** @param {NS} ns @param {Server} server*/
function serverRemotelyHackable(ns, server) {
    return (
        server.moneyAvailable > 0 &&
        server.maxRam === 0 &&
        !ns.getRunningScript(
            "hack.js",
            "home",
            server.hostname,
            0,
            server.hostname
        )
    );
}