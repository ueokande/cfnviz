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

describe("FnBase64", () => {
  describe("#new", () => {
    it("construct a FnBase64", () => {
      expect(new FnBase64("AWS").src).toEqual("AWS")
      expect(new FnBase64(new FnBase64("AWS")).src).toBeInstanceOf(FnBase64)
    })
  })
})

describe("FnCidr", () => {
  describe("#new", () => {
    it("construct a FnBase64", () => {
      const fn = new FnCidr(["192.168.0.0/24", "6", "5"])
      expect(fn.ipBlock).toEqual("192.168.0.0/24")
      expect(fn.count).toEqual("6")
      expect(fn.cidrBits).toEqual("5")
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnCidr([])).toThrowError()
      expect(() => new FnCidr([new FnBase64("AWS"), "2", "1"])).toThrowError()
    })
  })
})

describe("FnFindInMap", () => {
  describe("#new", () => {
    it("construct a FnFindInMap", () => {
      const fn = new FnFindInMap(["RegionMap", "us-east-1", "InstanceType"])
      expect(fn.mapName).toEqual("RegionMap")
      expect(fn.topLevelKey).toEqual("us-east-1")
      expect(fn.secondLevelKey).toEqual("InstanceType")
    })

    it("construct a nested FnFindInMap", () => {
      const fn = new FnFindInMap([
        "RegionMap",
        "us-east-1",
        new FnFindInMap(["M", "K1", "k2"]),
      ])
      expect(fn.mapName).toEqual("RegionMap")
      expect(fn.topLevelKey).toEqual("us-east-1")
      expect(fn.secondLevelKey).toBeInstanceOf(FnFindInMap)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnFindInMap([])).toThrowError()
      expect(
        () => new FnFindInMap([new FnBase64("AWS"), "K1", "K2"])
      ).toThrowError()
    })
  })
})

describe("FnGetAtt", () => {
  describe("#new", () => {
    it("construct a FnFindInMap", () => {
      const fn = new FnGetAtt(["User", "Arn"])
      expect(fn.resource).toEqual("User")
      expect(fn.attribute).toEqual("Arn")
    })

    it("construct a FnFindInMap with Ref", () => {
      const fn = new FnGetAtt(["User", new FnRef("AttrName")])
      expect(fn.resource).toEqual("User")
      expect(fn.attribute).toBeInstanceOf(FnRef)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnGetAtt([])).toThrowError()
      expect(() => new FnGetAtt(["User", new FnBase64("AWS")])).toThrowError()
    })
  })
})

describe("FnGetAZs", () => {
  describe("#new", () => {
    it("construct a FnGetAZs", () => {
      const fn = new FnGetAZs("us-east-1")
      expect(fn.region).toEqual("us-east-1")
    })

    it("construct a FnGetAZs with Ref", () => {
      const fn = new FnGetAZs(new FnRef("AWS::Region"))
      expect(fn.region).toBeInstanceOf(FnRef)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnGetAZs([])).toThrowError()
      expect(() => new FnGetAtt(new FnBase64("AWS"))).toThrowError()
    })
  })
})

describe("FnImportValue", () => {
  describe("#new", () => {
    it("construct a FnImportValue", () => {
      const fn = new FnImportValue("Network-SubnetID")
      expect(fn.name).toEqual("Network-SubnetID")
    })

    it("construct a FnImportValue with Sub", () => {
      const fn = new FnImportValue(new FnSub("${NetworkStackName}-SubnetID"))
      expect(fn.name).toBeInstanceOf(FnSub)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnImportValue(new FnGetAZs("us-east-1"))).toThrowError()
    })
  })
})

describe("FnJoin", () => {
  describe("#new", () => {
    it("construct a FnJoin", () => {
      const fn = new FnJoin([":", ["A", "B", "C"]])
      expect(fn.delimiter).toEqual(":")
      expect(fn.values).toEqual(["A", "B", "C"])
    })

    it("construct a FnJoin with functions", () => {
      const fn = new FnJoin([
        ":",
        [new FnRef("A"), new FnSub("B"), new FnBase64("C")],
      ])
      expect((fn.values as Array<unknown>)[0]).toBeInstanceOf(FnRef)
      expect((fn.values as Array<unknown>)[1]).toBeInstanceOf(FnSub)
      expect((fn.values as Array<unknown>)[2]).toBeInstanceOf(FnBase64)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnJoin([])).toThrowError()
      expect(
        () => new FnJoin([new FnRef("Delimiter"), ["A", "B", "C"]])
      ).toThrowError()
    })
  })
})

