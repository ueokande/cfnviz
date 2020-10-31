import yaml from "js-yaml"

type FnName =
  | "Fn::Base64"
  | "Fn::Cidr"
  | "Fn::FindInMap"
  | "Fn::GetAtt"
  | "Fn::GetAZs"
  | "Fn::ImportValue"
  | "Fn::Join"
  | "Fn::Select"
  | "Fn::Split"
  | "Fn::Sub"
  | "Fn::Transform"
  | "Ref"

interface Fn {
  fullFn(): { [name in FnName]?: unknown }
}

const isInstanceOfFn = (a: unknown): a is Fn => {
  return (
    typeof a === "object" && a !== null && typeof (<Fn>a).fullFn === "function"
  )
}

export class Base64Type implements Fn {
  constructor(public readonly valueToEncode: string) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::Base64": this.valueToEncode }
  }
}

export class CidrType implements Fn {
  constructor(private readonly data: unknown) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::Cidr": this.data }
  }
}

export class FindInMapType implements Fn {
  constructor(private readonly data: unknown) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::FindInMap": this.data }
  }
}

export class GetAttType implements Fn {
  private readonly resource: string
  private readonly attr: string

  constructor(private readonly name: string) {
    const [resource, attr] = name.split(".")
    if (!attr) {
      throw new Error("Invalid reference of !GetAtt")
    }
    this.resource = resource
    this.attr = attr
  }

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::GetAtt": [this.resource, this.attr] }
  }
}

export class GetAZsType implements Fn {
  constructor(private readonly region: string) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::GetAZs": this.region }
  }
}

export class ImportValueType implements Fn {
  constructor(private readonly sharedValueToImport: string) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::ImportValue": this.sharedValueToImport }
  }
}

export class JoinType implements Fn {
  constructor(private readonly data: unknown[]) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::Join": this.data }
  }
}

export class SelectType implements Fn {
  constructor(private readonly data: unknown[]) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::Select": this.data }
  }
}

export class SplitType implements Fn {
  constructor(private data: unknown[]) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::Split": this.data }
  }
}

export class SubType implements Fn {
  constructor(private readonly data: unknown) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::Sub": this.data }
  }
}

export class TransformType implements Fn {
  constructor(private readonly data: unknown) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { "Fn::Transform": this.data }
  }
}

export class RefType implements Fn {
  constructor(private data: unknown) {}

  fullFn(): { [name in FnName]?: unknown } {
    return { Ref: this.data }
  }
}

const Base64YamlType = new yaml.Type("!Base64", {
  kind: "scalar",
  instanceOf: Base64Type,
  construct: data => new Base64Type(data),
})

const CidrYamlType = new yaml.Type("!Cidr", {
  kind: "sequence",
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

const SplitYamlType = new yaml.Type("!Split", {
  kind: "sequence",
  instanceOf: SplitType,
  construct: data => new SplitType(data),
})

const SubYamlSequenceType = new yaml.Type("!Sub", {
  kind: "sequence",
  instanceOf: SubType,
  construct: data => new SubType(data),
})

const SubYamlScalarType = new yaml.Type("!Sub", {
  kind: "scalar",
  instanceOf: SubType,
  construct: data => new SubType(data),
})

const TransformYamlType = new yaml.Type("!Transform", {
  kind: "mapping",
  instanceOf: TransformType,
  construct: data => new TransformType(data),
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
  SubYamlSequenceType,
  SubYamlScalarType,
  TransformYamlType,
  RefYamlType,
])

export const parse = (body: string): unknown => {
  const src = yaml.safeLoad(body, { schema: Schema })

  const parseRecursive = (current: unknown): unknown => {
    if (typeof current !== "object" || current === null) {
      return current
    }
    if (current instanceof Array) {
      return current.map(o => parseRecursive(o))
    }

    if (isInstanceOfFn(current)) {
      const o = current.fullFn()
      return parseRecursive(o)
    }

    const o: { [key: string]: unknown } = {}
    for (const [key, value] of Object.entries(current)) {
      o[key] = parseRecursive(value)
    }
    return o
  }

  return parseRecursive(src)
}
