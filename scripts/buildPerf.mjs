import fs from "fs";
import path from "path";
import ts from "typescript";
import { glob } from "glob";

const perfList = [];
const pattern = path.join("./src/layaAir", "**/*.ts");

main();

async function main() {
    // 获取所有的ts文件, 并依次处理
    const files = await glob(pattern, { realpath: true, nosort: false });
    const fileList = files.map(file => {
        const code = fs.readFileSync(file, "utf-8");
        return ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
    });

    for (const sourceFile of fileList) {
        // 获取所有的类声明
        const classDecList = sourceFile.statements.filter(node => ts.isClassDeclaration(node));

        for (let i = 0; i < classDecList.length; i++) {
            const classDec = classDecList[i];
            // 获取类中的所有方法声明
            const methodDeclarations = getMethodDeclarations(classDec);

            for (let j = 0, len = methodDeclarations.length; j < len; j++) {
                const methodDec = methodDeclarations[j];

                // 获取方法上的perfTag标签
                const jsonTags = ts.getAllJSDocTags(methodDec, tag => tag.tagName.escapedText === "perfTag");
                if (!jsonTags || !jsonTags.length) continue;

                for (const jsonTag of jsonTags) {
                    const className = classDec.name.escapedText;
                    const methodName = methodDec.name.escapedText;
                    const perfContent = jsonTag.comment;

                    perfList.push({
                        clz: className, func: methodName, tag: perfContent
                    });
                }
            }
        }
    }

    // 保存到文件
    const perfJson = JSON.stringify(perfList);
    const perfDir = "./build/performanceTool";
    // 如果目录不存在则创建
    if (!fs.existsSync(perfDir)) {
        fs.mkdirSync(perfDir, { recursive: true });
    }
    fs.writeFileSync(path.join(perfDir, "statistic.json"), perfJson);
}

function getMethodDeclarations(classDeclaration) {
    const methodDeclarations = [];

    ts.forEachChild(classDeclaration, (node) => {
        if (ts.isMethodDeclaration(node)) {
            methodDeclarations.push(node);
        }
    });

    return methodDeclarations;
}
