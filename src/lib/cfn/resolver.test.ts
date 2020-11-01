import {
  FnBase64Resolver,
  FnCidrResolver,
  FnFindInMapResolver,
  FnGetAttResolver,
  FnGetAZsResolver,
  FnImportValueResolver,
  FnJoinResolver,
  FnSelectResolver,
  FnSplitResolver,
  FnSubResolver,
  FnTransformResolver,
  FnRefResolver,
} from "./resolver"
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
import { Manifest, MappingData, ResourceData } from "./manifest"
import { Stack } from "./stack"

class StackBuilder {
  private static readonly EmptyStack = new Stack({
    parameters: [],
    manifest: new Manifest({}),
    pseudoParameters: { StackName: "" },
  })

  constructor(private readonly stack = StackBuilder.EmptyStack) {}

  withParameter(name: string, value: string): StackBuilder {
    const stack = new Stack({
      ...this.stack,
      parameters: this.stack.parameters?.concat([
        {
          ParameterKey: name,
          ParameterValue: value,
        },
      ]),
    })
    return new StackBuilder(stack)
  }

  withMappings(mappings: MappingData): StackBuilder {
    const stack = new Stack({
      ...this.stack,
      manifest: new Manifest({
        ...this.stack.manifest,
        Mappings: mappings,
      }),
    })
    return new StackBuilder(stack)
  }

  withStackName(name: string): StackBuilder {
    const stack = new Stack({
      ...this.stack,
      pseudoParameters: { StackName: name },
    })
    return new StackBuilder(stack)
  }

  withResource(name: string, r: ResourceData): StackBuilder {
    const stack = new Stack({
      ...this.stack,
      manifest: new Manifest({
        ...this.stack.manifest,
        Resources: {
          ...(this.stack.manifest.Resources || {}),
          [name]: r,
        },
      }),
    })
    return new StackBuilder(stack)
  }

  build(): Stack {
    return this.stack
  }
}

