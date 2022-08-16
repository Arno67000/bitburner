/** @param {NS} ns */
export async function main(ns) {
	const target = String(ns.args[0]);
    while (true) {
		const delay = ns.getWeakenTime(target) - ns.getHackTime(target);
		if (!isNaN(delay)) {
			await ns.sleep(delay);
		}
		await ns.hack(target);
	}
}