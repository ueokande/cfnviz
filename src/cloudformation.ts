import yaml from "js-yaml"

type ResourceData = {
  Type: string
  Properties: { [key: string]: unknown }
}

class Resource {
  constructor(private data: ResourceData) {}

  get Type() {
    return this.data.Type
  }

  get Properties() {
    return this.data.Properties
  }
}

type ManifestData = {
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

  Mappings?: { [MapName: string]: unknown }

  Conditions?: { [LogicalId: string]: unknown }

  Transform?: string[]

  Resources?: {
    [LogicalID: string]: ResourceData
  }

  Outputs?: {
    [LogicalID: string]: {
      Description: string
      Value: unknown
      Export: {
        Name: string
      }
    }
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
    return this.data.Mappings
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

class Base64Type {
  constructor(private data: unknown) {}

  static readonly ShortName = "!Base64"
  static readonly FullName = "Fn::Base64"
}

class CidrType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!Cidr"
  static readonly FullName = "Fn::Cidr"
}

class FindInMapType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!FindInMap"
  static readonly FullName = "Fn::FindInMap"
}

class GetAttType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!GetAtt"
  static readonly FullName = "Fn::GetAtt"
}

class GetAZsType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!GetAZs"
  static readonly FullName = "Fn::GetAZs"
}

class ImportValueType {
  constructor(public readonly sharedValueToImport: string) {}

  static readonly ShortName = "!ImportValue"
  static readonly FullName = "Fn::ImportValue"
}

class JoinType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!Join"
  static readonly FullName = "Fn::Join"
}

class SelectType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!Select"
  static readonly FullName = "Fn::Select"
}

class SplitType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!Split"
  static readonly FullName = "Fn::Split"
}

class SubType {
  constructor(public readonly template: string) {}

  render(values: { [name: string]: string }): string {
    return this.template
  }

  static readonly ShortName = "!Sub"
  static readonly FullName = "Fn::Sub"
}

class RefType {
  constructor(private data: unknown) {}

  static readonly ShortName = "!Ref"
  static readonly FullName = "Ref"
}

const Base64YamlType = new yaml.Type(Base64Type.ShortName, {
  kind: "scalar",
  instanceOf: Base64Type,
  construct: data => new Base64Type(data),
})

const CidrYamlType = new yaml.Type(CidrType.ShortName, {
  kind: "scalar",
  instanceOf: CidrType,
  construct: data => new CidrType(data),
})

const FindInMapYamlType = new yaml.Type(FindInMapType.ShortName, {
  kind: "sequence",
  instanceOf: FindInMapType,
  construct: data => new FindInMapType(data),
})

const GetAttYamlType = new yaml.Type(GetAttType.ShortName, {
  kind: "scalar",
  instanceOf: GetAttType,
  construct: data => new GetAttType(data),
})

const GetAZsYamlType = new yaml.Type(GetAZsType.ShortName, {
  kind: "scalar",
  instanceOf: GetAZsType,
  construct: data => new GetAZsType(data),
})

const ImportValueYamlType = new yaml.Type(ImportValueType.ShortName, {
  kind: "scalar",
  instanceOf: ImportValueType,
  construct: data => new ImportValueType(data),
})

const JoinYamlType = new yaml.Type(JoinType.ShortName, {
  kind: "sequence",
  instanceOf: JoinType,
  construct: data => new JoinType(data),
})

const SelectYamlType = new yaml.Type(SelectType.ShortName, {
  kind: "sequence",
  instanceOf: SelectType,
  construct: data => new SelectType(data),
})

const SplitYamlType = new yaml.Type(RefType.ShortName, {
  kind: "sequence",
  instanceOf: SplitType,
  construct: data => new SplitType(data),
})

const SubYamlType = new yaml.Type(SubType.ShortName, {
  kind: "scalar",
  instanceOf: SubType,
  construct: data => new SubType(data),
})

const RefYamlType = new yaml.Type(RefType.ShortName, {
  kind: "scalar",
  instanceOf: RefType,
  construct: data => new RefType(data),
})

const Schema = yaml.Schema.create([
  Base64YamlType,
  CidrYamlType,
  FindInMapYamlType,
  GetAttYamlType,
  GetAZsYamlType,
  ImportValueYamlType,
  JoinYamlType,
  SelectYamlType,
  SplitYamlType,
  SubYamlType,
  RefYamlType,
])

export const ManifestParser = {
  parse(body: string): Manifest {
    const data = yaml.safeLoad(body, { schema: Schema }) as ManifestData
    return new Manifest(data)
  },
}
