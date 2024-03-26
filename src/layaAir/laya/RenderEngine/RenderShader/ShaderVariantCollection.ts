import { Shader3D } from "./Shader3D";
import { ShaderPass } from "./ShaderPass";

/**
 * 着色器变种。
 */
export interface IShaderVariant {
    subShaderIndex: number;
    passIndex: number;
    defines: string[];
    nodeCommonMap: string[];
}

/**
 * 着色器变种集合。
 */
export class ShaderVariantCollection {
    static active: ShaderVariantCollection = new ShaderVariantCollection();

    items: Record<string, IShaderVariant[]>;

    constructor(items?: Record<string, IShaderVariant[]>) {
        this.items = items || {};
    }

    add(shaderPass: ShaderPass, defines: ReadonlyArray<string>) {
        let shader = shaderPass._owner._owner;
        let subShaderIndex = shader._subShaders.indexOf(shaderPass._owner);
        let passIndex = shaderPass._owner._passes.indexOf(shaderPass);
        let nodeCommonMap = shaderPass.nodeCommonMap;
        defines = defines.filter((v) => !Shader3D._configDefineValues.has(Shader3D.getDefineByName(v)));

        let col = this.items[shader._name];
        if (!col) {
            col = [];
            this.items[shader._name] = col;
        }

        // Check if the variant already exists in the collection
        if (col.some(v => {
            return (
                v.subShaderIndex === subShaderIndex &&
                v.passIndex === passIndex &&
                v.defines.length === defines.length &&
                v.defines.every((name, index) => name === defines[index]) &&
                v.nodeCommonMap.length === nodeCommonMap.length &&
                v.nodeCommonMap.every((name, index) => name === nodeCommonMap[index])
            );
        }))
            return;

        // If the variant does not exist, add it to the collection
        col.push({
            subShaderIndex: subShaderIndex,
            passIndex: passIndex,
            defines: <any>defines,
            nodeCommonMap: nodeCommonMap
        });

        console.debug(`Shader variant: ${shader._name}/${subShaderIndex}/${passIndex}/${defines.join(",")}/${nodeCommonMap ? nodeCommonMap.join(",") : ""}`);
    }

    compileAll() {
        let items = this.items;
        for (let shaderName in items) {
            let variants = items[shaderName];
            for (let variant of variants) {
                let suc = Shader3D.compileShaderByDefineNames(shaderName, variant.subShaderIndex, variant.passIndex, variant.defines, variant.nodeCommonMap);
                let msg = `${shaderName}/${variant.subShaderIndex}/${variant.passIndex}/${variant.defines.join(",")}/${variant.nodeCommonMap ? variant.nodeCommonMap.join(",") : ""}`;
                if (suc)
                    console.debug("Warm up", msg);
                else
                    console.warn("Warm up failed!", msg);
            }
        }
    }
}