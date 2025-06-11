import { Shader3D } from "./Shader3D";
import { ShaderPass } from "./ShaderPass";

export interface IShaderVariant {
    is2D: boolean; // 是否是2D着色器变种
    subShaderIndex: number;
    passIndex: number;
    defines: string[];
    nodeCommonMap: string[];
    additionMap: string[];
    attributeLocations: number[];
}

/**
 * 着色器变种集合。
 */
export class ShaderVariantCollection {
    static active: ShaderVariantCollection = new ShaderVariantCollection();

    private items: Record<string, IShaderVariant[]>;

    constructor(items?: Record<string, IShaderVariant[]>) {
        this.items = items || {};
    }

    add(shaderPass: ShaderPass, defines: ReadonlyArray<string>, is2D: boolean) {
        let shader = shaderPass._owner._owner;
        let subShaderIndex = shader._subShaders.indexOf(shaderPass._owner);
        let passIndex = shaderPass._owner._passes.indexOf(shaderPass);
        let nodeCommonMap = shaderPass.nodeCommonMap ? shaderPass.nodeCommonMap.slice().sort() : [];
        let additionMap = shaderPass.additionShaderData ? shaderPass.additionShaderData.slice().sort() : [];
        let attributeLocationSet = shaderPass.moduleData.attributeLocations;
        let attributeLocations = attributeLocationSet ? Array.from(attributeLocationSet) : [];
        // if (!nodeCommonMap) return; //兼容WGSL

        let configDefs: string[] = [];

        defines = defines.slice().filter((v) => {
            let configDef = Shader3D._configDefineValues.has(Shader3D.getDefineByName(v));

            if (v == "GRAPHICS_API_GLES3") {
                configDef = true;
            }

            if (configDef) {
                configDefs.push(v);
            }
            return !configDef; // 只保留非配置宏定义
        }).sort();

        let col = this.items[shader._name];
        if (!col) {
            col = [];
            this.items[shader._name] = col;
        }

        // Check if the variant already exists in the collection
        if (col.some(v => {
            return (
                v.is2D === is2D &&
                v.subShaderIndex === subShaderIndex &&
                v.passIndex === passIndex &&
                v.defines.length === defines.length &&
                v.defines.every((name, index) => name === defines[index]) &&
                v.nodeCommonMap.length === nodeCommonMap.length &&
                v.nodeCommonMap.every((name, index) => name === nodeCommonMap[index]) &&
                v.additionMap.length === additionMap.length &&
                v.additionMap.every((name, index) => name === additionMap[index]) &&
                v.attributeLocations.length === attributeLocations.length &&
                v.attributeLocations.every((location, index) => location === attributeLocations[index])
            );
        }))
            return;

        // If the variant does not exist, add it to the collection
        col.push({
            is2D: is2D,
            subShaderIndex: subShaderIndex,
            passIndex: passIndex,
            defines: <any>defines,
            nodeCommonMap: nodeCommonMap,
            additionMap: additionMap,
            attributeLocations: attributeLocations
        });

        console.debug(`Shader variant: ${shader._name}/${subShaderIndex}/${passIndex}/${defines.join(",")}/${nodeCommonMap ? nodeCommonMap.join(",") : ""}/${additionMap ? additionMap.join(",") : ""}_${configDefs.join(",")}`);
    }

    compileAll() {
        let items = this.items;
        for (let shaderName in items) {
            let variants = items[shaderName];
            for (let variant of variants) {
                let suc = Shader3D.compileShaderByDefineNames(shaderName, variant.subShaderIndex, variant.passIndex, variant.defines, variant.nodeCommonMap, variant.additionMap, variant.is2D, variant.attributeLocations);

                let msg = `${shaderName}/${variant.subShaderIndex}/${variant.passIndex}/${variant.defines.join(",")}/${variant.nodeCommonMap ? variant.nodeCommonMap.join(",") : ""}/${variant.additionMap ? variant.additionMap.join(",") : ""}`;

                if (suc)
                    console.debug("Warm up", msg);
                else
                    console.warn("Warm up failed!", msg);
            }
        }
    }

    destroy() {
        this.items = {};
    }

}
