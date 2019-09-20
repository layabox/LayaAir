import { DefineDatas } from "./DefineDatas";
import { Shader3D } from "./Shader3D";
import { ShaderPass } from "./ShaderPass";
import { SubShader } from "./SubShader";

/**
 * 着色器变种。
 */
export class ShaderVariantInformation {
    /** @internal */
    _shader: Shader3D;
    /** @internal */
    _subShaderIndex: number = 0;
    /** @internal */
    _passIndex: number = 0;
    /** @internal */
    _defines: string[];

    /**
     * 创建着色器变种。
     * @param shader 着色器
     * @param subShaderIndex 子着色器索引 
     * @param passIndex 通道索引
     * @param defines 宏定义集合
     */
    constructor(shader: Shader3D, subShaderIndex: number, passIndex: number, defines: string[]) {
        if (shader) {
            var subShader: SubShader = shader.getSubShaderAt(subShaderIndex);
            if (subShader) {
                var pass: ShaderPass = subShader._passes[passIndex];
                if (pass) {
                    var validDefine: DefineDatas = pass._validDefine;
                    for (var i: number = 0, n: number = defines.length; i < n; i++) {
                        var defname: string = defines[i];
                        if (!validDefine.has(Shader3D.getDefineByName(defname)))
                            throw "ShaderVariant:invalid defineName: " + defname + " in shaderPass. ";
                    }
                }
                else {
                    throw "ShaderVariant:shader don't have passIndex of " + passIndex + " .";
                }
            }
            else {
                throw "ShaderVariant:shader don't have subShaderIndex of " + subShaderIndex + " .";
            }
        }
        else {
            throw "ShaderVariant:shader can't be null.";
        }
        this._shader = shader;
        this._subShaderIndex = subShaderIndex;
        this._passIndex = passIndex;
        this._defines = defines;
    }

    /**
     * 是否相等。
     * @param other 其它着色器变种
     * @return 是否相等。
     */
    equal(other: ShaderVariantInformation): boolean {
        if (this._shader !== other._shader || this._subShaderIndex !== other._subShaderIndex || this._passIndex !== other._passIndex) {
            return false;
        }
        else {
            var defines: string[] = this._defines;
            var otherDefines: string[] = other._defines;
            for (var i: number = 0, n: number = this._defines.length; i < n; i++) {
                if (defines[i] !== otherDefines[i])
                    return false;
            }
            return true;
        }
    }

    /**
     * 克隆。
     * @return 着色器变种。 
     */
    clone(): ShaderVariantInformation {
        var dest: ShaderVariantInformation = new ShaderVariantInformation(this._shader, this._subShaderIndex, this._passIndex, this._defines.slice());
        return dest;
    }
}

/**
 * 着色器变种集合。
 */
export class ShaderVariantInformationCollection {
    /** @internal */
    private _allCompiled: boolean = false;
    /** @internal */
    private _variants: ShaderVariantInformation[] = [];

    /**
     * 是否已经全部编译。
     */
    get allCompiled(): boolean {
        return this._allCompiled;
    }

    /**
     * 包含的变种数量。
     */
    get variantCount(): number {
        return this._variants.length;
    }

    /**
     * 添加着色器变种。
     * @param variant 着色器变种。
     * @param 是否添加成功。
     */
    add(variant: ShaderVariantInformation): boolean {
        for (var i: number = 0, n: number = this._variants.length; i < n; i++) {
            if (this._variants[i].equal(variant))
                return false;
        }
        this._variants.push(variant);
        this._allCompiled = false;
        return true;
    }

    /**
     * 移除着色器变种。
     * @param variant 着色器变种。
     * @return 是否移除成功。
     */
    remove(variant: ShaderVariantInformation): boolean {
        for (var i: number = 0, n: number = this._variants.length; i < n; i++) {
            if (this._variants[i].equal(variant)) {
                this._variants.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * 是否包含着色器变种。
     * @param variant 着色器变种。
     */
    contatins(variant: ShaderVariantInformation): boolean {
        for (var i: number = 0, n: number = this._variants.length; i < n; i++) {
            if (this._variants[i].equal(variant))
                return true;
        }
        return false;
    }

    /**
     * 清空。
     */
    clear(): void {
        this._variants.length = 0;
    }

    /**
     * 执行编译。
     */
    compile(): void {
        if (!this._allCompiled) {
            var variants: ShaderVariantInformation[] = this._variants;
            for (var i: number = 0, n: number = variants.length; i < n; i++) {
                var variant: ShaderVariantInformation = variants[i];
                Shader3D.compileShaderByDefineNames(variant._shader._name, variant._subShaderIndex, variant._passIndex, variant._defines);
            }
            this._allCompiled = true;
        }
    }
}