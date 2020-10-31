import { parse } from "./yaml"

describe("parse", () => {
  describe.each([
    ["!Base64 AWS CloudFormation", { "Fn::Base64": "AWS CloudFormation" }],
    [
      '!Cidr [ "192.168.0.0/24", "6", "5"]',
      { "Fn::Cidr": ["192.168.0.0/24", "6", "5"] },
    ],
    [
      "!FindInMap [ RegionMap, us-east-1, HVM64 ]",
      { "Fn::FindInMap": ["RegionMap", "us-east-1", "HVM64"] },
    ],
    ["!GetAtt myELB.DNSName", { "Fn::GetAtt": ["myELB", "DNSName"] }],
    ["!GetAZs us-east-1", { "Fn::GetAZs": "us-east-1" }],
    ["!ImportValue Foo-SubnetID", { "Fn::ImportValue": "Foo-SubnetID" }],
    [`!Join [":", [ a, b, c ]]`, { "Fn::Join": [":", ["a", "b", "c"]] }],
    [
      `!Select [ "1", [ "apples", "grapes", "oranges", "mangoes" ] ]`,
      { "Fn::Select": ["1", ["apples", "grapes", "oranges", "mangoes"]] },
    ],
    [`!Split [ "|" , "a|b|c" ]`, { "Fn::Split": ["|", "a|b|c"] }],
    [
      "!Sub\n" +
        "  - www.${Domain}\n" +
        "  - { Domain: !Ref RootDomainName }\n",
      { "Fn::Sub": ["www.${Domain}", { Domain: { Ref: "RootDomainName" } }] },
    ],
    [
      '!Sub "arn:aws:ec2:${AWS::Region}:${AWS::AccountId}:vpc/${vpc}"',
      { "Fn::Sub": "arn:aws:ec2:${AWS::Region}:${AWS::AccountId}:vpc/${vpc}" },
    ],
    [
      `!Transform { Name: 'AWS::Include', Parameters: { Location: us-east-1 } }`,
      {
        "Fn::Transform": {
          Name: "AWS::Include",
          Parameters: { Location: "us-east-1" },
        },
      },
    ],
    ["!Ref MyEC2Instance", { Ref: "MyEC2Instance" }],
  ])(`parse("%s")`, (src, expected) => {
    it(`extract tag ${src.split(" ")[0]}`, () => {
      const o = parse(src)
      expect(o).toEqual(expected)
    })
  })
})
