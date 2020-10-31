type Value = Fn | string | number | { [key: string]: Value } | Value[]

interface Fn {
  readonly FullName: string
}

const instanceOfFn = (a: unknown): a is Fn => {
  return (
    typeof a === "object" && a !== null && typeof (<Fn>a).FullName === "string"
  )
}

export class FnBase64 implements Fn {
  readonly FullName = "Fn::Base64"

  constructor(public readonly src: Value) {}
}

export class FnCidr implements Fn {
  readonly FullName = "Fn::Cidr"

  public readonly ipBlock: string | FnSelect | FnRef
  public readonly count: string | FnSelect | FnRef
  public readonly cidrBits: string | FnSelect | FnRef

  constructor(public readonly value: Value) {
    if (!(value instanceof Array) || value.length !== 3) {
      throw new Error(
        "Fn::Cidr requires three parameters in an array, the ip block, count, and cidr bits"
      )
    }
    const validType = (v: Value): v is string | FnRef | FnSelect => {
      return (
        typeof v === "string" || v instanceof FnRef || v instanceof FnSelect
      )
    }

    if (!validType(value[0]) || !validType(value[1]) || !validType(value[2])) {
      throw new Error("Fn::Cidr requires a string, Ref or Fn::Select")
    }
    this.ipBlock = value[0]
    this.count = value[1]
    this.cidrBits = value[2]
  }
}

export class FnFindInMap implements Fn {
  readonly FullName = "Fn::Cidr"

  public readonly mapName: string | FnFindInMap | FnRef
  public readonly topLevelKey: string | FnFindInMap | FnRef
  public readonly secondLevelKey: string | FnFindInMap | FnRef

  constructor(value: Value) {
    if (!(value instanceof Array) || value.length != 3) {
      throw new Error(
        "Fn::FindInMap requires three prameters in an array, the map name, map key and the attribute for return value"
      )
    }

    const validType = (v: Value): v is string | FnRef | FnFindInMap => {
      return (
        typeof v === "string" || v instanceof FnFindInMap || v instanceof FnRef
      )
    }

    if (!validType(value[0]) || !validType(value[1]) || !validType(value[2])) {
      throw new Error("Fn::FindInMap requires a string, Fn::FindInMap or Ref")
    }

    this.mapName = value[0]
    this.topLevelKey = value[1]
    this.secondLevelKey = value[2]
  }
}

export class FnGetAtt implements Fn {
  readonly FullName = "Fn::GetAtt"

  public readonly resource: string
  public readonly attribute: FnRef | string

  constructor(value: Value) {
    if (
      !(value instanceof Array) ||
      value.length !== 2 ||
      typeof value[0] !== "string" ||
      (typeof value[1] !== "string" && !(value[1] instanceof FnRef))
    ) {
      throw new Error(
        "Fn::GetAtt requires two non-empty parameters, the resource name and the resource attribute"
      )
    }

    this.resource = value[0]
    this.attribute = value[1]
  }
}

export class FnGetAZs implements Fn {
  readonly FullName = "Fn::GetAZs"
  public readonly region: string | FnRef

  constructor(region: Value) {
    if (typeof region !== "string" && !(region instanceof FnRef)) {
      throw new Error("Fn::GetAZs requires a string or Ref")
    }
    this.region = region
  }
}

export class FnImportValue implements Fn {
  readonly FullName = "Fn::ImportValue"

  readonly name:
    | string
    | FnBase64
    | FnFindInMap
    | FnJoin
    | FnSelect
    | FnSplit
    | FnSub
    | FnRef

  constructor(value: Value) {
    if (
      typeof value !== "string" &&
      !(value instanceof FnBase64) &&
      !(value instanceof FnFindInMap) &&
      !(value instanceof FnJoin) &&
      !(value instanceof FnSelect) &&
      !(value instanceof FnSplit) &&
      !(value instanceof FnSub) &&
      !(value instanceof FnRef)
    ) {
      throw new Error(
        "Fn::ImportValue requires a string, Fn::Base64, Fn::FindInMap, Fn::Join, Fn::Select, Fn::Split, Fn::Sub or Ref"
      )
    }
    this.name = value
  }
}

