/** @param {NS} ns */
export async function main(ns) {
	if (!Array.isArray(ns.args) || ns.args.length !== 2) {
		ns.tprint("missing arguments : run {thisScript} [target] [allocatedThreads]");
		ns.exit();
	}

	const target = String(ns.args[0]);
	ns.run("unlock.js", 1, target);

	const allocatedThreads = Number(ns.args[1]) > 10 ? Math.round(Number(ns.args[1]/10)) * 10 : 10;
	const [ grow, weaken, hack ] = ["grow.js", "weak.js", "hack.js"];

	// getting home memory
    const server = ns.getServer();
	const availablePower = server.maxRam - server.ramUsed;
	const powerForWW = 2 * ns.getScriptRam(weaken);
	const neededPower = ns.getScriptRam(grow) + powerForWW + ns.getScriptRam(hack);
	if (availablePower < neededPower) {
		ns.tprint(`NOT ENOUGH RAM TO HACK => needed Power : ${neededPower}`);
		ns.exit();
	}

	// HWGW  / -t 20 = 2 hack , 7 weak, 4 grow, 7 weak / -t 10 = 1 hack, 3 weak, 2 grow, 4 weak
	const medianWeaken = allocatedThreads - (0.3 * allocatedThreads);
	const balanced = medianWeaken % 2 === 0;
	const batch = [
		{
			script: hack,
			threads: allocatedThreads / 10,
			delay: false
		},
		{
			script: weaken,
			threads: balanced ? medianWeaken : Math.floor(medianWeaken / 2),
			delay: false,
		},
		{
			script: grow,
			threads: allocatedThreads / 5,
			delay: false
		},
		{
			script: weaken,
			threads: balanced ? medianWeaken : Math.ceil(medianWeaken / 2),
			delay: true
		}
	];
	try {
		for (const launcher of batch) {
			const PIDS = [];
			const args = [launcher.script, launcher.threads , target, launcher.delay ? 10 : 0, target]; 
			const code = ns.run(...args);
			if (code !== 0) {
				PIDS.push(code);
			} else {
				PIDS.forEach((script) => ns.kill(script));
				throw new Error("ABORTED");
			}
		}
	} catch (err) {
		ns.tprint(err.message);
		ns.exit();
	}
}