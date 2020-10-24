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
