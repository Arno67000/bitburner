/** This calculator precision can be modified to handle JS concurrency timing mdifying t0 */

/** @param {number} depth_max @param {number} Wt @param {number} Gt @param {number} Ht @param {number} t0 */
export function calculator(depth_max, Wt, Gt, Ht, t0) {
	let period = 0; 
	let depth = 1;
	// Wt > Gt > Ht ==> kW_max < kG_max < kH_max ==> kW_max will be our maximum of simultaneous batch
	// Calculating max number of batch running simultaneously : kW_max
	const kW_max = Math.min ( Math.floor (1 + ( Wt - 4 * t0 ) / (8 * t0 )) , depth_max );
	/**  
	 * Iterating to evaluate the validity of the timings comparing
	 * k for grow and hack should be > than relative k_min 
	 * AND k for weaken should always be at least 1.
	 * this will always generate a valid period and depth using 𝑘𝐻 = 𝑘𝐺 = 𝑘𝑊 = 1 as a min
	 * */
	 // starting with kW set to kW_max to try the max of batch allowed, the max the better ;)
	for ( let kW = kW_max ; kW >= 1; -- kW ) {
		// Calculating min and max time for weaken
		const Wt_min = ( Wt + 4 * t0 ) / kW ;
		const Wt_max = ( Wt - 4 * t0 ) / ( kW - 1);
		// Calculating k_min and k_max for grow relative to k of weaken
		const kG_min = Math.ceil ( Math.max (( kW - 1) * 0.8 , 1));
		const kG_max = Math.floor (1 + kW * 0.8);

		// testing k for grow with the same process , the max the better ;)
		for ( let kG = kG_max ; kG >= kG_min ; -- kG ) {
			// Calculating min and max time for grow
			const Gt_min = ( Gt + 3 * t0 ) / kG
			const Gt_max = ( Gt - 3 * t0 ) / ( kG - 1);
			// Calculating k_min and k_max for hack always relative to k of weaken (weaken takes more time)
			const kH_min = Math.ceil ( Math.max (( kW - 1) * 0.25 , ( kG - 1) * 0.3125 , 1));
			const kH_max = Math.floor ( Math.min (1 + kW * 0.25 , 1 + kG * 0.3125));

			// Then testing k for hack with the same method
			for ( let kH = kH_max ; kH >= kH_min ; -- kH ) {
				// Calculating min and max time for hack
				const Ht_min = ( Ht + 5 * t0 ) / kH ;
				const Ht_max = ( Ht - 1 * t0 ) / ( kH - 1);

				// Extracting the highest min time and the lowest max time to have an ALWAYS VALID range
				const T_min = Math.max ( Ht_min , Gt_min , Wt_min );
				const T_max = Math.min ( Ht_max , Gt_max , Wt_max );

				/** 
				 * If we have a valid min & max we can set the period between batch launch on min time 
				 * we can also set the depth (number of batch) to kW that will depend of the iteration count of the first for() loop
				 * and we can go out of the function returning those values.
				 * Else we will decrement kW (number of simultaneous weaken) and start again
				 * until min time < max time wich will always happen because Wt > Gt > Ht
				*/
				if ( T_min <= T_max ) {
					period = T_min ;
					depth = kW ;
					break;
				}
			}
		}
	}
	return { period, depth}
}