export class FnJoin implements Fn {
  readonly FullName = "Fn::Join"

  public readonly delimiter: string
  public readonly values: Value[]

  constructor(value: Value) {
    if (!(value instanceof Array) || value.length !== 2) {
      throw new Error("Fn::Join requires a delimiter and list of value")
    }
    if (typeof value[0] !== "string") {
      throw new Error("Fn::Join requires a string delimiter")
    }
    if (!(value[1] instanceof Array)) {
      throw new Error("Fn::Join requires a list of value")
    }

    this.delimiter = value[0]
    this.values = value[1]
  }
}

export class FnSelect implements Fn {
  readonly FullName = "Fn::Select"

  public readonly index: string | FnRef | FnFindInMap
  public readonly values: Value

  constructor(value: Value) {
    if (!(value instanceof Array) || value.length !== 2) {
      throw new Error("Fn::Select requires the index and the list of objects")
    }
    if (
      !(value[0] instanceof FnRef) &&
      !(value[0] instanceof FnFindInMap) &&
      typeof value[0] !== "string"
    ) {
      throw new Error(
        "Fn::Select index requires a string, Ref or Fn::FindInMap"
      )
    }
    if (typeof value[1] === "string" || typeof value[1] === "number") {
      throw new Error("Fn::Select values requires an array of objects")
    }

    this.index = value[0]
    this.values = value[1]
  }
}

export class FnSplit implements Fn {
  readonly FullName = "Fn::Split"

  public readonly delimiter: string
  public readonly values: Value

  constructor(value: Value) {
    if (!(value instanceof Array) || value.length !== 2) {
      throw new Error("Fn::Split requires the delimiter and list of values")
    }
    if (typeof value[0] !== "string") {
      throw new Error("Fn::Split delimiter requires a string")
    }
    this.delimiter = value[0]
    this.values = value[1]
  }
}

export class FnSub implements Fn {
  readonly FullName = "Fn::Sub"

  public readonly template: string
  public readonly values: { [name: string]: Value }

  constructor(value: Value) {
    if (typeof value === "string") {
      this.template = value
      this.values = {}
      return
    } else if (value instanceof Array && value.length === 2) {
      if (
        typeof value[0] === "string" &&
        typeof value[1] === "object" &&
        value[1] !== null &&
        !(value[1] instanceof Array) &&
        !instanceOfFn(value[1])
      ) {
        this.template = value[0]
        this.values = value[1]
        return
      }
    }

    throw new Error("Fn::Sub requires a string or string with key-values")
  }
}

export class FnTransform implements Fn {
  readonly FullName = "Fn::Transform"

  public readonly name: string
  public readonly parameters: { [key: string]: Value }

  constructor(value: Value) {
    const hasName = (o: Value): o is { Name: string } => {
      return (
        typeof o === "object" &&
        o !== null &&
        typeof (<{ Name: string }>o).Name === "string"
      )
    }
    const hasParameters = (
      o: Value
    ): o is { Parameters: { [name: string]: Value } } => {
      return (
        typeof o === "object" &&
        o !== null &&
        typeof (<{ Parameters: { [key: string]: Value } }>o).Parameters ===
          "object"
      )
    }

    if (!hasName(value)) {
      throw new Error("Fn::Transform requires a string 'Name' field")
    }
    if (!hasParameters(value)) {
      throw new Error("Fn::Transform requires a string 'Name' field")
    }
    this.name = value["Name"]
    this.parameters = value["Parameters"]
  }
}

export class FnRef implements Fn {
  readonly FullName = "Ref"

  public readonly ref: string

  constructor(value: Value) {
    if (typeof value !== "string") {
      throw new Error("Ref requires a string name")
    }
    this.ref = value
  }
}