describe("FnSelect", () => {
  describe("#new", () => {
    it("construct a FnSelect", () => {
      const fn = new FnSelect(["1", ["apples", "grapes", "oranges", "mangoes"]])
      expect(fn.index).toEqual("1")
      expect(fn.values).toEqual(["apples", "grapes", "oranges", "mangoes"])
    })

    it("construct a FnSelect with functions", () => {
      const fn = new FnSelect([
        new FnRef("Index"),
        new FnRef("DbSubnetIpBlocks"),
      ])
      expect(fn.index).toBeInstanceOf(FnRef)
      expect(fn.values).toBeInstanceOf(FnRef)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnSelect([])).toThrowError()
      expect(
        () =>
          new FnSelect([new FnBase64("AWS"), ["apples", "grapes", "oranges"]])
      ).toThrowError()
    })
  })
})

describe("FnSplit", () => {
  describe("#new", () => {
    it("construct a FnSplit", () => {
      const fn = new FnSplit(["|", "a|b|c"])
      expect(fn.delimiter).toEqual("|")
      expect(fn.values).toEqual("a|b|c")
    })

    it("construct a FnSplit with a function", () => {
      const fn = new FnSplit([",", new FnRef("CommaSeparatedIPs")])
      expect(fn.delimiter).toEqual(",")
      expect(fn.values).toBeInstanceOf(FnRef)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnSplit([])).toThrowError()
      expect(() => new FnSplit([new FnBase64("AWS"), ""])).toThrowError()
    })
  })
})

describe("FnSub", () => {
  describe("#new", () => {
    it("construct a FnSub by a string", () => {
      const fn = new FnSub("${NetworkStackName}-SubnetID")
      expect(fn.template).toEqual("${NetworkStackName}-SubnetID")
      expect(fn.values).toEqual({})
    })

    it("construct a FnSub by named values", () => {
      const fn = new FnSub(["${StackName}-SubnetID", { StackName: "Network" }])
      expect(fn.template).toEqual("${StackName}-SubnetID")
      expect(fn.values).toEqual({ StackName: "Network" })
    })

    it("construct a FnSub by named values with functions", () => {
      const fn = new FnSub([
        "${StackName}-SubnetID-${Index}",
        {
          StackName: new FnRef("Network"),
          Index: new FnGetAtt(["MyResource", "Index"]),
        },
      ])
      expect(fn.template).toEqual("${StackName}-SubnetID-${Index}")
      expect(fn.values["StackName"]).toBeInstanceOf(FnRef)
      expect(fn.values["Index"]).toBeInstanceOf(FnGetAtt)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnSub(new FnBase64("AWS"))).toThrowError()
      expect(() => new FnSub([])).toThrowError()
      expect(() => new FnSub([new FnBase64("AWS"), {}])).toThrowError()
    })
  })
})

describe("FnTransform", () => {
  describe("#new", () => {
    it("construct a FnTransform", () => {
      const fn = new FnTransform({
        Name: "AWS::Include",
        Parameters: {
          Location: "location",
        },
      })
      expect(fn.name).toEqual("AWS::Include")
      expect(fn.parameters).toEqual({ Location: "location" })
    })

    it("construct a FnTransform with functions", () => {
      const fn = new FnTransform({
        Name: "AWS::Include",
        Parameters: {
          Location: new FnRef("MyLocation"),
        },
      })
      expect(fn.name).toEqual("AWS::Include")
      expect(fn.parameters["Location"]).toBeInstanceOf(FnRef)
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnTransform({})).toThrowError()
      expect(() => new FnTransform([])).toThrowError()
      expect(
        () =>
          new FnTransform({
            Name: new FnBase64("AWS"),
            Parameters: {},
          })
      ).toThrowError()
    })
  })
})

describe("FnRef", () => {
  describe("#new", () => {
    it("construct a FnRef", () => {
      const fn = new FnRef("InputValue")
      expect(fn.ref).toEqual("InputValue")
    })

    it("throws an error when invalid parameters", () => {
      expect(() => new FnRef(new FnBase64("AWS"))).toThrowError()
      expect(() => new FnRef([])).toThrowError()
    })
  })
})
