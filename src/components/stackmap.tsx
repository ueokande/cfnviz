import React from "react"
import { Manifest } from "../cloudformation"

interface Props {
  manifests: Manifest[]
}

const StackMap: React.FC<Props> = ({ manifests }) => {
  return (
    <ul>
      {manifests.map((manifest, i) => (
        Object.entries(manifest.Resources).map((entry, j) => (
          <li key={i + "-" + j}>{entry[0]}({entry[1].Type})</li>
        ))
      ))}
    </ul>
  )
  // const svgRef = React.useRef<SVGSVGElement>(null);
  // return <svg ref={svgRef} />
}

export default StackMap
