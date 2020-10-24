import React from "react"
import YAML from "yaml"
import { graphql } from "gatsby"

import StackMap from "../components/stackmap"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Manifest } from "../cloudformation"
import { TemplatesJsonConnection } from "../graphql-types"

interface Props {
  data: {
    templates: TemplatesJsonConnection
  }
}

const IndexPage: React.FC<Props> = ({ data }) => {
  const manifests = data.templates.edges
    .map(edge => {
      if (!edge.node.TemplateBody) {
        return null
      }
      return YAML.parse(edge.node.TemplateBody) as Manifest
    })
    .filter((o): o is Manifest => o !== null)

  return (
    <Layout>
      <SEO title="Home" />
      <StackMap manifests={manifests} />
    </Layout>
  )
}

export const query = graphql`
  query {
    templates: allTemplatesJson {
      edges {
        node {
          StackName
          TemplateBody
        }
      }
    }
  }
`

export default IndexPage
