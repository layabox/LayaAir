import { UniformOptions, UniformProperty } from "../../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType, ShaderDataItem } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ISubshaderData } from "../../RenderDriver/RenderModuleData/Design/ISubShaderData";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../layagl/LayaGL";
import { IShaderCompiledObj, ShaderCompile } from "../../webgl/utils/ShaderCompile";
import { ShaderPass } from "./ShaderPass";
import { VertexMesh } from "./VertexMesh";

// todo 初始化 uniformMap 提取出来 供 Scene, Camera, Sprite3D 生成 uniform shader代码 ?
// export type UniformItem = { [uniformName: string]: ShaderDataType } | { type: ShaderDataType, value?: ShaderDataItem };

export type UniformMeta = { type: ShaderDataType, format?: string, access?: 'readonly' | 'writeonly' | 'readwrite' };

export type UniformMapEntry = ShaderDataType | UniformMeta | { [uniformName: string]: ShaderDataType | UniformMeta };

export type UniformMapType = { [blockName: string]: UniformMapEntry };

export type AttributeMapType = { [name: string]: [number, ShaderDataType] };

/**
 * <code>SubShader</code> 类用于创建SubShader。
 */
export class SubShader {
    public static IncludeUniformMap: any = {};

    /**
     * 注册glsl所用到的Uniform
     * 会在生成Uniformmap的时候根据包含的Include文件，添加所需要的uniform因素
     * @param includeName 
     * @param uniformMap 
     * @param defaultValue 
     */
    public static regIncludeBindUnifrom(includeName: string, uniformMap: { [name: string]: ShaderDataType }, defaultValue: { [key: string]: any }) {
        let obj: any = {};
        let data: any = obj[includeName] = {};
        data["uniformMap"] = uniformMap;
        data["defaultValue"] = defaultValue;
        Object.assign(SubShader.IncludeUniformMap, obj);
    }

