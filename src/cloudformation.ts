import yaml from "js-yaml"

export type Manifest = {
  AWSTemplateFormatVersion: string

  Description: string

  Metadata: {
    [Key: string]: {
      Description: string
    }
  }

  Parameters: {
    [Key: string]: {
      Type: string
      Default: unknown
      Description: string
    }
  }

  Mappings: { [MapName: string]: unknown }

  Conditions: { [LogicalId: string]: unknown }

  Transform: string[]

  Resources: {
    [LogicalID: string]: {
      Type: string
      Properties: { [key: string]: unknown }
    }
  }

  Outputs: {
    [LogicalID: string]: {
      Description: string
      Value: unknown
      Export: {
        Name: string
      }
    }
  }
}

class Base64Type {
  constructor(private data: unknown) {}
}
class CidrType {
  constructor(private data: unknown) {}
}

class FindInMapType {
  constructor(private data: unknown) {}
}

class GetAttType {
  constructor(private data: unknown) {}
}

class GetAZsType {
  constructor(private data: unknown) {}
}

class ImportValueType {
  constructor(private data: unknown) {}
}

class JoinType {
  constructor(private data: unknown) {}
}

class SelectType {
  constructor(private data: unknown) {}
}

class SplitType {
  constructor(private data: unknown) {}
}

class SubType {
  constructor(private data: unknown) {}
}

class RefType {
  constructor(private data: unknown) {}
}

const Base64YamlType = new yaml.Type("!Base64", {
  kind: "scalar",
  instanceOf: Base64Type,
  construct: data => new Base64Type(data),
})

const CidrYamlType = new yaml.Type("!Cidr", {
  kind: "scalar",
  instanceOf: CidrType,
  construct: data => new CidrType(data),
})

const FindInMapYamlType = new yaml.Type("!FindInMap", {
  kind: "sequence",
  instanceOf: FindInMapType,
  construct: data => new FindInMapType(data),
})

const GetAttYamlType = new yaml.Type("!GetAtt", {
  kind: "scalar",
  instanceOf: GetAttType,
  construct: data => new GetAttType(data),
})

const GetAZsYamlType = new yaml.Type("!GetAZs", {
  kind: "scalar",
  instanceOf: GetAZsType,
  construct: data => new GetAZsType(data),
})

const ImportValueYamlType = new yaml.Type("!ImportValue", {
  kind: "scalar",
  instanceOf: ImportValueType,
  construct: data => new ImportValueType(data),
})

const JoinYamlType = new yaml.Type("!Join", {
  kind: "sequence",
  instanceOf: JoinType,
  construct: data => new JoinType(data),
})

const SelectYamlType = new yaml.Type("!Select", {
  kind: "sequence",
  instanceOf: SelectType,
  construct: data => new SelectType(data),
})

const SplitYamlType = new yaml.Type("!Ref", {
  kind: "sequence",
  instanceOf: SplitType,
  construct: data => new SplitType(data),
})

const SubYamlType = new yaml.Type("!Sub", {
  kind: "scalar",
  instanceOf: SubType,
  construct: data => new SubType(data),
})

const RefYamlType = new yaml.Type("!Ref", {
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
    return yaml.safeLoad(body, { schema: Schema }) as Manifest
  },
}
