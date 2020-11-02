import aws from "aws-sdk"
import path from "path"
import { promises as fs } from "fs"

const cfn = new aws.CloudFormation()

const fetchStacks = async () => {
  const dataDir = path.join(__dirname, "../data/stacks")
  await fs.mkdir(path.join(dataDir), { recursive: true })

  const stacks = await cfn.describeStacks().promise()
  if (!stacks.Stacks) {
    throw new Error("missing StackSummaries")
  }
  for (const stack of stacks.Stacks) {
    const p = path.join(dataDir, `${stack.StackName}.json`)
    fs.writeFile(
      p,
      JSON.stringify({
        StackName: stack.StackName,
        StackId: stack.StackId,
        Parameters: stack.Parameters,
        Outputs: stack.Outputs,
      })
    )
    console.log("%s => %s", stack.StackName, p)
  }
}

const fetchStackTemplates = async () => {
  const dataDir = path.join(__dirname, "../data/templates")
  await fs.mkdir(path.join(dataDir), { recursive: true })

  const stacks = await cfn.listStacks().promise()
  if (!stacks.StackSummaries) {
    throw new Error("missing StackSummaries")
  }
  for (const stack of stacks.StackSummaries) {
    const template = await cfn
      .getTemplate({ StackName: stack.StackName })
      .promise()
    if (!template.TemplateBody) {
      throw new Error("missing TemplateBody")
    }

    const p = path.join(dataDir, `${stack.StackName}.json`)
    fs.writeFile(
      p,
      JSON.stringify({
        StackName: stack.StackName,
        StackId: stack.StackId,
        TemplateBody: template.TemplateBody,
      })
    )
    console.log("%s => %s", stack.StackName, p)
  }
}

const fetchExports = async () => {
  const dataDir = path.join(__dirname, "../data/exports")
  await fs.mkdir(path.join(dataDir), { recursive: true })

  const exports = await cfn.listExports().promise()
  if (!exports.Exports) {
    throw new Error("missing StackSummaries")
  }
  for (const exportValue of exports.Exports) {
    const p = path.join(dataDir, `${exportValue.Name}.json`)
    fs.writeFile(
      p,
      JSON.stringify({
        Name: exportValue.Name,
        ExportingStackId: exportValue.ExportingStackId,
        Value: exportValue.Value,
      })
    )
    console.log("%s => %s", exportValue.Name, p)
  }
}

const run = async () => {
  console.log("Fetching stacks...")
  await fetchStacks()

  console.log("\nFetching stack templates...")
  await fetchStackTemplates()

  console.log("\nFetching exports...")
  await fetchExports()
}

run()