    public static readonly DefaultAttributeMap: { [name: string]: [number, ShaderDataType] } = {
        'a_Position': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4],
        'a_Normal': [VertexMesh.MESH_NORMAL0, ShaderDataType.Vector3],
        'a_Tangent0': [VertexMesh.MESH_TANGENT0, ShaderDataType.Vector4],
        'a_Texcoord0': [VertexMesh.MESH_TEXTURECOORDINATE0, ShaderDataType.Vector2],
        'a_Texcoord1': [VertexMesh.MESH_TEXTURECOORDINATE1, ShaderDataType.Vector2],
        'a_Color': [VertexMesh.MESH_COLOR0, ShaderDataType.Vector4],
        'a_BoneWeights': [VertexMesh.MESH_BLENDWEIGHT0, ShaderDataType.Vector4],
        'a_BoneIndices': [VertexMesh.MESH_BLENDINDICES0, ShaderDataType.Vector4],
        'a_WorldMat': [VertexMesh.MESH_WORLDMATRIX_ROW0, ShaderDataType.Matrix4x4],
        'a_SimpleTextureParams': [VertexMesh.MESH_SIMPLEANIMATOR, ShaderDataType.Vector4],
        'a_LightmapScaleOffset': [VertexMesh.MESH_LIGHTMAPSCALEOFFSET, ShaderDataType.Vector4],
        "a_WorldInvertFront": [VertexMesh.MESH_CUSTOME2, ShaderDataType.Vector4],
    }


    /**@internal */
    _attributeMap: AttributeMapType;

    // todo uniform 相关信息统一用结构体存储？ 合并 value type map
    /**
     * @internal
     * uniform 默认值
     */
    readonly _uniformDefaultValue: { [name: string]: ShaderDataItem };
    /**
     * @internal
     * uniform 数据类型
     */
    readonly _uniformMap: Map<number, UniformProperty>;

    _owner: Shader3D;
    /**@internal */
    _flags: any = {};

    moduleData: ISubshaderData;
    /**@internal */
    _passes: ShaderPass[] = [];

    /**
     * 创建一个 <code>SubShader</code> 实例。
     * @param attributeMap  顶点属性表。
     * @param uniformMap  uniform属性表。
     */
    constructor(attributeMap: { [name: string]: [number, ShaderDataType] } = SubShader.DefaultAttributeMap, uniformMap: UniformMapType = {}, uniformDefaultValue: { [name: string]: ShaderDataItem } = null) {
        this.moduleData = LayaGL.unitRenderModuleDataFactory.createSubShader();
        this._attributeMap = attributeMap;
        this._uniformDefaultValue = uniformDefaultValue;
        this._uniformMap = new Map();
        for (const key in uniformMap) {
            const entry = uniformMap[key];
            if (typeof entry == "object" && entry !== null) {
                if (isUniformMeta(entry)) {
                    let meta = entry as UniformMeta;
                    this.addUniform(key, meta.type, { format: meta.format, access: meta.access });
                    if (meta.type == ShaderDataType.Texture2D || meta.type == ShaderDataType.TextureCube || meta.type == ShaderDataType.Texture3D || meta.type == ShaderDataType.Texture2DArray) {
                        let textureGammaDefine = Shader3D.getDefineByName(`Gamma_${key}`);
                        let uniformIndex = Shader3D.propertyNameToID(key);
                        LayaGL.renderEngine.addTexGammaDefine(uniformIndex, textureGammaDefine);
                    }
                }
                else {
                    let block = entry as { [uniformName: string]: ShaderDataType | UniformMeta };
                    for (const uniformName in block) {
                        let item = block[uniformName];
                        if (typeof item == "object" && isUniformMeta(item)) {
                            let meta = item as UniformMeta;
                            this.addUniform(uniformName, meta.type, { format: meta.format, access: meta.access });
                        }
                        else {
                            this.addUniform(uniformName, item as ShaderDataType);
                        }
                    }
                }
            }
            else {
                let unifromType = entry as ShaderDataType;
                this.addUniform(key, unifromType);
                if (unifromType == ShaderDataType.Texture2D || unifromType == ShaderDataType.TextureCube || unifromType == ShaderDataType.Texture3D || unifromType == ShaderDataType.Texture2DArray) {
                    let textureGammaDefine = Shader3D.getDefineByName(`Gamma_${key}`);
                    let uniformIndex = Shader3D.propertyNameToID(key);
                    LayaGL.renderEngine.addTexGammaDefine(uniformIndex, textureGammaDefine);
                }

            }
        }
        this.moduleData.setUniformMap(this._uniformMap);
    }

    private addUniform(name: string, type: ShaderDataType, options?: UniformOptions) {
        let uniformName = name;
        let arrayLength = getArrayLength(name);

        if (arrayLength > 0) {
            uniformName = name.substring(0, name.lastIndexOf('['));
        }

        let uniform: UniformProperty = {
            id: Shader3D.propertyNameToID(uniformName),
            propertyName: uniformName,
            uniformtype: type,
            arrayLength: arrayLength,
            format: options?.format,
            access: options?.access
        };

        this._uniformMap.set(uniform.id, uniform);

        if (type == ShaderDataType.Texture2D || type == ShaderDataType.TextureCube || type == ShaderDataType.Texture3D || type == ShaderDataType.Texture2DArray) {
            let textureGammaDefine = Shader3D.getDefineByName(`Gamma_${name}`);
            LayaGL.renderEngine.addTexGammaDefine(uniform.id, textureGammaDefine);
        }
    }


    /**
     * 添加着色器Pass
     * @param vs 
     * @param ps
     * @param pipelineMode 渲染管线模式。 
     */
    addShaderPass(vs: string, ps: string, pipelineMode: string = "Forward"): ShaderPass {
        return this._addShaderPass(ShaderCompile.compile(vs, ps), pipelineMode);
    }

    _addShaderPass(compiledObj: IShaderCompiledObj, pipelineMode: string = "Forward"): ShaderPass {
        var shaderPass: ShaderPass = new ShaderPass(this, compiledObj);
        shaderPass.pipelineMode = pipelineMode;
        this._passes.push(shaderPass);
        this._addIncludeUniform(compiledObj.includeNames);
        this.moduleData.addShaderPass(shaderPass.moduleData);
        return shaderPass;
    }

    private _addIncludeUniform(includemap: Set<string>) {
        for (let ele of includemap) {
            if (SubShader.IncludeUniformMap[ele]) {
                let includeBindInfo = SubShader.IncludeUniformMap[ele];
                let bindtypeMap = includeBindInfo["uniformMap"];
                let bindDefaultValue = includeBindInfo["defaultValue"];
                for (var i in bindtypeMap) {
                    if (!this._uniformMap.has(Shader3D.propertyNameToID(i))) {
                        this.addUniform(i, bindtypeMap[i]);
                    }
                }
                for (var i in bindDefaultValue) {
                    if (!this._uniformDefaultValue[i]) {
                        this._uniformDefaultValue[i] = bindDefaultValue[i];
                    }
                }
            }
        }
    }

}

function getArrayLength(name: string): number {
    let endPos = name.lastIndexOf(']');
    let startPos = name.lastIndexOf('[');

    if (startPos != -1 && endPos == name.length - 1) {
        let arrayLengthStr = name.slice(startPos + 1, endPos);
        let arrayLength = parseInt(arrayLengthStr);

        if (!isNaN(arrayLength) && arrayLength > 0) {
            return arrayLength;
        }
    }
    return 0;
}

function isUniformMeta(o: any): boolean {
    if (o === null || typeof o !== "object" || typeof o.type !== "number")
        return false;
    for (const k in o) {
        if (k !== "type" && k !== "format" && k !== "access")
            return false;
    }
    return true;
}
