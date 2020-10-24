import React from "react"
import YAML from "yaml"
import { Link } from "gatsby"
import { graphql } from "gatsby"

import StackMap from "../components/stackmap"
import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"
import { Manifest} from "../cloudformation";
import { TemplatesJsonConnection } from "../graphql-types"

interface Props {
  data: {
    templates: TemplatesJsonConnection
  }
}

const IndexPage: React.FC<Props> = ({ data }) => {
  const manifests = data.templates.edges.map(edge => YAML.parse(edge.node.TemplateBody!) as Manifest)

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
