/** @param {NS} ns */
export async function main(ns) {
    const hacknetApi = ns.hacknet;
    while (true) {
        const nodesCount = hacknetApi.numNodes();
        let boughtSum = 0;
        let purchased = 0;
        let core = 0;
        let ram = 0;
        let levels = 0;
        const humanMoney = ns.getPlayer().money;        
        for(let i = 0; i < nodesCount; i++) {
            if(humanMoney > hacknetApi.getCoreUpgradeCost(i, 1)) {
                boughtSum += hacknetApi.getCoreUpgradeCost(i, 1);
                core++;
                hacknetApi.upgradeCore(i, 1);
            }
            if(humanMoney > hacknetApi.getRamUpgradeCost(i, 1)) {
                boughtSum += hacknetApi.getRamUpgradeCost(i, 1);
                ram++;
                hacknetApi.upgradeRam(i, 1);
            }
            if(humanMoney > hacknetApi.getLevelUpgradeCost(i, 1)) {
                boughtSum += hacknetApi.getLevelUpgradeCost(i, 1);
                levels++;
                hacknetApi.upgradeLevel(i, 1);
            }  
            if(humanMoney > hacknetApi.getPurchaseNodeCost(i, 1)) {
                boughtSum += hacknetApi.getPurchaseNodeCost(i, 1);
                purchased++;
                hacknetApi.purchaseNode();
            }
        }
        if (nodesCount === 0) {
            if(humanMoney > hacknetApi.getPurchaseNodeCost(0, 1)) {
                boughtSum += hacknetApi.getPurchaseNodeCost(0, 1);
                purchased++;
                hacknetApi.purchaseNode();
            }
        }
        if (boughtSum === 0) {
            ns.exit();
        } else {
            const bill = { TOTAL_COST: "0.0 m" };
            if (purchased) {
                bill.newNodes = purchased; 
            }
            if (levels) {
                bill.levelsEnhancements = levels;
            }
            if (core) {
                bill.newCores = core;
            }
            if (ram) {
                bill.newRam = ram;
            }
            bill.TOTAL_COST = `${(boughtSum / 1000000).toFixed(3)} millions`;
            ns.tprint(`\r\nNodes investments : \r\n ${JSON.stringify(bill)}`);
            await ns.sleep(120000);
        }
    }
}