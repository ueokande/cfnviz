import React from "react"
import { graphql } from "gatsby"

import StackMap, { Stack } from "../components/stackmap"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Manifest, ManifestParser } from "../cloudformation"
import { TemplatesJsonConnection } from "../graphql-types"

interface Props {
  data: {
    templates: TemplatesJsonConnection
  }
}

const IndexPage: React.FC<Props> = ({ data }) => {
  const stacks = data.templates.edges
    .map(edge => {
      if (!edge.node.TemplateBody) {
        return null
      }
      const manifest = ManifestParser.parse(edge.node.TemplateBody) as Manifest
      return { name: edge.node.StackName, manifest }
    })
    .filter((o): o is Stack => o !== null)

  return (
    <Layout>
      <SEO title="Home" />
      <StackMap stacks={stacks} />
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
