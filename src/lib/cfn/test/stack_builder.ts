import { Manifest, MappingData, ResourceData } from "../manifest"
import { Stack } from "../stack"

export class StackBuilder {
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
