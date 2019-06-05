import React, { Component } from 'react';

import * as d3 from "d3";

import { AppConsumer } from "../data/store"
import appEmitter from "../helper/appEmitter"
import { Graph, findPath } from "../functions/dijkstra"


import "./graph.css"


let Subscription_Path = null,
    Subscription_Start = null,
    Subscription_End = null;

class GraphComponent extends Component {

    constructor(props) {
        super(props);
        this.svgContainer = React.createRef();
        this.state = {
            startNode: "Erde",
            endNode: "b3-r7-r4nd7"
        }
    }

    componentWillMount() {
        Subscription_Path = appEmitter.addListener('startButton', () => {
            this.drawPath();
        });
    }

    componentDidMount() {
        const data = this.props.context;
        let container = this.svgContainer.current
        this.drawChart(data.dataJson, container, 1);

        function findGroup(label) {
            return document.querySelectorAll(`[data-label="${label}"]`)
        }

        Subscription_Start = appEmitter.addListener('changeStart', (payload) => {
            this.setState({ "startNode": payload });
            document.querySelectorAll(".activePlanet, .startPlanet, .activeLane").forEach(el => el.classList.remove("activePlanet", "startPlanet", "activeLane"));
            findGroup(payload).forEach(el => el.classList.add("startPlanet"));
        });

        Subscription_End = appEmitter.addListener('changeEnd', (payload) => {
            this.setState({ "endNode": payload });
            document.querySelectorAll(".activePlanet, .endPlanet, .activeLane").forEach(el => el.classList.remove("activePlanet", "endPlanet", "activeLane"));
            findGroup(payload).forEach(el => el.classList.add("endPlanet"));
        });
    }

    componentWillUnmount() {
        Subscription_Path.remove();
        Subscription_Start.remove();
        Subscription_End.remove();
    }

    drawPath() {
        const data = this.props.context;

        let self = this,
            nodes = data.dataJson.nodes,
            edges = data.dataJson.edges,
            startNode = this.state.startNode,
            endNode = this.state.endNode,

            start = getPlanetByLabel(nodes, startNode),
            end = getPlanetByLabel(nodes, endNode),
            timer = new Date().getTime(),
            map = new Graph(),
            steps = 1200 / 60;   // 600ms / 60fps 


        function getPlanetByLabel(arr, label) {
            let index = arr.findIndex(node => node.label === label);
            return Object.assign({ index: index }, arr[index]);
        }

        map.addNodes(nodes);
        map.addEdges(edges)

        let { path, cost } = findPath(map, start, end, timer);

        let ref = this.svgContainer.current;

        this.pushNode(nodes[path[0]]);

        let iterationCount = 0,
            i = 1;

        function animate() {

            if (iterationCount % steps === 0) {

                let planet = ref.querySelector(`[data-id="${path[i]}"] circle`),

                    //Daten liegen als gerichteter Graph vor
                    lane = ref.querySelector(`[data-source="${path[i - 1]}"][data-target="${path[i]}"]`)
                        || ref.querySelector(`[data-source="${path[i]}"][data-target="${path[i - 1]}"]`);

                planet.classList.add("activePlanet");
                lane.classList.add("activeLane");
                self.pushNode(nodes[path[i]]);

                i++;
            }
            iterationCount++;

            if (i < path.length) {
                window.requestAnimationFrame(animate);
            } else {
                self.pushNode({ label: `Total Cost: ${cost.toFixed(4)}` });
            }
        }
        window.requestAnimationFrame(animate);
    }

    drawChart(data, container, steps) {

        const { width, height } = container.getBoundingClientRect();
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "starmap");

        const edges = data.edges.map(d => Object.create(d));
        const nodes = data.nodes.map(d => Object.create(d));

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).distance(10))
            .force("charge", d3.forceManyBody().strength(-2))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .selectAll("line")
            .data(edges)
            .join("line");

        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")

        const circle = node.append("circle");

        const label = node.append("text")
            .text(d => `*${d.label}*`)
            .attr('x', 6)
            .attr('y', 3);


        let step = 0,
            self = this;

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            step++;

            if (step >= steps) {
                simulation.stop();

                // workaround: add visual effects only after simulation has stopped
                link
                    .attr("stroke-width", d => +d.cost / 2)
                    .attr("stroke", d => d3.interpolateRdYlGn(1 - +d.cost))
                    .attr("data-source", d => d.source.index)
                    .attr("data-target", d => d.target.index);

                node
                    .attr("data-id", (d, i) => `${i}`)
                    .attr("data-label", d => `${d.label}`)
                    .attr("class", d => {
                        switch (d.label) {
                            case self.state.startNode:
                                return "group startPlanet"
                            case self.state.endNode:
                                return "group endPlanet"
                            default:
                                return "group"

                        }
                    });

                circle
                    .attr("r", d => Math.random() * 3)
                    .attr("fill", d => d3.interpolateOranges(Math.random()));

                label
                    .attr("fill", "white");
            }
        });
    }

    pushNode(node) {
        appEmitter.emit('pushNode', node);
    }

    render() {
        return <AppConsumer>{() => <div id={"svgContainer"} ref={this.svgContainer} style={{ height: "100%", width: "100%" }}>
        </div>}</AppConsumer>;
    }
}


export default React.forwardRef((props, ref) => (
    <AppConsumer>
        {context => <GraphComponent {...props} context={context} ref={ref} />}
    </AppConsumer>
));