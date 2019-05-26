import React, { Component } from 'react';

import * as d3 from "d3";

import { AppConsumer } from "../data/store"
import appEmitter from "../helper/appEmitter"
import { Graph, findPath } from "../functions/dijkstra"

let Subscription = null;
let Subscription2 = null;

const startNodeColor = "blue";
const endNodeColor = "#479030";

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
        Subscription = appEmitter.addListener('startButton', (payload) => {
            this.drawPath();
        });
        console.log("refs", this.refs)
    }

    componentDidMount() {
        const data = this.props.context;
        let container = this.svgContainer.current
        this.drawChart(data.dataJson, container, 1);


        Subscription2 = appEmitter.addListener('changeEnd', (payload) => {
            this.setState({ "endNode": payload });
            let endPlanetNode = document.querySelector(`.${payload}`);




            endPlanetNode.setAttribute("opacity", 1);
            endPlanetNode.setAttribute("r", 5);
            endPlanetNode.setAttribute("fill", endNodeColor);

            endPlanetNode.parentNode.querySelector("text").setAttribute("opacity", 1);
            endPlanetNode.parentNode.querySelector("text").setAttribute("fill", endNodeColor);


            document.querySelector(`:not(.Erde)`).setAttribute("opacity", .1);
            document.querySelector(`:not(Erde)`).setAttribute("r", .1);
            document.querySelector(`:not(.Erde)`).parentNode.querySelector("text").setAttribute("opacity", 0);
        });

    }

    componentWillUnmount() {
        Subscription.remove();
        Subscription2.remove();
    }

    drawPath() {
        const data = this.props.context;

        console.log("state", this.state)
        let nodes = data.dataJson.nodes,
            edges = data.dataJson.edges,
            startNode = this.state.startNode,
            endNode = this.state.endNode || "b3-r7-r4nd7",

            start = getPlanetByLabel(nodes, startNode),
            end = getPlanetByLabel(nodes, endNode),
            timer = new Date().getTime(),
            map = new Graph(),
            steps = 60 / 300;   // 60fps, 0.3s


        function getPlanetByLabel(arr, label) {
            let index = arr.findIndex(node => node.label === label);
            return Object.assign({ index: index }, arr[index]);
        }

        map.addNodes(nodes);
        map.addEdges(edges)

        let { path, cost } = findPath(map, start, end, timer);

        let ref = this.svgContainer.current,
            planets = ref.querySelectorAll(`circle:not(.${startNode}):not(.${endNode})`),
            lanes = ref.querySelectorAll("line");



        planets.forEach(el => el.setAttribute("opacity", ".1"));
        lanes.forEach(el => el.setAttribute("opacity", ".05"));

        this.pushNode({ label: `Total Cost: ${cost.toFixed(4)}` });
        this.pushNode(nodes[path[0]]);

        for (let i = 1; i < path.length; i++) {
            /*
                        var iterationCount = 0;
                        var repeater;
            
                        function animate() {
                            easing = easeInQuad(iterationCount, 0, width, 300);
                            lok.setAttribute('style', 'left: ' + easing + 'px');
                            iterationCount++;
            
                            if (iterationCount > 250) {
                                cancelAnimationFrame(repeater);
                            } else {
                                repeater = requestAnimationFrame(animate);
                            }
                        }
            
                        runlock();
            */

            //ToDo change setTimeout to requestAnimationFrame
            setTimeout(() => {
                let planet = ref.querySelector(`[data-id="${path[i]}"] circle`),
                    //label = ref.querySelector(`[data-id="${path[i]}"] text`),

                    //Daten liegen als gerichteter Graph vor
                    lane = ref.querySelector(`[data-source="${path[i - 1]}"][data-target="${path[i]}"]`)
                        || ref.querySelector(`[data-source="${path[i]}"][data-target="${path[i - 1]}"]`);

                planet.setAttribute("opacity", "1");
                if (i < path.length - 1) { planet.setAttribute("r", "3"); }
                lane.setAttribute("opacity", "1");
                lane.setAttribute("stroke-width", ".5");

                this.pushNode(nodes[path[i]]);

            }, i * 500);
        }
    }

    drawChart(data, container, steps) {

        let startNode = this.state.startNode,
            endNode = this.state.endNode || "b3-r7-r4nd7";

        const { width, height } = container.getBoundingClientRect();
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "starmap");
        // .call(zoom);

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
            .attr('y', 3)
            .attr("fill", d => {
                switch (d.label) {
                    case startNode:
                        return startNodeColor;
                    case endNode:
                        return endNodeColor;
                    default:
                        return null;
                }
            })
            .attr("opacity", d => {
                switch (d.label) {
                    case startNode:
                        return 1;
                    case endNode:
                        return 1;
                    default:
                        return 0;
                }
            });

        let step = 0;

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
                    .attr("opacity", 0.1)
                    .attr("stroke-width", d => +d.cost / 2)
                    .attr("stroke", d => d3.interpolateRdYlGn(1 - +d.cost))
                    .attr("data-source", d => d.source.index)
                    .attr("data-target", d => d.target.index);

                node
                    .attr("data-id", (d, i) => `${i}`)

                circle
                    .attr("r", d => {
                        switch (d.label) {
                            case startNode:
                                return 5;
                            case endNode:
                                return 5;
                            default:
                                return Math.random() * 3;
                        }
                    })
                    .attr("fill", d => {
                        switch (d.label) {
                            case startNode:
                                return startNodeColor;
                            case endNode:
                                return endNodeColor;
                            default:
                                return d3.interpolateOranges(Math.random());
                        }
                    })
                    .attr("class", d => d.label)
                    .attr("opacity", d => {
                        switch (d.label) {
                            case startNode:
                                return 1;
                            default:
                                return 0.3;
                        }
                    });
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