import React from "react"
import Group from "./Group"
import { findOrDefaultURL as findAWSIconURL } from "./aws-icon"

interface Props {
  logicalName: string
  resourceType: string
  x: number
  y: number
}

const ImageRadius = 32
const ImageBorderWidth = 8

const Resource: React.FC<Props> = ({ logicalName, resourceType, x, y }) => {
  const [showText, setShowText] = React.useState(false)

  return (
    <Group x={x} y={y}>
      <circle
        r={ImageRadius + ImageBorderWidth}
        x={x}
        y={y}
        fill="white"
        cursor="pointer"
        onMouseEnter={() => setShowText(true)}
        onMouseLeave={() => setShowText(false)}
      />
      <image
        x={-ImageRadius}
        y={-ImageRadius}
        width={ImageRadius * 2}
        height={ImageRadius * 2}
        clipPath={`url(#clip-${logicalName})`}
        href={findAWSIconURL(resourceType)}
        pointerEvents="none"
      />
      <clipPath id={`clip-${logicalName}`}>
        <circle r={ImageRadius} />
      </clipPath>
      <g opacity={showText ? 1 : 0}>
        <text x={0} y={ImageRadius + 24} textAnchor="middle" fontWeight="bold">
          {logicalName}
        </text>
        <text x={0} y={ImageRadius + 36} textAnchor="middle">
          {resourceType}
        </text>
      </g>
    </Group>
  )
}

export default Resource
