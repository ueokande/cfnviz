import React from "react"

interface Props {
  children: React.ReactNode
  x: number
  y: number
}

const Group: React.FC<Props> = ({ children, x, y }) => (
  <g transform={`translate(${x}, ${y})`}>{children}</g>
)

export default Group
