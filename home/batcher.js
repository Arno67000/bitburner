import {calculator} from "./calculator.js";

/** @param {NS} ns */
export async function main(ns) {
	if (!Array.isArray(ns.args) || ns.args.length !== 1) {
		ns.tprint("missing arguments : run {thisScript} [target]");
		ns.exit();
	}
	const target = String(ns.args[0]);
	ns.run("unlock.js", 1, target);
	
	const batch = ["h.js", "g.js", "w.js"];
	const Hpow = ns.getScriptRam("h.js");
	const Gpow = ns.getScriptRam("g.js");
	const Wpow = ns.getScriptRam("w.js");

	const availablePower = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
	const neededPower = Hpow + Gpow + 2 * Wpow;

	// calculate max threads of the complete batch = max available batch launch count
	const threads = Math.floor(availablePower/neededPower);

	// sending scripts on target
	const delivered = await ns.scp(batch, "home", target);
	if (!delivered) {
		ns.tprint(`BATCH DELIVERY ON ${target} FAILED`);
	}
	const PIDS = [];

	await batchRunner(ns, target, threads, 1, { Hpow, Gpow, Wpow }, neededPower, PIDS);
}
/** 
 * @param {NS} ns 
 * @param {string} target 
 * @param {number} threads 
 * @param {number} iterator 
 * @param {Record<string, number>} batchPower
 * @param {number} needed_RAM 
 * @param {number[]} PIDS*/
export async function batchRunner(ns, target, threads, iterator, batchPower, needed_RAM, PIDS) {
	// js min_delay
	const t0 = 30;
	//checking availability for weak servers
	let available_RAM = 0;
	const max_RAM = ns.getServerMaxRam(target);
	let requiredBatch = iterator >= threads ? PIDS.slice(-threads * 4, -threads * 4 + 4) : [];
	let prevBatchEnded = previousBatchEnded(ns, requiredBatch);
	while (available_RAM < needed_RAM || !prevBatchEnded) {
		available_RAM = max_RAM - ns.getServerUsedRam(target);
		prevBatchEnded = previousBatchEnded(ns, requiredBatch);
		await ns.sleep(t0);
	}
	// try multi-threading
	let margin = iterator >= threads ? available_RAM - needed_RAM : 0;
	ns.print(`MARGIN : ${margin} `);
	let Hthreads = 1;
	const Wthreads = 1;
	let Gthreads = 1;
	let WIIthreads = 1;

	while (margin >= batchPower.Hpow) {
		if (margin > batchPower.Wpow && margin > batchPower.Gpow) {
			Gthreads <= WIIthreads ? Gthreads++ : WIIthreads++;
			margin -= batchPower.Wpow;
		} else {
			Hthreads++;
			margin -= batchPower.Hpow;
		}
	}
	// re-calculate times to handle hacking level augmentation
	const Wt = ns.getWeakenTime(target);
	const Gt = ns.getGrowTime(target);
	const Ht = ns.getHackTime(target);

	const { period, depth } = calculator(threads, Wt, Gt, Ht, t0);

	// HWGW setup
	const batch = [
		{
			script: "h.js",
			threads: Hthreads,
			delay: Number(depth * period - 4 * t0 - Ht)
		},
		{
			script: "w.js",
			threads: Wthreads,
			delay: Number(depth * period - 3 * t0 - Wt),
		},
		{
			script: "g.js",
			threads: Gthreads,
			delay: Number(depth * period - 2 * t0 - Gt),
		},
		{
			script: "w.js",
			threads: WIIthreads,
			delay: Number(depth * period - t0 - Wt),
			spec: true
		}
	];

	// Calculating delay between batch run
	const T = (Wt + 4 * t0) / threads;
	ns.print(`NB of BATCH: ${threads}, DELAY: ${T}`);
	
	// running batch
	batch.forEach((param) => {
		const ARGS = [param.script, target, param.threads, target, param.delay, iterator];
		if (param.spec) ARGS.push(iterator);
		const PID = ns.exec(...ARGS);
		PIDS.push(PID)
	})

	// synchronizing
	await ns.sleep(T);

	return await batchRunner(ns, target, threads, iterator + 1, batchPower, needed_RAM, PIDS);
}

/**@param {NS} ns @param {number[] PIDS} */
function previousBatchEnded(ns, PIDS) {
	if (PIDS.length < 4) {
		return true;
	}
	return ns.getRunningScript(PIDS[0]) === null && 
		ns.getRunningScript(PIDS[1]) === null && 
		ns.getRunningScript(PIDS[2]) === null && 
		ns.getRunningScript(PIDS[3]) === null
}