/* THIS IS AN OBSOLETE VERSION OF batcher.js */

import { calculator } from "./calculator.js";
/** @param {NS} ns @param {string} target @param {number} threads @param {number} iterator */
export async function batchRunner(ns, target, threads, iterator) {
  // js min_delay
  const t0 = 30;
  //checking availability for weak servers
  let available_RAM = 0;
  const needed_RAM = ns.getScriptRam("rat.js") * 4;
  while (available_RAM < needed_RAM) {
    await ns.sleep(t0);
    available_RAM = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
  }
  // re-calculate times to handle hacking level augmentation
  const Wt = ns.getWeakenTime(target);
  const Gt = ns.getGrowTime(target);
  const Ht = ns.getHackTime(target);

  const { period, depth } = calculator(threads, Wt, Gt, Ht, t0);
  // HWGW setup
  const batch = [
    {
      script: "rat.js",
      fn: "H",
      delay: depth * period - 4 * t0 - Ht,
    },
    {
      script: "rat.js",
      fn: "W",
      delay: depth * period - 3 * t0 - Wt,
    },
    {
      script: "rat.js",
      fn: "G",
      delay: depth * period - 2 * t0 - Gt,
    },
    {
      script: "rat.js",
      fn: "W",
      delay: depth * period - t0 - Wt,
      spec: true,
    },
  ];
  const T = (Wt + 4 * t0) / threads;
  ns.print(`THREADS: ${threads}, Time: ${T}`);

  // running batch
  batch.forEach((param) => {
    const ARGS = [
      param.script,
      target,
      1,
      param.delay,
      target,
      param.fn,
      iterator,
    ];
    if (param.spec) ARGS.push(iterator);
    ns.exec(...ARGS);
  });

  // synchronizing
  await ns.sleep(T);

  return await batchRunner(ns, target, threads, iterator + 1);
}
