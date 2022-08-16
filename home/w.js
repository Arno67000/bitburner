/** @param {NS} ns */
export async function main(ns) {
	const target = String(ns.args[0]);
	const DELAY = Number(ns.args[1]);
	await ns.sleep(DELAY);
	await ns.weaken(target);
}