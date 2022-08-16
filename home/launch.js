/** @param {NS} ns */
export async function main(ns) {
	if (!Array.isArray(ns.args) || ns.args.length !== 1) {
		ns.tprint("missing arguments : run {thisScript} [target]");
		ns.exit();
	}
	const target = String(ns.args[0]);
	ns.run("unlock.js", 1, target);

	const [ grow, weaken, hack ] = ["grow.js", "weak.js", "hack.js"];

	const server = ns.getServer(target);

	// AUTO MULTI_THREADING
	const availablePower = server.maxRam - server.ramUsed;
	const powerForW = ns.getScriptRam(weaken);
	const powerForH = ns.getScriptRam(hack);
	const powerForG = ns.getScriptRam(grow);
	const neededPower = powerForG + powerForH + 2 * powerForW;
	if (availablePower < neededPower) {
		ns.tprint(`NOT ENOUGH RAM TO HACK => needed Power : ${neededPower}`);
		ns.exit();
	}
	// calculate max threads by elements of the complete batch
	const threads = Math.floor(availablePower/(neededPower / 4));
	// allocating 1/10th of the threads for hack();
	const hackAllocation = (threads / 10) < 1 ? 1 : Math.ceil(threads / 10);
	// if enough threads available we'll have grow() * 2 to increase server's available money
	const growAllocation = threads > 4 ? hackAllocation * 2 : 1;

	// calculate threads available for each weaken()
	const weakAllocation = threads - hackAllocation - growAllocation;
	const balanced = weakAllocation % 2 === 0;
	// allocating remaining threads for each weaken()
	const halfWeakAllocation = weakAllocation / 2;
	const floorableWeaken = Math.floor(halfWeakAllocation) > 0;
	const firstWeakenAlloc = balanced ? halfWeakAllocation : floorableWeaken ? Math.floor(halfWeakAllocation) : 1;
	const secondWeakenAlloc = balanced ? halfWeakAllocation : Math.ceil(halfWeakAllocation);
	// checking if allocations could work
	const powerLeft = availablePower - (hackAllocation * powerForH) - (growAllocation * powerForG) - (firstWeakenAlloc * powerForW) - (secondWeakenAlloc * powerForW);
	if (powerLeft < 0) {
		ns.tprint(`Failed to calculate allocated threads , power left: ${powerLeft}`);
		ns.exit();
	}
	// calculate scale up possibilities for second weaken
	const scaleUp = Math.floor(powerLeft / powerForW);

	// HWGW setup
	const batch = [
		{
			script: hack,
			threads:  hackAllocation,
			delay: false
		},
		{
			script: weaken,
			threads: firstWeakenAlloc,
			delay: false,
		},
		{
			script: grow,
			threads: growAllocation,
			delay: false
		},
		{
			script: weaken,
			threads: secondWeakenAlloc + scaleUp,
			delay: true
		}
	];
	
	try {
		// sending scripts on target
		const delivered = await ns.scp([hack, grow, weaken], "home", server.hostname);
		if (!delivered) {
			ns.tprint(`DELIVERY ON ${server.hostname} FAILED`);
		}

		for (const launcher of batch) {
			const args = [launcher.script, server.hostname, launcher.threads, server.hostname]; 
			// adding 1ms delay for second weaken()
			if (launcher.delay) {
				args.push(1);
			} 
			const PIDS = []
			const code = ns.exec(...args);
			if (code !== 0) {
				PIDS.push(code);
			} else {
				PIDS.forEach((script) => ns.kill(script));
				throw new Error("ABORTED");
			}
		}
		ns.tprint(`Successful attack on ${server.hostname}, batch delivered and running...`);
	} catch (err) {
		ns.killall(target);
		ns.tprint(err.message);
		ns.exit();
	}
}