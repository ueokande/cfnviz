import React from "react"
import { findOrDefaultURL as findAWSIconURL } from "./aws-icon"
import Stack from "./Stack"
import Resource from "./Resource"
import { Manifest } from "../lib/cfn"

export type Stack = {
  name: string
  id: string
  manifest: Manifest
  parameters: { [key: string]: string }
}

interface Props {
  stacks: Stack[]
}

const width = 1920
const height = 1080

const StackMap: React.FC<Props> = ({ stacks }) => {
  const stackNodes = stacks.map((stack, i) => ({
    data: stack,
    x: i * (240 + 10) - width / 2,
    y: -height / 2 + 100,
    height: Object.keys(stack.manifest.Resources!).length * 240,
    children: Object.entries(stack.manifest.Resources!).map(
      ([logicalName, resource], j) => ({
        x: 30,
        y: j * 240 + 30,
        data: { name: logicalName, resource: resource!, stack },
      })
    ),
  }))

  return (
    <svg
      viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      textAnchor="middle"
      fontSize="14px"
      fontFamily="arial"
    >
      {stackNodes.map(node => (
        <Stack
          name={node.data.name}
          x={node.x}
          y={node.y}
          height={node.height}
          key={`stack-${node.data.name}`}
        >
          {node.children.map(resource => (
            <Resource
              key={`resource-${resource.data.name}`}
              x={resource.x}
              y={resource.y}
              logicalName={resource.data.name}
              resourceType={resource.data.resource.Type}
            />
          ))}
        </Stack>
      ))}
    </svg>
  )
}

export default StackMap
