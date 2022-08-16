/** @param {NS} ns */
export async function mapBuilder(ns) {
    const scannedServers = [];
    scanner(ns, "home", scannedServers);
    graphBuilder(ns, scannedServers);
    ns.write("serverMap.txt", JSON.stringify(graph, null, 2), "w");
    return graph;
}


/** @param {NS} ns @param {string} host @param {string[]} scannedServers*/
function scanner(ns, host, scannedServers) {
    const servers = ns.scan(host);
    for(const server of servers) {
        if(!scannedServers.includes(server) && server !== "home") {
            scannedServers.push(server);
            scanner(ns, server, scannedServers);
        }
    }
}
const graph = {};

/** @param {NS} ns @param {[]} servers*/
function graphBuilder(ns, servers) {
    for (const server of servers) {
        const nearbyServers = ns.scan(server);
        Reflect.set(graph, server, nearbyServers[0])
    }
    return graph
}