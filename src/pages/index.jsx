import React, { Component } from 'react';
import { StaticQuery, graphql } from "gatsby"

import Header from "../components/header.jsx"
import Content from "../components/content.jsx"
import Footer from "../components/footer.jsx"

import { AppProvider } from "../data/store"

import "./layout.css"

class IndexPage extends Component {
  //state = { name: 'Spyna' } { data } = this.props
  render() {
    const { data } = this.props; // add more props here as needed
    return (
      <AppProvider value={data}>
        <div id="App">
          <Header></Header>
          <Content></Content>
          <Footer></Footer>
        </div>
      </AppProvider>
    )
  }
}
//export default IndexPage

export default props => (
  <StaticQuery
    query={
      graphql`
      query {
          dataJson {
              nodes {
                  label
              }
              edges {
                  source
                  target
                  cost  
              }
          }
      }`
    }
    render={data => <IndexPage data={data} {...props} />}
  />
);
