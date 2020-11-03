import { parse } from "./yaml"
import { Manifest, ManifestData } from "./manifest"

export const parseYAML = (manifest: string): Manifest => {
  const data = parse<ManifestData>(manifest)
  return new Manifest(data)
}

export { Manifest }
