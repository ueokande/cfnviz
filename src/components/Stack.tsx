import React from "react"
import Group from "./Group"

interface Props {
  x: number
  y: number
  height: number
  name: string
  children: React.ReactNode
}

const StackWidth = 240

const Stack: React.FC<Props> = ({ name, x, y, height, children }) => (
  <Group x={x} y={y}>
    <rect width={StackWidth} height={height} fill="lightgray" />
    <text x={StackWidth / 2} y={StackWidth / 2} fontWeight="bold">
      {name}
    </text>
    {children}
  </Group>
)

export default Stack
