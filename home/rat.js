/** @param {NS} ns */
export async function main(ns) {
	const DELAY = Number(ns.args[0]);
	const target = String(ns.args[1]);
	const fn = String(ns.args[2]);
	await ns.sleep(DELAY);
	switch (fn) {
		case "H": 
			await ns.hack(target);
			break;

		case "G":
			await ns.grow(target);
			break;

		case "W":
			await ns.weaken(target);
			break;
			
		default: 
			ns.tprint(`Failed to detect script on ${target} `);
			break;
	}
}