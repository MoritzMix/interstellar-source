import React, { Component } from 'react';
import appEmitter from "../helper/appEmitter"

let Subscription = null;

class Footer extends Component {

  constructor(props) {
    super(props);
    this.startButton = React.createRef();
    this.startPathfinding = this.startPathfinding.bind(this);
    this.state = { nodeArr: [] }
  }

  componentWillMount() {
    Subscription = appEmitter.addListener('pushNode', (payload) => {
      this.setState(prevState => ({
        "nodeArr": [...prevState.nodeArr, payload]
      }))
    });
  }

  componentWillUnmount() {
    Subscription.remove();
  }

  startPathfinding() {
    this.setState({ "nodeArr": [] });
    appEmitter.emit('startButton', this.startButton);
  }

  render() {
    //const { data } = this.props; // add more props here as needed
    //
    let planets = this.state.nodeArr.map((node, i) => {
      return <li
        key={i}>{node.label}</li>;
    });

    return <footer
      style={{
        alignItems: "flex-end",
        background: `#1b1b1b`,
        borderTop: "5px solid #6EAB1B",
        color: `#6EAB1B`,
        display: "flex",
        fontFamily: 'Orbitron',
        gridArea: "footer",
        padding: "20px"
      }}
    >
      <button ref={this.startButton} className="button" onClick={this.startPathfinding}>
        Go!
    </button>
      <ul className="planetList">
        {planets}
      </ul>
    </footer>
  }
}


export default Footer

/*
<i className="material-icons">zoom_in</i>
      <i className="material-icons">zoom_out_map</i>
      <i className="material-icons">zoom_out</i>

*/