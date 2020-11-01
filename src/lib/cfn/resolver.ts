import {
  instanceOfFn,
  Fn,
  FnBase64,
  FnCidr,
  FnFindInMap,
  FnGetAtt,
  FnGetAZs,
  FnImportValue,
  FnJoin,
  FnSelect,
  FnSplit,
  FnSub,
  FnTransform,
  FnRef,
} from "./fn"
import { Stack } from "./stack"

const resolveValue = (stack: Stack, name: string): string => {
  if (name.startsWith("AWS::")) {
    if (name === "AWS::StackName") {
      return stack.pseudoParameters.StackName
    } else {
      throw new Error(`unable to resolve '${name}' of pseudo parameter`)
    }
  }
  const param = stack.parameters.find(param => param.ParameterKey === name)
  if (param !== undefined) {
    return param.ParameterValue
  }

  if (
    stack.manifest.Resources &&
    Object.keys(stack.manifest.Resources).includes(name)
  ) {
    throw new Error(`unable to resolve '${name}' of resource`)
  }
  throw new Error(`unable to resolve '${name}'`)
}

interface Resolver {
  resolve(stack: Stack): string | string[]
}

export class FnBase64Resolver implements Resolver {
  constructor(private readonly fn: FnBase64) {}

  resolve(stack: Stack): string | string[] {
    let src = this.fn.src
    if (instanceOfFn(src)) {
      src = new ResolverFactory().create(src).resolve(stack)
    }

    if (typeof src !== "string") {
      throw new Error("Fn::Base64 requires a string value")
    }
    return btoa(src)
  }
}

export class FnCidrResolver implements Resolver {
  constructor(private readonly fn: FnCidr) {}

  resolve(stack: Stack): string | string[] {
    const factory = new ResolverFactory()

    const ipBlock = instanceOfFn(this.fn.ipBlock)
      ? factory.create(this.fn.ipBlock).resolve(stack)
      : this.fn.ipBlock
    const count = instanceOfFn(this.fn.count)
      ? factory.create(this.fn.count).resolve(stack)
      : this.fn.count
    const cidrBits = instanceOfFn(this.fn.cidrBits)
      ? factory.create(this.fn.cidrBits).resolve(stack)
      : this.fn.cidrBits
    if (
      typeof ipBlock !== "string" ||
      typeof count !== "string" ||
      typeof cidrBits !== "string"
    ) {
      throw new Error("Fn::Cidr requires a string parameter")
    }
    return [ipBlock, count, cidrBits]
  }
}

export class FnFindInMapResolver implements Resolver {
  constructor(private readonly fn: FnFindInMap) {}

  resolve(stack: Stack): string | string[] {
    const factory = new ResolverFactory()

    const mapName = instanceOfFn(this.fn.mapName)
      ? factory.create(this.fn.mapName).resolve(stack)
      : this.fn.mapName
    const topLevelKey = instanceOfFn(this.fn.topLevelKey)
      ? factory.create(this.fn.topLevelKey).resolve(stack)
      : this.fn.topLevelKey
    const secondLevelKey = instanceOfFn(this.fn.secondLevelKey)
      ? factory.create(this.fn.secondLevelKey).resolve(stack)
      : this.fn.secondLevelKey

    if (
      typeof mapName !== "string" ||
      typeof topLevelKey !== "string" ||
      typeof secondLevelKey !== "string"
    ) {
      throw new Error("Fn::FindInMap requires a string parameter")
    }
    const value = stack.manifest.Mappings.get(
      mapName,
      topLevelKey,
      secondLevelKey
    )
    if (!value) {
      throw new Error(
        `Unable to get mapping for ${mapName}::${topLevelKey}::${secondLevelKey}`
      )
    }
    return value
  }
}

export class FnGetAttResolver implements Resolver {
  constructor(private readonly fn: FnGetAtt) {}

  resolve(stack: Stack): string | string[] {
    throw new Error("resolving Fn::GetAtt not supported")
  }
}

export class FnGetAZsResolver implements Resolver {
  constructor(private readonly fn: FnGetAZs) {}

  resolve(stack: Stack): string | string[] {
    throw new Error("resolving Fn::GetAZs not supported")
  }
}

export class FnImportValueResolver implements Resolver {
  constructor(private readonly fn: FnImportValue) {}

  resolve(stack: Stack): string | string[] {
    throw new Error("resolving Fn::ImportValue not supported")
  }
}

export class FnJoinResolver implements Resolver {
  constructor(private readonly fn: FnJoin) {}

