import React, { Component } from 'react';

import Select from "react-dropdown-select";

import { AppConsumer } from "../data/store"
import appEmitter from "../helper/appEmitter"

let Subscription = null;

class Header extends Component {

  constructor(props) {
    super(props);
  }

  
  changeEnd(node) {
    console.log("emite", node)
    appEmitter.emit('changeEnd', node);
  }

  componentDidMount() {
    const data = this.props.context;
  }

  render() {

    let options = this.props.context.dataJson.nodes;

    return <header
      style={{
        alignItems: "flex-end",
        background: `#1b1b1b`,
        borderBottom: "5px solid #6EAB1B",
        color: `#6EAB1B`,
        display: "flex",
        fontFamily: 'Orbitron',
        gridArea: "header",
        padding: "20px"
      }}
    >
      <h1 style={{ margin: 0, fontSize: "50px" }}>
        Interstellar
      </h1>
      <p style={{
        marginLeft: "10px"
      }}>von Moritz Mix</p>
      <Select 
      options={options} 
      key={options} 
      values={[{label: "b3-r7-r4nd7"}]}
      onChange={(values) => this.changeEnd(values[0].label)} />
    </header>
  }
}


export default React.forwardRef((props, ref) => (
  <AppConsumer>
    {context => <Header {...props} context={context} ref={ref} />}
  </AppConsumer>
));

