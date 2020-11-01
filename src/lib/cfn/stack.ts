import { Manifest } from "./manifest"

type Parameter = {
  ParameterKey: string
  ParameterValue: string
}

type PseudoParameters = {
  StackName: string
}

export class Stack {
  public readonly parameters: Parameter[]
  public readonly manifest: Manifest
  public readonly pseudoParameters: PseudoParameters

  constructor({
    parameters,
    manifest,
    pseudoParameters,
  }: {
    parameters: Parameter[]
    manifest: Manifest
    pseudoParameters: PseudoParameters
  }) {
    this.parameters = parameters
    this.manifest = manifest
    this.pseudoParameters = pseudoParameters
  }
}
