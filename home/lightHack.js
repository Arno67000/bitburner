/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		const server = ns.getServer();
		if (server.moneyAvailable <= server.moneyMax * 0.75) {
			await ns.weaken(server.hostname);
			await ns.grow(server.hostname);
			await ns.weaken(server.hostname);
			await ns.grow(server.hostname);
			await ns.weaken(server.hostname);
			await ns.hack(server.hostname);
		} else {
			await ns.hack(server.hostname);
			await ns.weaken(server.hostname);
			await ns.grow(server.hostname);
			await ns.weaken(server.hostname);
		}
	}
}