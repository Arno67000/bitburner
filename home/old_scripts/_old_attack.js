/** @param {NS} ns */
export async function main(ns) {
	if (!Array.isArray(ns.args) || ns.args.length !== 2) {
		ns.tprint("missing arguments : run {thisScript} [target] [scriptName.js]");
		return;
	}
	const target = String(ns.args[0]);
	ns.run("unlock.js", 1, target);

	const weapon = String(ns.args[1]);
	const server = ns.getServer(target);

	// AUTO MULTI_THREADING
	const availablePower = server.maxRam - server.ramUsed;
	const neededPower = ns.getScriptRam(weapon);
	const threads = Math.floor(availablePower/neededPower);

	await ns.scp(weapon, "home", server.hostname);
	ns.exec(weapon, server.hostname, threads ?? 1);
}