import { autoRun } from "./autoRun.js";

/** @param {NS} ns */
export async function main(ns) {
	const MIN = 60 * 1000;
	while (true) {
		const hacking = ns.getPlayer().hacking;
		const timeHandler = hacking / 10 * MIN;
		const DELAY = timeHandler < 120 * MIN ? timeHandler : 120 * MIN;
		try {
			ns.tprint("WORM RUNNING .....");
			await autoRun(ns);
			const nextLaunch = new Date(Date.now() + DELAY);
			ns.tprint(`WORM sleeping : next attack at ${nextLaunch.toTimeString()} `);
			await ns.sleep(DELAY);
		} catch (e) {
			ns.tprint("WORM KILLED !!!!");
			ns.exit();
		}
	}
}