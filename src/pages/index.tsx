import React from "react"
import { graphql } from "gatsby"

import StackMap from "../components/StackMap"
import Layout from "../components/layout"
import SEO from "../components/seo"
import * as cfn from "../lib/cfn"
import {
  StacksJsonConnection,
  TemplatesJsonConnection,
  ExportsJsonConnection,
} from "../graphql-types"

interface Props {
  data: {
    stacks: StacksJsonConnection
    templates: TemplatesJsonConnection
    exports: ExportsJsonConnection
  }
}

const IndexPage: React.FC<Props> = ({ data }) => {
  const stacks = data.stacks.nodes.map(s => {
    const template = data.templates.nodes.find(
      node => node.StackName === s.StackName
    )
    if (!template) {
      throw new Error(`The template of stack ${s.StackName} not found`)
    }
    const params = Object.fromEntries(
      s.Parameters!.map(p => [p!.ParameterKey!, p!.ParameterValue!])
    )
    return {
      name: s.StackName!,
      id: s.StackId!,
      manifest: cfn.parseYAML(template.TemplateBody!),
      parameters: params,
    }
  })

  return (
    <Layout>
      <SEO title="Home" />
      <StackMap stacks={stacks} />
    </Layout>
  )
}

export const query = graphql`
  query {
    stacks: allStacksJson {
      nodes {
        StackId
        StackName
        Parameters {
          ParameterKey
          ParameterValue
        }
        Outputs {
          OutputKey
          OutputValue
          ExportName
        }
      }
    }
    templates: allTemplatesJson {
      nodes {
        StackName
        TemplateBody
      }
    }
    exportsJson: allExportsJson {
      nodes {
        ExportingStackId
      }
    }
  }
`

export default IndexPage
