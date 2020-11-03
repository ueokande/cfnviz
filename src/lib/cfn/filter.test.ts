import { Manifest } from "./manifest"
import { FnRef, FnSub, FnGetAtt } from "./fn"
import Filter from "./filter"

describe("Filter", () => {
  describe("getDependLogicalIds", () => {
    it("refers other resource with a Ref", () => {
      const filter = new Filter(
        new Manifest({
          Resources: {
            MyUser: {
              Type: "AWS::IAM::User",
              Properties: {
                UserName: new FnRef("StackPrefix"),
              },
            },
          },
        })
      )

      expect(filter.getDependLogicalIds("MyUser")).toEqual(["StackPrefix"])
    })

    it("refers other resource with a Fn::Sub", () => {
      const filter = new Filter(
        new Manifest({
          Resources: {
            MyUser: {
              Type: "AWS::IAM::User",
              Properties: {
                UserName: new FnSub("${StackPrefix}-${Env}"),
              },
            },
          },
        })
      )

      expect(filter.getDependLogicalIds("MyUser")).toEqual([
        "StackPrefix",
        "Env",
      ])
    })

    it("does not refer local variable a Fn::Sub", () => {
      const filter = new Filter(
        new Manifest({
          Resources: {
            MyUser: {
              Type: "AWS::IAM::User",
              Properties: {
                UserName: new FnSub([
                  "${StackPrefix}-${Env}",
                  { Env: "Production" },
                ]),
              },
            },
          },
        })
      )

      expect(filter.getDependLogicalIds("MyUser")).toEqual(["StackPrefix"])
    })

    it("refers other resource with a Fn::GetAtt", () => {
      const filter = new Filter(
        new Manifest({
          Resources: {
            MyUser: {
              Type: "AWS::IAM::User",
              Properties: {
                Description: new FnGetAtt(["HogeResource", "Arn"]),
                UserName: "Hoge User",
              },
            },
          },
        })
      )

      expect(filter.getDependLogicalIds("MyUser")).toEqual(["HogeResource"])
    })

    it("refers other resource with nested Ref", () => {
      const filter = new Filter(
        new Manifest({
          Resources: {
            MyUser: {
              Type: "AWS::IAM::User",
              Properties: {
                Description: new FnGetAtt(["HogeResource", "Arn"]),
                UserName: "Hoge User",
              },
            },
          },
        })
      )

      expect(filter.getDependLogicalIds("MyUser")).toEqual(["HogeResource"])
    })

    it("refers other resource with nested functions", () => {
      const filter = new Filter(
        new Manifest({
          Resources: {
            MyUser: {
              Type: "AWS::IAM::User",
              Properties: {
                Description: new FnSub([
                  "${StackPrefix}-${GroupName}-${Provider}",
                  {
                    GroupName: new FnRef("GroupName"),
                    Provider: new FnGetAtt(["UserPool", "ProviderName"]),
                  },
                ]),
                UserName: "Hoge User",
              },
            },
          },
        })
      )

      expect(filter.getDependLogicalIds("MyUser")).toEqual([
        "StackPrefix",
        "GroupName",
        "UserPool",
      ])
    })
  })
})
