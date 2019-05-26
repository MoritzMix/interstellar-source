import { graphql } from "gatsby"

export const DataQuery =
    graphql`
        query DataQuery{
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
        }`;
