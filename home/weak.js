/** @param {NS} ns */
export async function main(ns) {
	const target = String(ns.args[0]);
	const delay = Number(ns.args[1] ?? 0);
    while (true) {
		await ns.sleep(delay);
		await ns.weaken(target);
	}
}