import { Manifest, Fn, FieldValue, instanceOfFn } from "./manifest"
import {
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

const children = (fn: Fn): FieldValue[] => {
  if (fn instanceof FnBase64) {
    return [fn.src]
  } else if (fn instanceof FnCidr) {
    return [fn.ipBlock, fn.count, fn.cidrBits]
  } else if (fn instanceof FnFindInMap) {
    return [fn.mapName, fn.topLevelKey, fn.secondLevelKey]
  } else if (fn instanceof FnGetAtt) {
    return [fn.resource, fn.attribute]
  } else if (fn instanceof FnGetAZs) {
    return [fn.region]
  } else if (fn instanceof FnImportValue) {
    return [fn.name]
  } else if (fn instanceof FnJoin) {
    return [fn.delimiter, fn.values]
  } else if (fn instanceof FnJoin) {
    return [fn.delimiter, fn.values]
  } else if (fn instanceof FnSelect) {
    return [fn.index, fn.values]
  } else if (fn instanceof FnSplit) {
    return [fn.delimiter, fn.values]
  } else if (fn instanceof FnSub) {
    return [fn.template, fn.values]
  } else if (fn instanceof FnTransform) {
    return [fn.name, fn.parameters]
  } else if (fn instanceof FnRef) {
    return [fn.ref]
  }
  throw new Error("unexpected function: " + fn.FullName)
}

export default class Filter {
  constructor(private readonly manifest: Manifest) {}

  getDependLogicalIds(resourceName: string): string[] {
    const resource = (this.manifest.Resources ?? {})[resourceName]
    if (!this.manifest.Resources || !resource) {
      throw new Error(`resource '${resourceName}' not found`)
    }
    const refs: string[] = []
    this.walk(resource.Properties, value => {
      if (value instanceof FnRef) {
        refs.push(value.ref)
      } else if (value instanceof FnGetAtt) {
        refs.push(value.resource)
      } else if (value instanceof FnSub) {
        const valNames = (
          value.template.match(/\${[a-zA-Z:]+\}/g) || []
        ).map(v => v.slice(0, v.length - 1).slice(2))
        const localNames = Object.keys(value.values)
        valNames.filter(v => !localNames.includes(v)).forEach(v => refs.push(v))
      }
    })
    return refs
  }

  private walk(value: FieldValue, f: (value: FieldValue) => void) {
    f(value)

    if (instanceOfFn(value)) {
      for (const child of children(value)) {
        this.walk(child, f)
      }
    } else if (value instanceof Array) {
      for (const v of value) {
        this.walk(v, f)
      }
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        this.walk(v, f)
      }
    }
  }
}
