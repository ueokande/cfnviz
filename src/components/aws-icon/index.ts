import { FileNames } from "./file-names"

const DefaultIconURL = "unknown.svg"

const NormalizedFileNames = FileNames.map(f => [
  f
    .split("/")[1]
    .replace(/_light-bg\.svg$/, "")
    .replace(/^.*\//, "")
    .replace(/[-_ ]/g, ""),
  "aws/" + f,
])

export const findURL = (resourceType: string): string | null => {
  const [_aws, category, resource] = resourceType.split("::")
  const found = NormalizedFileNames.filter(([name]) => name.includes(category))
  if (found.length > 0) {
    return found.sort((x, y) => x[0].length - y[0].length)[0][1]
  }
  return null
}

export const findOrDefaultURL = (resourceType: string): string => {
  return findURL(resourceType) ?? DefaultIconURL
}
