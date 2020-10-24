import aws from "aws-sdk"
import path from "path"
import { promises as fs } from "fs"

const cfn = new aws.CloudFormation()
const dataDir = path.join(__dirname, "../data/templates")

;(async () => {
  await fs.mkdir(path.join(dataDir), { recursive: true });

  const stacks = await cfn.listStacks().promise()
  if (!stacks.StackSummaries) {
    throw new Error("missing StackSummaries")
  }
  for (const stack of stacks.StackSummaries) {
    const template = await cfn.getTemplate({ StackName: stack.StackName }).promise()
    if (!template.TemplateBody) {
      throw new Error("missing TemplateBody")
    }

    const p = path.join(dataDir, `${stack.StackName}.json`)
    fs.writeFile(p, JSON.stringify({
      StackName: stack.StackName,
      StackId: stack.StackId,
      TemplateBody: template.TemplateBody
    }));
    console.log("%s => %s", stack.StackName, p)
  }
})()
