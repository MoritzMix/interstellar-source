

//map.addNode("Insomnia Cookies");
//map.addEdge("Fullstack", "Starbucks", 6);

/*

Graph.nodes[Graph.edges[i].source] 
 Graph.nodes[Graph.edges[i].target] 
 Graph.edges[i].cost 

*/

//node = {label: "Erde"}
//edge = {cost: , source: index, target: index}

class Graph {
    constructor() {
        this.nodes = [];
        this.adjacencyList = {};
    }
    addNode(node) {
        this.nodes.push(node);
        this.adjacencyList[node.index] = [];
    }
    addEdge(source, target, cost) {
        this.adjacencyList[source].push({ node: target, weight: cost });
        this.adjacencyList[target].push({ node: source, weight: cost });
    }

    addNodes(nodeArr) {
        nodeArr.forEach((node, i) => this.addNode({ label: node.label, index: i }))
    }
    addEdges(edgeArr) {
        edgeArr.forEach(edge => this.addEdge(edge.source, edge.target, edge.cost))
    }
}

function findPath(map, startNode, endNode, timer) {

    class PriorityQueue {
        constructor() {
            this.collection = [];
        }
        enqueue(element) {
            if (this.isEmpty()) {
                this.collection.push(element);
            } else {
                let added = false;
                for (let i = 1; i <= this.collection.length; i++) {
                    if (element[1] < this.collection[i - 1][1]) {
                        this.collection.splice(i - 1, 0, element);
                        added = true;
                        break;
                    }
                }
                if (!added) {
                    this.collection.push(element);
                }
            }
        };

        dequeue() {
            return this.collection.shift();
        };
        isEmpty() {
            return (this.collection.length === 0)
        };
    }

    let times = {};
    let backtrace = {};
    let pq = new PriorityQueue();

    times[startNode.index] = 0;

    map.nodes.forEach(node => {
        if (node.label !== startNode.label) {
            times[node.index] = Infinity
        }
    });

    pq.enqueue([startNode.index, 0]);

    while (!pq.isEmpty()) {

        let shortestStep = pq.dequeue();
        let currentNode = shortestStep[0];

        //console.log(JSON.parse(JSON.stringify(shortestStep)))

        map.adjacencyList[currentNode].forEach(neighbor => {

            let time = times[currentNode] + neighbor.weight;
            if (time < times[neighbor.node]) {

                times[neighbor.node] = time;
                backtrace[neighbor.node] = currentNode;
                //  console.log('+'+currentNode)
                //console.log(JSON.parse(JSON.stringify(backtrace)))
                pq.enqueue([neighbor.node, time]);
            }
        });
    }

    let path = [endNode.index];
    let lastStep = endNode.index;
    while (lastStep !== startNode.index) {

        path.unshift(backtrace[lastStep])
        lastStep = backtrace[lastStep]
    }
    return { path: path, cost: times[endNode.index] };
}

export { Graph, findPath };