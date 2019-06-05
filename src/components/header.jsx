import React, { Component } from 'react';

import Select from "react-dropdown-select";

import { AppConsumer } from "../data/store"
import appEmitter from "../helper/appEmitter"

import "./header.css"

class Header extends Component {

  constructor(props) {
    super(props);
  }

  changeStart(node) {
    appEmitter.emit('changeStart', node);
  }

  changeEnd(node) {
    appEmitter.emit('changeEnd', node);
  }

  componentDidMount() {
    const data = this.props.context;
  }

  render() {

    let options = this.props.context.dataJson.nodes;
    return <header
      className="header"

    >
      <h1>
        Interstellar
      </h1>
      <a href="https://github.com/MoritzMix/interstellar-source" target="_blank">von Moritz Mix</a>

      <div className="select-container">
        <Select
          className="start"
          options={options}
          key={options.label}
          color="#6eab1b"
          values={[{ label: "Erde" }]}
          onChange={values => this.changeStart(values[0].label)} />
        <Select
          className="end"
          options={options}
          key={options.label}
          color="#6eab1b"
          values={[{ label: "b3-r7-r4nd7" }]}
          onChange={values => this.changeEnd(values[0].label)} />
      </div>
    </header>
  }
}

export default React.forwardRef((props, ref) => (
  <AppConsumer>
    {context => <Header {...props} context={context} ref={ref} />}
  </AppConsumer>
));