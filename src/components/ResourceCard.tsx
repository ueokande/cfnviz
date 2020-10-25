import React from "react"
import Group from "./Group"
import { findOrDefaultURL as findAWSIconURL } from "./aws-icon"

interface Props {
  logicalName: string
  resourceType: string
  x: number
  y: number
}

const CardWidth = 180
const CardHeight = 200
const ImageRadius = 64

const ResourceCard: React.FC<Props> = ({ logicalName, resourceType, x, y }) => (
  <Group x={x} y={y}>
    <rect width={CardWidth} height={CardHeight} fill="white" />
    <Group x={CardWidth / 2 - ImageRadius} y={CardWidth / 2 - ImageRadius}>
      <image
        width={ImageRadius * 2}
        height={ImageRadius * 2}
        clipPath={`url(#clip-${logicalName})`}
        href={findAWSIconURL(resourceType)}
      />
      <clipPath id={`clip-${logicalName}`}>
        <circle
          r={ImageRadius}
          transform={`translate(${ImageRadius},${ImageRadius})`}
        />
      </clipPath>
    </Group>
    <text x={CardWidth / 2} y={CardWidth} fontWeight="bold">
      {logicalName}
    </text>
    <text x={CardWidth / 2} y={CardWidth + 16} fontWeight="bold">
      {resourceType}
    </text>
  </Group>
)

export default ResourceCard
