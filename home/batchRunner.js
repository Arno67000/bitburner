/* THIS IS AN OBSOLETE VERSION OF batcher.js */
import { batchRunner } from "./batchHandler.js";

/** @param {NS} ns */
export async function main(ns) {
  if (!Array.isArray(ns.args) || ns.args.length !== 1) {
    ns.tprint("missing arguments : run {thisScript} [target]");
    ns.exit();
  }
  const target = String(ns.args[0]);
  ns.run("unlock.js", 1, target);

  const availablePower =
    ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
  const neededPower = 4 * ns.getScriptRam("rat.js");
  if (availablePower < neededPower) {
    ns.tprint(`NOT ENOUGH RAM TO HACK => needed Power : ${neededPower}`);
    ns.exit();
  }
  // calculate max threads of the complete batch = max available batch launch count
  const threads = Math.floor(availablePower / neededPower);

  // sending scripts on target
  const delivered = await ns.scp("rat.js", "home", target);
  if (!delivered) {
    ns.tprint(`RAT DELIVERY ON ${target} FAILED`);
  }

  await batchRunner(ns, target, threads, 1);
}
