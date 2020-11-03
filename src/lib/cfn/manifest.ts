export interface Fn {
  readonly FullName: string
}

export const instanceOfFn = (a: unknown): a is Fn => {
  return (
    typeof a === "object" && a !== null && typeof (<Fn>a).FullName === "string"
  )
}

export type FieldValue =
  | Fn
  | string
  | number
  | { [key: string]: FieldValue }
  | FieldValue[]

export type ResourceData = {
  Type: string
  Properties: { [key: string]: FieldValue }
}

export class Resource {
  constructor(private data: ResourceData) {}

  get Type() {
    return this.data.Type
  }

  get Properties() {
    return this.data.Properties
  }
}

export type OutputData = {
  Description: string
  Value: unknown
  Export: {
    Name: string
  }
}

export type MappingData = {
  [MapName: string]: {
    [TopLevelKey: string]: {
      [SecondLevelKey: string]: string
    }
  }
}

export class Mapping {
  constructor(private readonly mapping: MappingData) {}

  get(
    mapName: string,
    topLevelKey: string,
    secondLevelKey: string
  ): string | undefined {
    return (
      this.mapping[mapName] &&
      this.mapping[mapName][topLevelKey] &&
      this.mapping[mapName][topLevelKey][secondLevelKey]
    )
  }
}

export type ManifestData = {
  AWSTemplateFormatVersion?: string

  Description?: string

  Metadata?: {
    [Key: string]: {
      Description: string
    }
  }

  Parameters?: {
    [Key: string]: {
      Type: string
      Default: unknown
      Description: string
    }
  }

  Mappings?: MappingData

  Conditions?: { [LogicalId: string]: unknown }

  Transform?: string[]

  Resources?: {
    [LogicalID: string]: ResourceData
  }

  Outputs?: {
    [LogicalID: string]: OutputData
  }
}

export class Manifest {
  constructor(private data: ManifestData) {}

  get AWSTemplateFormatVersion() {
    return this.data.AWSTemplateFormatVersion
  }

  get Description() {
    return this.data.Description
  }

  get Metadata() {
    return this.data.Metadata
  }

  get Parameters() {
    return this.data.Parameters
  }

  get Mappings() {
    if (!this.data.Mappings) {
      return new Mapping({})
    }
    return new Mapping(this.data.Mappings)
  }

  get Conditions() {
    return this.data.Conditions
  }

  get Transform() {
    return this.data.Transform
  }

  get Resources(): { [LogicalID: string]: Resource } | undefined {
    if (!this.data.Resources) {
      return undefined
    }

    const resources: { [key: string]: Resource } = {}
    for (const [id, r] of Object.entries(this.data.Resources)) {
      resources[id] = new Resource(r)
    }
    return resources
  }

  get Outputs() {
    return this.data.Outputs
  }
}
