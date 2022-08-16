/** @param {NS} ns */
export async function main(ns) {
	if (!Array.isArray(ns.args) || ns.args.length !== 3) {
		ns.tprint("MISSING ARGUMENTS : run {thisScript} [target] [scriptName.js] [allocatedThreads]");
		ns.exit();
	}
	const target = String(ns.args[0]);
	const weapon = String(ns.args[1]);
	const allocatedThreads = Number(ns.args[2])

	ns.run("unlock.js", 1, target);

	if (!ns.fileExists(weapon)) {
		ns.tprint(`MISSING SCRIPT : ${weapon}`);
		ns.exit();
	}

	ns.run(weapon, allocatedThreads ?? 1, target);
}