  resolve(stack: Stack): string | string[] {
    const factory = new ResolverFactory()
    const values = instanceOfFn(this.fn.values)
      ? factory.create(this.fn.values).resolve(stack)
      : this.fn.values
    if (!(values instanceof Array)) {
      throw new Error("Fn::Join requires a list of luvaes")
    }
    const resolvedValues = values.map(v =>
      instanceOfFn(v) ? factory.create(v).resolve(stack) : v
    )
    return resolvedValues.join(this.fn.delimiter)
  }
}

export class FnSelectResolver implements Resolver {
  constructor(private readonly fn: FnSelect) {}

  resolve(stack: Stack): string | string[] {
    const factory = new ResolverFactory()
    const index = instanceOfFn(this.fn.index)
      ? +factory.create(this.fn.index).resolve(stack)
      : +this.fn.index
    const values = instanceOfFn(this.fn.values)
      ? factory.create(this.fn.values).resolve(stack)
      : this.fn.values
    if (isNaN(index)) {
      throw new Error("Fn::Select requires a numeric index")
    }
    if (!(values instanceof Array)) {
      throw new Error("Fn::Select requires a list of values")
    }
    if (index >= values.length) {
      throw new Error("index out of range on Fn::Select")
    }

    const value = values[index]
    return instanceOfFn(value)
      ? factory.create(value).resolve(stack)
      : String(value)
  }
}

export class FnSplitResolver implements Resolver {
  constructor(private readonly fn: FnSplit) {}

  resolve(stack: Stack): string | string[] {
    const factory = new ResolverFactory()
    const values = instanceOfFn(this.fn.values)
      ? factory.create(this.fn.values).resolve(stack)
      : this.fn.values
    if (typeof values !== "string") {
      throw new Error("Fn::Split requires list of values in a string")
    }
    return values.split(this.fn.delimiter)
  }
}

export class FnSubResolver implements Resolver {
  constructor(private readonly fn: FnSub) {}

  resolve(stack: Stack): string | string[] {
    const factory = new ResolverFactory()
    const values = Object.fromEntries(
      Object.entries(this.fn.values).map(([k, v]) => [
        k,
        instanceOfFn(v) ? factory.create(v).resolve(stack) : v,
      ])
    )

    let template = this.fn.template

    const valNames = (this.fn.template.match(/\${[a-zA-Z:]+\}/g) || []).map(v =>
      v.slice(0, v.length - 1).slice(2)
    )

    valNames.forEach(name => {
      const value = values[name] || resolveValue(stack, name)
      if (!value) {
        throw new Error(`Fn::Sub unable to resolve variable ${name}`)
      }
      if (typeof value !== "string") {
        throw new Error("Fn::Sub requires a string value")
      }
      template = template.replace("${" + name + "}", value)
    })
    return template
  }
}

export class FnTransformResolver implements Resolver {
  constructor(private readonly fn: FnTransform) {}

  resolve(stack: Stack): string | string[] {
    throw new Error("resolving Fn::FnTransform not supported")
  }
}

export class FnRefResolver implements Resolver {
  constructor(private readonly fn: FnRef) {}

  resolve(stack: Stack): string | string[] {
    return resolveValue(stack, this.fn.ref)
  }
}

export class ResolverFactory {
  create(fn: Fn): Resolver {
    if (fn instanceof FnBase64) {
      return new FnBase64Resolver(fn)
    } else if (fn instanceof FnCidr) {
      return new FnCidrResolver(fn)
    } else if (fn instanceof FnFindInMap) {
      return new FnFindInMapResolver(fn)
    } else if (fn instanceof FnGetAtt) {
      return new FnGetAttResolver(fn)
    } else if (fn instanceof FnGetAZs) {
      return new FnGetAZsResolver(fn)
    } else if (fn instanceof FnImportValue) {
      return new FnImportValueResolver(fn)
    } else if (fn instanceof FnJoin) {
      return new FnJoinResolver(fn)
    } else if (fn instanceof FnSelect) {
      return new FnSelectResolver(fn)
    } else if (fn instanceof FnSplit) {
      return new FnSplitResolver(fn)
    } else if (fn instanceof FnSub) {
      return new FnSubResolver(fn)
    } else if (fn instanceof FnTransform) {
      return new FnTransformResolver(fn)
    } else if (fn instanceof FnRef) {
      return new FnRefResolver(fn)
    }
    throw new Error("unsupported Fn type")
  }
}