describe("FnBase64Resolver", () => {
  describe("resolve", () => {
    it("encode base64", () => {
      const stack = new StackBuilder().build()
      const fn = new FnBase64("AWS CloudFormation")
      const resolved = new FnBase64Resolver(fn).resolve(stack)

      expect(resolved).toEqual("QVdTIENsb3VkRm9ybWF0aW9u")
    })

    it("encode base64 with Ref", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .build()
      const fn = new FnBase64(new FnRef("Env"))
      const resolved = new FnBase64Resolver(fn).resolve(stack)

      expect(resolved).toEqual("UHJvZHVjdGlvbg==")
    })

    it("throws an error if not string source", () => {
      const fn = new FnBase64(["A"])
      const stack = new StackBuilder().build()
      expect(() => new FnBase64Resolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnCidrResolver", () => {
  describe("resolve", () => {
    it("construct CIDR", () => {
      const stack = new StackBuilder().build()
      const fn = new FnCidr(["192.168.0.0/24", "6", "5"])
      const resolved = new FnCidrResolver(fn).resolve(stack)

      expect(resolved).toEqual(["192.168.0.0/24", "6", "5"])
    })

    it("construct CIDR with Ref", () => {
      const stack = new StackBuilder()
        .withParameter("IpBlock", "192.168.0.0/24")
        .withParameter("Count", "6")
        .withParameter("CidrBits", "5")
        .build()
      const fn = new FnCidr([
        new FnRef("IpBlock"),
        new FnRef("Count"),
        new FnRef("CidrBits"),
      ])
      const resolved = new FnCidrResolver(fn).resolve(stack)

      expect(resolved).toEqual(["192.168.0.0/24", "6", "5"])
    })
  })
})

describe("FnFindInMapResolver", () => {
  describe("resolve", () => {
    const stack = new StackBuilder()
      .withMappings({
        InstanceTypeMapping: {
          Production: {
            "us-east-1": "m5.xlarge",
          },
        },
      })
      .withParameter("Env", "Production")
      .build()

    it("returns a value in the mapping", () => {
      const fn = new FnFindInMap([
        "InstanceTypeMapping",
        "Production",
        "us-east-1",
      ])
      const resolved = new FnFindInMapResolver(fn).resolve(stack)

      expect(resolved).toEqual("m5.xlarge")
    })

    it("returns a value in the mapping with Ref", () => {
      const fn = new FnFindInMap([
        "InstanceTypeMapping",
        new FnRef("Env"),
        "us-east-1",
      ])
      const resolved = new FnFindInMapResolver(fn).resolve(stack)

      expect(resolved).toEqual("m5.xlarge")
    })

    it("throws an error if a key is not definied", () => {
      const fn = new FnFindInMap([
        "InstanceTypeMapping",
        "Development",
        "us-east-1",
      ])
      expect(() => new FnFindInMapResolver(fn).resolve(stack)).toThrowError()
    })

    it("throws an error if a key is not definied", () => {
      const fn = new FnFindInMap([
        "InstanceTypeMapping",
        "Development",
        "us-east-1",
      ])
      expect(() => new FnFindInMapResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnGetAttResolver", () => {
  describe("resolve", () => {
    it("throws an error if Fn::GetAtt is resolved", () => {
      const stack = new StackBuilder().build()
      const fn = new FnGetAtt(["User", "Arn"])
      expect(() => new FnGetAttResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnGetAZsResolver", () => {
  describe("resolve", () => {
    it("throws an error if Fn::GetAtt is resolved", () => {
      const stack = new StackBuilder().build()
      const fn = new FnGetAZs("us-east-1")
      expect(() => new FnGetAZsResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnImportValueResolver", () => {
  describe("resolve", () => {
    it("throws an error if Fn::ImportValue is resolved", () => {
      const stack = new StackBuilder().build()
      const fn = new FnImportValue("us-east-1")
      expect(() => new FnImportValueResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnJoinResolver", () => {
  describe("resolve", () => {
    it("returns a joined value", () => {
      const stack = new StackBuilder().build()
      const fn = new FnJoin([",", ["apple", "banana", "cherry"]])
      const resolved = new FnJoinResolver(fn).resolve(stack)

      expect(resolved).toEqual("apple,banana,cherry")
    })

    it("returns a joined value with Ref", () => {
      const stack = new StackBuilder()
        .withParameter("Apple", "apple")
        .withParameter("Banana", "banana")
        .withParameter("Cherry", "cherry")
        .build()
      const fn = new FnJoin([
        ",",
        [new FnRef("Apple"), new FnRef("Banana"), new FnRef("Cherry")],
      ])
      const resolved = new FnJoinResolver(fn).resolve(stack)

      expect(resolved).toEqual("apple,banana,cherry")
    })

    it("returns a joined value with Fn::Cidr", () => {
      const stack = new StackBuilder().build()
      const fn = new FnJoin([",", new FnCidr(["192.168.0.0/24", "6", "5"])])
      const resolved = new FnJoinResolver(fn).resolve(stack)

      expect(resolved).toEqual("192.168.0.0/24,6,5")
    })

    it("throws an error if invalid values", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .build()
      const fn = new FnJoin([",", new FnRef("Env")])

      expect(() => new FnJoinResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnSelectResolver", () => {
  describe("resolve", () => {
    it("returns a value at the index", () => {
      const stack = new StackBuilder().build()
      const fn = new FnSelect(["1", ["apple", "banana", "cherry"]])
      const resolved = new FnSelectResolver(fn).resolve(stack)

      expect(resolved).toEqual("banana")
    })

    it("returns a value with Ref index and values", () => {
      const stack = new StackBuilder()
        .withParameter("Index", "2")
        .withParameter("Apple", "apple")
        .withParameter("Banana", "banana")
        .withParameter("Cherry", "cherry")
        .build()
      const fn = new FnSelect([
        new FnRef("Index"),
        [new FnRef("Apple"), new FnRef("Banana"), new FnRef("Cherry")],
      ])
      const resolved = new FnSelectResolver(fn).resolve(stack)

      expect(resolved).toEqual("cherry")
    })

    it("throws an error if invalid value type", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .build()
      const fn = new FnSelect(["3", new FnRef("Env")])

      expect(() => new FnSelectResolver(fn).resolve(stack)).toThrowError()
    })

    it("throws an error if index out of range", () => {
      const stack = new StackBuilder().build()
      const fn = new FnSelect(["3", ["apple", "banana", "cherry"]])

      expect(() => new FnSelectResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnSplitResolver", () => {
  describe("resolve", () => {
    it("splits a string with a delimiter", () => {
      const stack = new StackBuilder().build()
      const fn = new FnSplit([".", "192.168.1.1"])
      const resolved = new FnSplitResolver(fn).resolve(stack)

      expect(resolved).toEqual(["192", "168", "1", "1"])
    })

    it("splits a string with a Ref value", () => {
      const stack = new StackBuilder()
        .withParameter("UserIDs", "Alice,Bob,Carol")
        .build()
      const fn = new FnSplit([",", new FnRef("UserIDs")])
      const resolved = new FnSplitResolver(fn).resolve(stack)

      expect(resolved).toEqual(["Alice", "Bob", "Carol"])
    })

    it("throws an error if invalid value", () => {
      const stack = new StackBuilder().build()
      const fn = new FnSplit([",", ["invalid value"]])

      expect(() => new FnSplitResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnSubResolver", () => {
  describe("resolve", () => {
    it("fills placeholders in the template", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .withStackName("MyNetwork")
        .build()
      const fn = new FnSub("${Env}-${AWS::StackName}-NetworkID")
      const resolved = new FnSubResolver(fn).resolve(stack)

      expect(resolved).toEqual("Production-MyNetwork-NetworkID")
    })

    it("fills placeholders in the template with Ref", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .withStackName("MyNetwork")
        .build()
      const fn = new FnSub([
        "${Env}-${AWS::StackName}-NetworkID-${Version}",
        {
          Env: "Staging",
          Version: "v2",
        },
      ])
      const resolved = new FnSubResolver(fn).resolve(stack)

      expect(resolved).toEqual("Staging-MyNetwork-NetworkID-v2")
    })
  })
})

describe("FnTransformResolver", () => {
  describe("resolve", () => {
    it("throws an error if Fn::GetAtt is resolved", () => {
      const stack = new StackBuilder().build()
      const fn = new FnTransform({
        Name: "AWS::Include",
        Parameters: {
          Location: "my-location",
        },
      })
      expect(() => new FnTransformResolver(fn).resolve(stack)).toThrowError()
    })
  })
})

describe("FnRef", () => {
  describe("resolve", () => {
    it("returns resolved value", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .build()
      const fn = new FnRef("Env")
      const resolved = new FnRefResolver(fn).resolve(stack)

      expect(resolved).toEqual("Production")
    })

    it("throws an error if unable to resolve a ref", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .build()
      const fn = new FnRef("UserName")

      expect(() => new FnRefResolver(fn).resolve(stack)).toThrowError()
    })

    it("throws an error if try to resolve from a resource", () => {
      const stack = new StackBuilder()
        .withParameter("Env", "Production")
        .withResource("RobotUser", {
          Type: "AWS::IAM::User",
          Properties: {
            UserName: "RobotUser-1",
          },
        })
        .build()
      const fn = new FnRef("RobotUser")

      expect(() => new FnRefResolver(fn).resolve(stack)).toThrowError()
    })
  })
})
