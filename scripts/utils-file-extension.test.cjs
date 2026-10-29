const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = process.env.UTILS_SOURCE || path.resolve(__dirname, '../src/layaAir/laya/utils/Utils.ts');
const source = ts.createSourceFile('Utils.ts', fs.readFileSync(sourcePath, 'utf8'), ts.ScriptTarget.Latest, true);
const cls = source.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'Utils');
const methods = ['getFileExtension', 'replaceFileExtension'].map(name =>
    cls.members.find(node => node.name?.getText(source) === name).getText(source));
const exportsObject = {};
vm.runInNewContext(ts.transpileModule('export class Utils {' + methods.join('\n') + '}', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
}).outputText, { exports: exportsObject });

for (const [input, expected] of [
    ['../file', ''],
    ['../../file', ''],
    ['dir.v1/file', ''],
    ['/project.v1/assets/file', ''],
    ['..\\file', ''],
    ['C:\\project.v1\\assets\\file', ''],
    ['dir.v1\\nested/file', ''],
    ['https://cdn.example.com/assets/file', ''],
    ['dir.v1/', ''],
    ['file', ''],
    ['', ''],
    ['file.', ''],
    ['file.PNG', 'png'],
    ['file.tar.gz', 'gz'],
    ['dir.v1/file.PNG', 'png'],
    ['file.png?v=1.2', 'png'],
    ['file.png?next=/dir.v1/item.jpg', 'png'],
    ['../file?v=1.2', ''],
    ['file?next=/dir.v1/item.jpg', ''],
    ['file.png#part.v1', 'png'],
    ['file#part.v1?next=.png', ''],
    ['file.png?v=1.2#part.jpg', 'png'],
    ['file.lanit.ls', 'lanit.ls'],
    ['file.ltcb.ls', 'ltcb.ls'],
    ['file.LANIT.LS?v=1.2', 'lanit.ls'],
    ['file.LTCB.LS#part.v1', 'ltcb.ls'],
    ['dir.v1/file.lanit.ls?v=1.2', 'lanit.ls'],
    ['dir.v1\\file.ltcb.ls?v=1.2', 'ltcb.ls'],
    ['dir.lanit/file.ls', 'ls'],
    ['file.other.ls', 'ls'],
    ['file.ls', 'ls'],
]) {
    test(`getFileExtension(${JSON.stringify(input)})`, () => {
        assert.equal(exportsObject.Utils.getFileExtension(input), expected);
    });
}

for (const [input, extension, excludeDot, expected] of [
    ['../library/29/id@000000', 'json', false, '../library/29/id@000000.json'],
    ['../../frame', 'json', false, '../../frame.json'],
    ['folder.v1/frame', 'json', false, 'folder.v1/frame.json'],
    ['/project.v1/assets/frame', 'json', false, '/project.v1/assets/frame.json'],
    ['..\\library\\29\\id@000000', 'json', false, '..\\library\\29\\id@000000.json'],
    ['C:\\project.v1\\assets\\frame', 'json', false, 'C:\\project.v1\\assets\\frame.json'],
    ['folder.v1\\nested/frame', 'json', false, 'folder.v1\\nested/frame.json'],
    ['https://cdn.example.com/assets/frame', 'json', false, 'https://cdn.example.com/assets/frame.json'],
    ['frame.png', 'json', false, 'frame.json'],
    ['folder.v1/frame.png', 'json', false, 'folder.v1/frame.json'],
    ['frame.tar.gz', 'json', false, 'frame.tar.json'],
    ['frame.', 'json', false, 'frame.json'],
    ['frame', 'json', false, 'frame.json'],
    ['frame.png', '', false, 'frame'],
    ['../frame', '', false, '../frame'],
    ['frame.png', '$bar.png', true, 'frame$bar.png'],
    ['../frame', '$bar.png', true, '../frame$bar.png'],
    ['frame.png?v=1', 'json', false, 'frame.json?v=1'],
    ['frame.png?v=1.2', 'json', false, 'frame.json?v=1.2'],
    ['../frame?v=1.2', 'json', false, '../frame.json?v=1.2'],
    ['frame.png?next=/dir.v1/item.png', 'json', false, 'frame.json?next=/dir.v1/item.png'],
    ['frame?v=1.2#part.png', 'json', false, 'frame.json?v=1.2#part.png'],
    ['frame.png#part.v1', 'json', false, 'frame.json#part.v1'],
    ['frame#part.v1?next=.png', 'json', false, 'frame.json#part.v1?next=.png'],
    ['frame.png?v=1.2', '', false, 'frame?v=1.2'],
    ['frame.png?v=1.2', '$bar.png', true, 'frame$bar.png?v=1.2'],
    ['', 'json', false, ''],
    [null, 'json', false, null],
    [undefined, 'json', false, undefined],
]) {
    test(`replaceFileExtension(${JSON.stringify(input)}, ${JSON.stringify(extension)}, ${excludeDot})`, () => {
        assert.equal(exportsObject.Utils.replaceFileExtension(input, extension, excludeDot), expected);
    });
}
