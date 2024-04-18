import { IDefineDatas } from "../../RenderDriver/RenderModuleData/Design/IDefineDatas";
import { Shader3D } from "./Shader3D";
import { ShaderPass } from "./ShaderPass";
import { SubShader } from "./SubShader";

/**
 * 着色器变种。
 */
export class ShaderVariant {
    /** @internal */
    _shader: Shader3D;
    /** @internal */
    _subShaderIndex: number = 0;
    /** @internal */
    _passIndex: number = 0;
    /** @internal */
    _defineNames: string[];

    /**
     * 着色器。
     */
    public get shader(): Shader3D {
        return this._shader;
    }

    /**
     * 子着色器索引。
     */
    public get subShaderIndex(): number {
        return this._subShaderIndex;
    }

    /**
     * 通道索引。
     */
    public get passIndex(): number {
        return this._passIndex;
    }

    /**
     * 宏定义集合。
     */
    public get defineNames(): Readonly<string[]> {
        return this._defineNames;
    }

    /**
     * 创建着色器变种。
     * @param shader 着色器
     * @param subShaderIndex 子着色器索引 
     * @param passIndex 通道索引
     * @param defines 宏定义集合
     */
    constructor(shader: Shader3D, subShaderIndex: number, passIndex: number, defines: string[]) {
        this.setValue(shader, subShaderIndex, passIndex, defines);
    }

    /**
     * 给着色器变种赋值。
     * @param shader 着色器
     * @param subShaderIndex 子着色器索引 
     * @param passIndex 通道索引
     * @param defineNames 宏定义集合
     */
    setValue(shader: Shader3D, subShaderIndex: number, passIndex: number, defineNames: string[]): void {
        if (shader) {
            var subShader: SubShader = shader.getSubShaderAt(subShaderIndex);
            if (subShader) {
                var pass: ShaderPass = subShader._passes[passIndex];
                if (pass) {
                    var validDefine: IDefineDatas = pass._validDefine;
                    for (var i: number = 0, n: number = defineNames.length; i < n; i++) {
                        var defname: string = defineNames[i];
                        if (!validDefine.has(Shader3D.getDefineByName(defname)))
                            throw `ShaderVariantInfo:Invalid defineName ${defname} in ${shader._name} subShaderIndex of ${subShaderIndex} passIndex of ${passIndex}.`;
                    }
                }
                else {
                    throw `ShaderVariantInfo:Shader don't have passIndex of ${passIndex}.`;
                }
            }
            else {
                throw `ShaderVariantInfo:Shader don't have subShaderIndex of ${subShaderIndex}.`;
            }
        }
        else {
            throw `ShaderVariantInfo:Shader can't be null.`;
        }
        this._shader = shader;
        this._subShaderIndex = subShaderIndex;
        this._passIndex = passIndex;
        this._defineNames = defineNames;
    }

    /**
     * 是否相等。
     * @param other 其它着色器变种
     * @return 是否相等。
     */
    equal(other: ShaderVariant): boolean {
        if (this._shader !== other._shader || this._subShaderIndex !== other._subShaderIndex || this._passIndex !== other._passIndex)
            return false;

        var defines: string[] = this._defineNames;
        var otherDefines: string[] = other._defineNames;
        if (defines.length !== otherDefines.length)
            return false;
        for (var i: number = 0, n: number = this._defineNames.length; i < n; i++) {
            if (defines[i] !== otherDefines[i])
                return false;
        }
        return true;

    }


    /**
     * 克隆。
     * @return 着色器变种。 
     */
    clone(): ShaderVariant {
        var dest: ShaderVariant = new ShaderVariant(this._shader, this._subShaderIndex, this._passIndex, this._defineNames.slice());
        return dest;
    }
}

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