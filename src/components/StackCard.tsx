import React from "react"
import Group from "./Group"

interface Props {
  x: number
  y: number
  height: number
  stackName: string
  children: React.ReactNode
}

const StackWidth = 240

const StackCard: React.FC<Props> = ({ stackName, x, y, height, children }) => (
  <Group x={x} y={y}>
    <rect width={StackWidth} height={height} fill="lightgray" />
    <text x={StackWidth / 2} y={StackWidth / 2} fontWeight="bold">
      {stackName}
    </text>
    {children}
  </Group>
)

export default StackCard
