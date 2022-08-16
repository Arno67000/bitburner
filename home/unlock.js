/** @param {NS} ns */
export async function main(ns) {
	if (!Array.isArray(ns.args) || ns.args.length !== 1) {
		ns.tprint("missing arguments : run {thisScript} [target]");
		ns.exit();
	}
	const target = String(ns.args[0]);

	unlock(ns, target);
	ns.exit();
}

/** @param {NS} ns @param {string} target */
export function unlock(ns, target) {
	if (ns.fileExists("BruteSSH.exe")) {
		ns.brutessh(target);
	}
	if (ns.fileExists("FTPCrack.exe")) {
		ns.ftpcrack(target);
	}
	if (ns.fileExists("relaySMTP.exe")) {
		ns.relaysmtp(target);
	}
	if (ns.fileExists("HTTPWorm.exe")) {
		ns.httpworm(target);
	}
	if (ns.fileExists("SQLInject.exe")) {
		ns.sqlinject(target);
	}
	ns.nuke(target);
	return;
}