import { Config3D } from "../../../../Config3D";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { UniformMapType } from "../../../RenderEngine/RenderShader/SubShader";
import { SkinnedMeshSprite3D } from "../../../d3/core/SkinnedMeshSprite3D";
import { Graphics } from "../../../display/Graphics";
import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderNode } from "../../../webgl/utils/ShaderNode";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { TypeOutData } from "../ShaderCompile/WebGPUShaderCompileCode";
import { WebGPUShaderCompileDef } from "../ShaderCompile/WebGPUShaderCompileDef";
import { WebGPUShaderCompileUtil } from "../ShaderCompile/WebGPUShaderCompileUtil";
import { WebGPU_GLSLProcess } from "./GLSLProcess/WebGPU_GLSLProcess";
import { NagaWASM } from "./Naga/NagaWASM";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { NameAndType, NameBooleanMap, NameNumberMap, NameStringMap, roundUp } from "./WebGPUCommon";
import { WebGPUShaderData } from "./WebGPUShaderData";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { WebGPUUniformBlockInfo } from "./WebGPUUniform/WebGPUUniformBlockInfo";

/**
 * attribute列表
 */
type WebGPUAttributeMapType = {
    [key: string]: [ //主键，attribute名称
        number, //attribute位置绑定
        ShaderDataType, //attribute类型
    ]
};

/**
 * uniform列表
 */
export type WebGPUUniformMapType = {
    [key: string]: { //主键，uniform纯名称（不带数组表示）
        name: string; //uniform名称（带数组表示）
        type: ShaderDataType; //uniform类型
        shadow?: boolean; //是否阴影贴图类型
    }
};

/**
 * 绑定类型（uniformBlock，texture或sampler）
 */
export enum WebGPUBindingInfoType {
    buffer, //uniformBlock
    texture, //texture
    sampler, //sampler
};

/**
 * uniform详细内容（可能是uniformBlock，texture或sampler）
 */
export interface WebGPUUniformPropertyBindingInfo {
    id: number; //唯一编码
    set: number; //分组编号
    binding: number; //绑定编号
    name: string; //名称
    propertyId: number; //uniform内容的id
    visibility: GPUShaderStageFlags; //GPU中的可见性
    type: WebGPUBindingInfoType; //绑定类型
    uniform?: WebGPUUniformBlockInfo; //uniform详细内容
    buffer?: GPUBufferBindingLayout;
    texture?: GPUTextureBindingLayout;
    sampler?: GPUSamplerBindingLayout;
};

/**
 * WGSL代码转译
 */
export class WebGPUCodeGenerator {
    static naga: NagaWASM;
    static inited: boolean = false; //是否已经初始化
    static forNaga: boolean = true; //生成的GLSL4.5代码是否需要符合naga转译的要求

    /**
     * 初始化nageWASM库
     * @param next 
     */
    static async init(next?: Function) {
        if (this.inited) {
            if (next) next();
            return;
        }

        this.naga = new NagaWASM();
        await this.naga.init();
        this.inited = true;
        console.log("naga inited");
        if (next) next();

        Graphics.add2DGlobalUniformData(Shader3D.propertyNameToID('u_GraphicDummy'), 'u_GraphicDummy', ShaderDataType.Vector4);
        WebGPUShaderData.__init__();
    }

    /**
     * 生成attribute字符串
     * @param attributeMap 
     */
    private static _attributeString(attributeMap: WebGPUAttributeMapType) {
        let res = '';
        for (const key in attributeMap) {
            let location = attributeMap[key][0];
            const type = this._getAttributeT2S(attributeMap[key][1]);
            if (type === 'mat3') { //mat3分解成3个vec3
                res = `${res}layout(location = ${location++}) in vec3 ${key}_0;\n`;
                res = `${res}layout(location = ${location++}) in vec3 ${key}_1;\n`;
                res = `${res}layout(location = ${location++}) in vec3 ${key}_2;\n`;
            } else if (type === 'mat4') { //mat4分解成4个vec4
                res = `${res}layout(location = ${location++}) in vec4 ${key}_0;\n`;
                res = `${res}layout(location = ${location++}) in vec4 ${key}_1;\n`;
                res = `${res}layout(location = ${location++}) in vec4 ${key}_2;\n`;
                res = `${res}layout(location = ${location++}) in vec4 ${key}_3;\n`;
            } else res = `${res}layout(location = ${location}) in ${type} ${key};\n`;
        }
        return res;
    }

    /**
     * 生成varying字符串
     * @param varyingMap 
     * @param io 'in' or 'out'
     */
    private static _varyingString(varyingMap: NameStringMap, io: string = 'out') {
        let res = '';
        let count = 0;
        for (const key in varyingMap) {
            const type = varyingMap[key];
            res = `${res}layout(location = ${count++}) ${io} ${type} ${key};\n`;
        }
        return res;
    }

    /**
     * 生成uniform字符串
     * @param uniformMap 
     * @param arrayMap 数组uniform映射表（表示哪些uniform是数组，长度是多少）
     * @param nodeCommonMap 
     */
    private static _uniformString2D(uniformMap: WebGPUUniformMapType, arrayMap: NameNumberMap, nodeCommonMap: string[]) {
        const globalUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap;
        const cameraUniformMap = globalUniformMap("BaseCamera") as WebGPUCommandUniformMap;
        const scene2DUniformMap = globalUniformMap("Sprite2DGlobal") as WebGPUCommandUniformMap;
        const sprite2DUniformMap = globalUniformMap("Sprite2D") as WebGPUCommandUniformMap;
        const scene2DUniforms: NameAndType[] = [];
        const sprite2DUniforms: NameAndType[] = [];
        const materialUniforms: NameAndType[] = [];
        const textureUniforms: NameAndType[] = [];

        const sprite2DUniformMaps: WebGPUCommandUniformMap[] = [];
        if (nodeCommonMap)
            for (let i = 0; i < nodeCommonMap.length; i++)
                if (nodeCommonMap[i] !== 'Sprite2D')
                sprite2DUniformMaps.push(globalUniformMap(nodeCommonMap[i]) as WebGPUCommandUniformMap);

        const uniformInfo: WebGPUUniformPropertyBindingInfo[] = [];

        const _have = (group: NameAndType[], name: string) => {
            for (let i = group.length - 1; i > -1; i--)
                if (group[i].name === name)
                    return true;
            return false;
        }

        const regex = /\[(.*?)\]/g;
        const _catalog = (key: string, name: string, type: string) => {
            const id = Shader3D.propertyNameToID(key.replace(regex, '_')); //.更换成_（变量名中不能包含'.'）
            if (scene2DUniformMap.hasPtrID(id)) {
                if (!_have(scene2DUniforms, name))
                    scene2DUniforms.push({ name, type, set: 0 });
            }
            else if (sprite2DUniformMap.hasPtrID(id)) {
                if (!_have(sprite2DUniforms, name))
                    sprite2DUniforms.push({ name, type, set: 2 });
            }
            else if (sprite2DUniformMaps.length > 0) {
                for (let i = 0; i < sprite2DUniformMaps.length; i++)
                    if (sprite2DUniformMaps[i].hasPtrID(id))
                        if (!_have(sprite2DUniforms, name))
                            sprite2DUniforms.push({ name, type, set: 2 });
            }
            else if (type === 'sampler2D' || type === 'samplerCube' || type === 'sampler2DArray' || type === 'sampler2DShadow') {
                if (!_have(textureUniforms, name))
                    textureUniforms.push({ name, type, set: 3 });
            }
            else if (!_have(materialUniforms, name))
                materialUniforms.push({ name, type, set: 3 });
        }

        for (const key in uniformMap) {
            const dataType = this._getAttributeT2S(<ShaderDataType>uniformMap[key].type);
            _catalog(key, uniformMap[key].name, dataType);
        }

        if (sprite2DUniforms.length === 0) //没有uniform，则添加默认的u_WorldMat，避免为空
            sprite2DUniforms.push({ name: 'u_WorldMat', type: 'mat4', set: 2 });
        if (materialUniforms.length === 0) //没有uniform，则添加默认的u_AlbedoColor，避免为空
            materialUniforms.push({ name: 'u_AlbedoColor', type: 'vec4', set: 3 });

        let uniformGLSL = '';
        const typeNum = 10;
        const visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
        const _procUniforms = (set: number, binding: number,
            name: string, uniformMap?: WebGPUCommandUniformMap, uniforms?: NameAndType[]) => {
            const sortedUniforms: NameAndType[][] = [];
            for (let i = 0; i < typeNum; i++)
                sortedUniforms[i] = [];
            uniformGLSL = `${uniformGLSL}layout(set = ${set}, binding = ${binding}) uniform ${name} {\n`;
            if (uniforms) {
                for (let i = 0, len = uniforms.length; i < len; i++) {
                    const nameStr = uniforms[i].name;
                    const typeStr = uniforms[i].type;
                    if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray' || typeStr === 'sampler2DShadow')
                        textureUniforms.push({ name: nameStr, type: typeStr, set });
                    else sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                }
            } else if (uniformMap) {
                const data = uniformMap._idata;
                for (const key in data) {
                    let nameStr: string;
                    if (data[key].arrayLength > 0) { //数组
                        nameStr = `${data[key].propertyName}[${data[key].arrayLength}]`;
                        arrayMap[nameStr] = data[key].arrayLength;
                    } else nameStr = data[key].propertyName;
                    const typeStr = this._getAttributeT2S(data[key].uniformtype);
                    if (data[key].propertyName.indexOf('.') !== -1) continue;
                    if (typeStr === '') continue;
                    else if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray')
                        textureUniforms.push({ name: nameStr, type: typeStr, set });
                    else sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                }
            }
            for (let i = 1; i < typeNum; i++)
                sortedUniforms[0].push(...sortedUniforms[i]);
            for (let i = 0, len = sortedUniforms[0].length; i < len; i++)
                uniformGLSL = `${uniformGLSL}    ${sortedUniforms[0][i].type} ${sortedUniforms[0][i].name};\n`;
            uniformGLSL = `${uniformGLSL}};\n\n`;
            uniformInfo.push({
                id: WebGPUGlobal.getUniformInfoId(),
                set,
                binding,
                visibility,
                type: WebGPUBindingInfoType.buffer,
                name,
                propertyId: Shader3D.propertyNameToID(name),
                uniform: this._genUniformBlockInfo(name, sortedUniforms[0], arrayMap),
                buffer: { type: 'uniform', hasDynamicOffset: false, minBindingSize: 0 },
            } as WebGPUUniformPropertyBindingInfo);
            return sortedUniforms[0];
        };

        _procUniforms(0, 0, 'scene3D', scene2DUniformMap);
        _procUniforms(1, 0, 'camera', cameraUniformMap);
        _procUniforms(2, 0, 'sprite3D', null, sprite2DUniforms);
        _procUniforms(3, 0, 'material', null, materialUniforms);

        return {
            uniformGLSL,
            uniformInfo,
            textureUniforms,
        };
    }

    /**
     * 生成uniform字符串
     * @param uniformMap 
     * @param arrayMap 数组uniform映射表（表示哪些uniform是数组，长度是多少）
     * @param nodeCommonMap 
     */
    private static _uniformString3D(uniformMap: WebGPUUniformMapType, arrayMap: NameNumberMap, nodeCommonMap: string[]) {
        const globalUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap;
        const scene3DUniformMap = globalUniformMap("Scene3D") as WebGPUCommandUniformMap;
        const cameraUniformMap = globalUniformMap("BaseCamera") as WebGPUCommandUniformMap;
        const sprite3DUniformMap = globalUniformMap("Sprite3D") as WebGPUCommandUniformMap;
        const simpleSkinnedMeshUniformMap = globalUniformMap("SimpleSkinnedMesh") as WebGPUCommandUniformMap;
        const shurikenSprite3DUniformMap = globalUniformMap("ShurikenSprite3D") as WebGPUCommandUniformMap;
        const trailRenderUniformMap = globalUniformMap("TrailRender") as WebGPUCommandUniformMap;
        const skyRendererUniformMap = globalUniformMap("SkyRenderer") as WebGPUCommandUniformMap;
        const scene3DUniforms: NameAndType[] = [];
        const cameraUniforms: NameAndType[] = [];
        const sprite3DUniforms: NameAndType[] = [];
        const materialUniforms: NameAndType[] = [];
        const textureUniforms: NameAndType[] = [];

        // const sprite3DUniformMaps: WebGPUCommandUniformMap[] = [];
        // if (nodeCommonMap)
        //     for (let i = 0; i < nodeCommonMap.length; i++)
        //         if (nodeCommonMap[i] !== 'Sprite3D')
        //             sprite3DUniformMaps.push(globalUniformMap(nodeCommonMap[i]) as WebGPUCommandUniformMap);

        //将u_Bones归类到sprite3D，避免归类到material（因为material是渲染节点共享的，无法单独处理骨骼数据）
        sprite3DUniformMap.addShaderUniform(SkinnedMeshSprite3D.BONES, 'u_Bones', ShaderDataType.Matrix4x4);
        const uniformInfo: WebGPUUniformPropertyBindingInfo[] = [];

        const _have = (group: NameAndType[], name: string) => {
            for (let i = group.length - 1; i > -1; i--)
                if (group[i].name === name)
                    return true;
            return false;
        }

        const regex = /\[(.*?)\]/g;
        const _catalog = (key: string, name: string, type: string) => {
            const id = Shader3D.propertyNameToID(key.replace(regex, '_')); //.更换成_（变量名中不能包含'.'）
            if (scene3DUniformMap.hasPtrID(id)) {
                if (!_have(scene3DUniforms, name))
                    scene3DUniforms.push({ name, type, set: 0 });
            }
            else if (cameraUniformMap.hasPtrID(id)) {
                if (!_have(cameraUniforms, name))
                    cameraUniforms.push({ name, type, set: 1 });
            }
            else if (sprite3DUniformMap.hasPtrID(id)) {
                if (!_have(sprite3DUniforms, name))
                    sprite3DUniforms.push({ name, type, set: 2 });
            }
            // else if (sprite3DUniformMaps.length > 0) {
            //     for (let i = 0; i < sprite3DUniformMaps.length; i++)
            //         if (sprite3DUniformMaps[i].hasPtrID(id))
            //             if (!_have(sprite3DUniforms, name))
            //                 sprite3DUniforms.push({ name, type, set: 2 });
            // }
            else if (simpleSkinnedMeshUniformMap.hasPtrID(id)) {
                if (!_have(sprite3DUniforms, name))
                    sprite3DUniforms.push({ name, type, set: 2 });
            }
            else if (shurikenSprite3DUniformMap.hasPtrID(id)) {
                if (!_have(sprite3DUniforms, name))
                    sprite3DUniforms.push({ name, type, set: 2 });
            }
            else if (trailRenderUniformMap.hasPtrID(id)) {
                if (!_have(sprite3DUniforms, name))
                    sprite3DUniforms.push({ name, type, set: 2 });
            }
            else if (skyRendererUniformMap.hasPtrID(id)) {
                if (!_have(sprite3DUniforms, name))
                    sprite3DUniforms.push({ name, type, set: 2 });
            }
            else if (type === 'sampler2D' || type === 'samplerCube' || type === 'sampler2DArray' || type === 'sampler2DShadow') {
                if (!_have(textureUniforms, name))
                    textureUniforms.push({ name, type, set: 3 });
            }
            else if (!_have(materialUniforms, name))
                materialUniforms.push({ name, type, set: 3 });
        }

        for (const key in uniformMap) {
            const dataType = this._getAttributeT2S(<ShaderDataType>uniformMap[key].type);
            _catalog(key, uniformMap[key].name, dataType);
        }

        //查找是否有u_WorldMat，如果没有，则添加u_WorldMat，这是为了和instance模式兼容
        let haveWorldMat = false;
        for (let i = sprite3DUniforms.length - 1; i > -1; i--) {
            if (sprite3DUniforms[i].name === 'u_WorldMat') {
                haveWorldMat = true;
                break;
            }
        }
        if (!haveWorldMat) //instance模式不使用u_WorldMat，但为了uniformBlock一致，仍然加入u_WorldMat
            sprite3DUniforms.push({ name: 'u_WorldMat', type: 'mat4', set: 2 });
        if (materialUniforms.length === 0) //没有uniform，则添加默认的u_AlbedoColor，避免成员为空
            materialUniforms.push({ name: 'u_AlbedoColor', type: 'vec4', set: 3 });

        let uniformGLSL = '';
        const typeNum = 10; //type类型数量不超过10个
        const visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
        const _procUniforms = (set: number, binding: number,
            name: string, uniformMap?: WebGPUCommandUniformMap, uniforms?: NameAndType[]) => {
            const sortedUniforms: NameAndType[][] = [];
            for (let i = 0; i < typeNum; i++)
                sortedUniforms[i] = [];
            uniformGLSL = `${uniformGLSL}layout(set = ${set}, binding = ${binding}) uniform ${name} {\n`;
            if (uniforms) {
                for (let i = 0, len = uniforms.length; i < len; i++) {
                    const nameStr = uniforms[i].name;
                    const typeStr = uniforms[i].type;
                    if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray' || typeStr === 'sampler2DShadow')
                        textureUniforms.push({ name: nameStr, type: typeStr, set });
                    else sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                }
            } else if (uniformMap) {
                const data = uniformMap._idata;
                for (const key in data) {
                    let nameStr: string;
                    if (data[key].arrayLength > 0) { //数组
                        nameStr = `${data[key].propertyName}[${data[key].arrayLength}]`;
                        arrayMap[nameStr] = data[key].arrayLength;
                    } else nameStr = data[key].propertyName;
                    const typeStr = this._getAttributeT2S(data[key].uniformtype);
                    if (data[key].propertyName.indexOf('.') !== -1) continue;
                    if (typeStr === '') continue;
                    else if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray')
                        textureUniforms.push({ name: nameStr, type: typeStr, set });
                    else sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                }
            }
            //按照type顺序组织uniform（尽可能减少padding）
            for (let i = 1; i < typeNum; i++)
                sortedUniforms[0].push(...sortedUniforms[i]);
            for (let i = 0, len = sortedUniforms[0].length; i < len; i++)
                uniformGLSL = `${uniformGLSL}    ${sortedUniforms[0][i].type} ${sortedUniforms[0][i].name};\n`;
            uniformGLSL = `${uniformGLSL}};\n\n`;
            uniformInfo.push({
                id: WebGPUGlobal.getUniformInfoId(),
                set,
                binding,
                visibility,
                type: WebGPUBindingInfoType.buffer,
                name,
                propertyId: Shader3D.propertyNameToID(name),
                uniform: this._genUniformBlockInfo(name, sortedUniforms[0], arrayMap),
                buffer: { type: 'uniform', hasDynamicOffset: false, minBindingSize: 0 },
            } as WebGPUUniformPropertyBindingInfo);
            return sortedUniforms[0];
        };

        //uniform分成4组，groupId=0~3，binding=0
        //scene3D和camera组的成员是固定的（由uniformMap决定）
        //sprite3D和material的成员按实际用到的（由uniforms决定）
        _procUniforms(0, 0, 'scene3D', scene3DUniformMap);
        _procUniforms(1, 0, 'camera', cameraUniformMap);
        _procUniforms(2, 0, 'sprite3D', null, sprite3DUniforms);
        _procUniforms(3, 0, 'material', null, materialUniforms);

        return {
            uniformGLSL, //uniform字符串（GLSL代码）
            uniformInfo, //uniform信息（用于生成layout）
            textureUniforms, //贴图信息（用于生成layout）
        };
    }

    /**
     * 生成sampler和texuture字符串
     * @param textureUniforms 
     * @param uniformInfo 
     * @param visibility 
     */
    private static _textureString(textureUniforms: NameAndType[], uniformInfo: WebGPUUniformPropertyBindingInfo[], visibility: GPUShaderStageFlags) {
        let res = '';
        let binding = [1, 1, 1, 1];
        for (let i = uniformInfo.length - 1; i > -1; i--)
            if (binding[uniformInfo[i].set] <= uniformInfo[i].binding)
                binding[uniformInfo[i].set] = uniformInfo[i].binding + 1;
        if (textureUniforms.length > 0) {
            for (let i = 0, len = textureUniforms.length; i < len; i++) {
                const tu = textureUniforms[i];
                if (tu.type === 'sampler2D') {
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform sampler ${tu.name}Sampler;\n`;
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform texture2D ${tu.name}Texture;\n`;
                    res = `${res}#define ${tu.name} sampler2D(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 2,
                        visibility,
                        type: WebGPUBindingInfoType.sampler,
                        name: `${tu.name}Sampler`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        sampler: { type: 'filtering' },
                    } as WebGPUUniformPropertyBindingInfo);
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 1,
                        visibility,
                        type: WebGPUBindingInfoType.texture,
                        name: `${tu.name}Texture`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        texture: { sampleType: 'float', viewDimension: '2d', multisampled: false },
                    } as WebGPUUniformPropertyBindingInfo);
                }
                if (tu.type === 'samplerCube') {
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform sampler ${tu.name}Sampler;\n`;
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform textureCube ${tu.name}Texture;\n`;
                    res = `${res}#define ${tu.name} samplerCube(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 2,
                        visibility,
                        type: WebGPUBindingInfoType.sampler,
                        name: `${tu.name}Sampler`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        sampler: { type: 'filtering' },
                    } as WebGPUUniformPropertyBindingInfo);
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 1,
                        visibility,
                        type: WebGPUBindingInfoType.texture,
                        name: `${tu.name}Texture`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        texture: { sampleType: 'float', viewDimension: 'cube', multisampled: false },
                    } as WebGPUUniformPropertyBindingInfo);
                }
                if (tu.type === 'sampler2DArray') {
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform sampler ${tu.name}Sampler;\n`;
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform texture2DArray ${tu.name}Texture;\n`;
                    res = `${res}#define ${tu.name} sampler2DArray(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 2,
                        visibility,
                        type: WebGPUBindingInfoType.sampler,
                        name: `${tu.name}Sampler`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        sampler: { type: 'filtering' },
                    } as WebGPUUniformPropertyBindingInfo);
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 1,
                        visibility,
                        type: WebGPUBindingInfoType.texture,
                        name: `${tu.name}Texture`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        texture: { sampleType: 'float', viewDimension: '2d-array', multisampled: false },
                    } as WebGPUUniformPropertyBindingInfo);
                }
                if (tu.type === 'sampler2DShadow') {
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform samplerShadow ${tu.name}Sampler;\n`;
                    res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform texture2D ${tu.name}Texture;\n`;
                    res = `${res}#define ${tu.name} sampler2DShadow(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 2,
                        visibility,
                        type: WebGPUBindingInfoType.sampler,
                        name: `${tu.name}Sampler`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        sampler: { type: 'filtering' },
                    } as WebGPUUniformPropertyBindingInfo);
                    uniformInfo.push({
                        id: WebGPUGlobal.getUniformInfoId(),
                        set: tu.set,
                        binding: binding[tu.set] - 1,
                        visibility,
                        type: WebGPUBindingInfoType.texture,
                        name: `${tu.name}Texture`,
                        propertyId: Shader3D.propertyNameToID(tu.name),
                        texture: { sampleType: 'float', viewDimension: '2d', multisampled: false },
                    } as WebGPUUniformPropertyBindingInfo);
                }
            }
        }
        return res;
    }

    /**
     * 去除naga转译报错的代码
     * @param code 
     */
    private static _changeUnfitCode(code: string) {
        const regex1 = /const\s+(?:in|highp|mediump|lowp)\s+/g;
        code = code.replace(regex1, 'in ');
        const regex2 = /(?:texture2D|textureCube)\s*\(\s*/g;
        return code.replace(regex2, 'texture(');
    }

    /**
     * 生成a_WorldMat拼合代码
     */
    private static _genAWorldMat() {
        return '#define a_WorldMat mat4(a_WorldMat_0, a_WorldMat_1, a_WorldMat_2, a_WorldMat_3)';
    }

    /**
     * 生成inverse函数（因为WGSL缺乏内置的inverse函数）
     */
    private static _genInverseFunc() {
        const func = `
mat2 inverse(mat2 m)
{
    return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / (m[0][0] * m[1][1] - m[0][1] * m[1][0]);
}
mat3 inverse(mat3 m)
{
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    float b01 = a22 * a11 - a12 * a21;
    float b11 = a12 * a20 - a22 * a10;
    float b21 = a21 * a10 - a11 * a20;

    float det = a00 * b01 + a01 * b11 + a02 * b21;

    return mat3(
           b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11), b11, (a22 * a00 - a02 * a20),
	       (-a12 * a00 + a02 * a10), b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10))
	/ det;
}
mat4 inverse(mat4 m)
{
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3];
    float a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3];

	float b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10;
	float b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
	float b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30;
	float b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;

	float det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    return mat4(
           a11 * b11 - a12 * b10 + a13 * b09, a02 * b10 - a01 * b11 - a03 * b09, a31 * b05 - a32 * b04 + a33 * b03,
	       a22 * b04 - a21 * b05 - a23 * b03, a12 * b08 - a10 * b11 - a13 * b07, a00 * b11 - a02 * b08 + a03 * b07,
	       a32 * b02 - a30 * b05 - a33 * b01, a20 * b05 - a22 * b02 + a23 * b01, a10 * b10 - a11 * b08 + a13 * b06,
	       a01 * b08 - a00 * b10 - a03 * b06, a30 * b04 - a31 * b02 + a33 * b00, a21 * b02 - a20 * b04 - a23 * b00,
	       a11 * b07 - a10 * b09 - a12 * b06, a00 * b09 - a01 * b07 + a02 * b06, a31 * b01 - a30 * b03 - a32 * b00,
	       a20 * b03 - a21 * b01 + a22 * b00)
	/ det;
}
mat2 transpose(mat2 m)
{
    return mat2(
    m[0][0], m[1][0],
	m[0][1], m[1][1]);
}
mat3 transpose(mat3 m)
{
    return mat3(
    m[0][0], m[1][0], m[2][0],
	m[0][1], m[1][1], m[2][1],
	m[0][2], m[1][2], m[2][2]);
}
mat4 transpose(mat4 m)
{
    return mat4(
    m[0][0], m[1][0], m[2][0], m[3][0],
	m[0][1], m[1][1], m[2][1], m[3][1],
	m[0][2], m[1][2], m[2][2], m[3][2],
	m[0][3], m[1][3], m[2][3], m[3][3]);
}`;
        return `${func}\n\n`;
    }

    /**
     * 生成Uniform数据块信息
     * @param name 
     * @param binding 
     * @param uniforms 
     * @param arrayMap 
     */
    private static _genUniformBlockInfo(name: string, uniforms: NameAndType[], arrayMap: NameNumberMap) {
        if (uniforms.length === 0) return undefined;
        const _getUniformAlign = (type: string) => {
            switch (type) {
                case 'int':
                case 'float':
                    return 4;
                case 'vec2':
                    return 8;
                case 'vec3':
                case 'vec4':
                case 'mat3':
                case 'mat4':
                    return 16;
                default:
                    return 4;
            }
        };
        const _getUniformElements = (type: string) => {
            switch (type) {
                case 'int':
                case 'float':
                    return 1;
                case 'vec2':
                    return 2;
                case 'vec3':
                    return 3;
                case 'vec4':
                    return 4;
                case 'mat3':
                    return 12;
                case 'mat4':
                    return 16;
                default:
                    return 1;
            }
        };
        const _getUniformSize = (type: string, count: number = 1) => {
            if (count <= 1) {
                switch (type) {
                    case 'int':
                    case 'float':
                        return 4;
                    case 'vec2':
                        return 8;
                    case 'vec3':
                        return 12;
                    case 'vec4':
                        return 16;
                    case 'mat3':
                        return 48;
                    case 'mat4':
                        return 64;
                    default:
                        return 4;
                }
            } else {
                switch (type) {
                    case 'int':
                    case 'float':
                        return 4 * count;
                    case 'vec2':
                        return 8 * count;
                    case 'vec3':
                        return 16 * count;
                    case 'vec4':
                        return 16 * count;
                    case 'mat3':
                        return 48 * count;
                    case 'mat4':
                        return 64 * count;
                    default:
                        return 4 * count;
                }
            }
        };

        const _calcUniformBufferSize = (uniforms: NameAndType[], arrayMap: NameNumberMap) => {
            let byteLength = 0;
            let maxAlign = 0;
            const regex = /\[(.*?)\]/g;
            const layout: { name: string, type: string, offset: number, align: number, size: number, elements: number, count: number }[] = [];
            for (let i = 0, len = uniforms.length; i < len; i++) {
                const uniform = uniforms[i];
                const count = arrayMap[uniform.name] || 1;
                const align = _getUniformAlign(uniform.type);
                const size = _getUniformSize(uniform.type, count);
                const elements = _getUniformElements(uniform.type);
                const name = uniform.name.replace(regex, '');
                if (align > maxAlign)
                    maxAlign = align;
                byteLength = roundUp(byteLength, align);
                byteLength += size;
                layout.push({ name, type: uniform.type, offset: byteLength - size, align, size, elements, count });
            }
            byteLength = roundUp(byteLength, maxAlign);
            return { byteLength, layout };
        };

        const size = _calcUniformBufferSize(uniforms, arrayMap);
        const uniformBlockInfo = new WebGPUUniformBlockInfo(name, size.byteLength);
        for (let i = 0, len = size.layout.length; i < len; i++) {
            const uniform = size.layout[i];
            uniformBlockInfo.addUniform(uniform.name, uniform.type, uniform.offset, uniform.align, uniform.size, uniform.elements, uniform.count);
        }
        return uniformBlockInfo;
    }

    /**
     * 转译Attribute类型（Type到String）
     * @param type 
     */
    private static _getAttributeT2S(type: ShaderDataType) {
        switch (type) {
            case ShaderDataType.Int:
                return 'int';
            case ShaderDataType.Bool:
                return 'bool';
            case ShaderDataType.Float:
                return 'float';
            case ShaderDataType.Vector2:
                return 'vec2';
            case ShaderDataType.Vector3:
                return 'vec3';
            case ShaderDataType.Vector4:
            case ShaderDataType.Color:
                return 'vec4';
            case ShaderDataType.Matrix3x3:
                return 'mat3';
            case ShaderDataType.Matrix4x4:
                return 'mat4';
            case ShaderDataType.Texture2D:
                return 'sampler2D';
            case ShaderDataType.TextureCube:
                return 'samplerCube';
            case ShaderDataType.Texture2DArray:
                return 'sampler2DArray';
            default:
                return '';
        }
    }

    /**
     * 转译Attribute类型（String到Type）
     * @param name 
     */
    private static _getAttributeS2T(name: string) {
        switch (name) {
            case 'int':
                return ShaderDataType.Int;
            case 'bool':
                return ShaderDataType.Bool;
            case 'float':
                return ShaderDataType.Float;
            case 'vec2':
                return ShaderDataType.Vector2;
            case 'vec3':
                return ShaderDataType.Vector3;
            case 'vec4':
                return ShaderDataType.Vector4;
            case 'mat3':
                return ShaderDataType.Matrix3x3;
            case 'mat4':
                return ShaderDataType.Matrix4x4;
            case 'sampler2D':
                return ShaderDataType.Texture2D;
            case 'samplerCube':
                return ShaderDataType.TextureCube;
            case 'sampler2DArray':
                return ShaderDataType.Texture2DArray;
            case 'sampler2DShadow':
                return ShaderDataType.Texture2D;
            default:
                return '';
        }
    }

    /**
     * 转译Attribute类型（String到Number），用于分组
     * @param name 
     */
    private static _getAttributeS2N(name: string) {
        switch (name) {
            case 'mat4':
                return 0;
            case 'mat3':
                return 1;
            case 'vec4':
                return 2;
            case 'vec3':
                return 3;
            case 'vec2':
                return 4;
            case 'float':
                return 5;
            case 'bool':
                return 6;
            case 'int':
                return 7;
            default:
                return 8;
        }
    }

    /**
     * 执行WGSL转译
     * @param defineString 
     * @param attributeMap 
     * @param uniformMap 
     * @param VS 
     * @param FS 
     * @param is2D 
     */
    static shaderLanguageProcess(defineString: string[],
        attributeMap: WebGPUAttributeMapType, uniformMap: WebGPUUniformMapType,
        arrayMap: NameNumberMap, nodeCommonMap: string[], VS: ShaderNode, FS: ShaderNode, is2D: boolean) {

        const defMap: any = {};
        const varyingMap: NameStringMap = {};
        const varyingMapVS: NameStringMap = {};
        const varyingMapFS: NameStringMap = {};
        const clusterSlices = Config3D.lightClusterCount;

        defineString.push('GRAPHICS_API_GLES3'); //默认支持GLES3

        let defineStr: string = '';
        defineStr += '#define MAX_LIGHT_COUNT ' + Config3D.maxLightCount + '\n';
        defineStr += '#define MAX_LIGHT_COUNT_PER_CLUSTER ' + Config3D._maxAreaLightCountPerClusterAverage + '\n';
        defineStr += '#define CLUSTER_X_COUNT ' + clusterSlices.x + '\n';
        defineStr += '#define CLUSTER_Y_COUNT ' + clusterSlices.y + '\n';
        defineStr += '#define CLUSTER_Z_COUNT ' + clusterSlices.z + '\n';
        defineStr += '#define MORPH_MAX_COUNT ' + Config3D.maxMorphTargetCount + '\n';
        defineStr += '#define SHADER_CAPAILITY_LEVEL ' + LayaGL.renderEngine.getParams(RenderParams.SHADER_CAPAILITY_LEVEL) + '\n';

        for (let i = 0, len = defineString.length; i < len; i++) {
            const def = defineString[i];
            defineStr += '#define ' + def + '\n';
            defMap[def] = true;
        }

        const vs = VS.toscript(defMap, []);
        if (vs[0].indexOf('#version') === 0)
            vs.shift();
        const fs = FS.toscript(defMap, []);
        if (fs[0].indexOf('#version') === 0)
            fs.shift();

        let vsOut = '', fsOut = '';
        let vsNeedInverseFunc = true;
        let fsNeedInverseFunc = true;
        const vsTod: TypeOutData = {};
        const fsTod: TypeOutData = {};
        //提取VertexShader的varying参数
        {
            const defs: Set<string> = new Set();
            const token = WebGPUShaderCompileDef.compile(vs.join('\n'), defs);
            const defMap: NameBooleanMap = {};
            defineString.forEach(def => { defMap[def] = true; });
            defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
            vsOut = WebGPUShaderCompileUtil.toScript(token, defMap, vsTod);
            if (vsTod.varying) //提取varying
                for (const key in vsTod.varying)
                    if (!varyingMapVS[key])
                        varyingMapVS[key] = vsTod.varying[key].type;
            if (vsTod.variable) {
                const attributeUsed: WebGPUAttributeMapType = {};
                for (const k in attributeMap)
                    if (vsTod.variable.has(k)) //提取被使用的attribute
                        attributeUsed[k] = attributeMap[k];
                attributeMap = attributeUsed;
            }
        }
        //提取FragmentShader的varying参数
        {
            const defs: Set<string> = new Set();
            const token = WebGPUShaderCompileDef.compile(fs.join('\n'), defs);
            const defMap: NameBooleanMap = {};
            defineString.forEach(def => { defMap[def] = true; });
            defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
            fsOut = WebGPUShaderCompileUtil.toScript(token, defMap, fsTod);
            if (fsTod.varying) //提取varying
                for (const key in fsTod.varying)
                    if (!varyingMapFS[key])
                        varyingMapFS[key] = fsTod.varying[key].type;
        }

        //匹配Varying参数
        for (const key in varyingMapVS)
            //if (varyingMapFS[key]) //不剔除没有实际使用的varying参数，增加兼容性
            varyingMap[key] = varyingMapVS[key];

        //生成各类GLSL4.5代码
        const attributeGLSL = this._attributeString(attributeMap);
        const varyingGLSL_vs = this._varyingString(varyingMap, 'out');
        const varyingGLSL_fs = this._varyingString(varyingMap, 'in');
        const {
            uniformGLSL,
            uniformInfo,
            textureUniforms } = is2D ?
                this._uniformString2D(uniformMap, arrayMap, nodeCommonMap)
                : this._uniformString3D(uniformMap, arrayMap, nodeCommonMap);
        const inverseFunc = this._genInverseFunc();
        const aWorldMat = this._genAWorldMat();

        const textureUniforms_vs: NameAndType[] = [];
        const textureUniforms_fs: NameAndType[] = [];
        if (vsTod.variable) { //提取被vs使用的texture
            for (let i = 0, len = textureUniforms.length; i < len; i++) {
                const name = textureUniforms[i].name;
                if (vsTod.variable.has(name)) {
                    textureUniforms_vs.push(textureUniforms[i]);
                    if (uniformMap[name]
                        && uniformMap[name].shadow) {
                        textureUniforms[i].type = 'sampler2DShadow';
                    }
                }
            }
        }
        if (fsTod.variable) { //提取被fs使用的texture
            for (let i = 0, len = textureUniforms.length; i < len; i++) {
                if (fsTod.variable.has(textureUniforms[i].name)) {
                    textureUniforms_fs.push(textureUniforms[i]);
                    if (uniformMap[textureUniforms[i].name]
                        && uniformMap[textureUniforms[i].name].shadow) {
                        textureUniforms[i].type = 'sampler2DShadow';
                    }
                }
            }
        }

        const textureGLSL_vs = this._textureString(textureUniforms_vs, uniformInfo, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT);
        const textureGLSL_fs = this._textureString(textureUniforms_fs, uniformInfo, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT);

        const textureNames_vs: string[] = [];
        const textureNames_fs: string[] = [];
        for (let i = 0, len = textureUniforms_vs.length; i < len; i++)
            textureNames_vs.push(textureUniforms_vs[i].name);
        for (let i = 0, len = textureUniforms_fs.length; i < len; i++)
            textureNames_fs.push(textureUniforms_fs[i].name);

        const vertexHead =
            `#version 450 core
precision highp float;
precision highp int;
${attributeGLSL}
${varyingGLSL_vs}
${uniformGLSL}
${textureGLSL_vs}
${aWorldMat}
`;
        const fragmentHead =
            `#version 450 core
precision highp float;
precision highp int;
layout(location = 0) out vec4 gl_FragColor;
${varyingGLSL_fs}
${uniformGLSL}
${textureGLSL_fs}
`;
        //预处理GLSL代码
        let vsBody = defineStr + (vsNeedInverseFunc ? inverseFunc : '') + vsOut;
        let fsBody = defineStr + (fsNeedInverseFunc ? inverseFunc : '') + fsOut;
        if (this.forNaga) {
            vsBody = this._changeUnfitCode(vsBody);
            fsBody = this._changeUnfitCode(fsBody);
        }
        const procVS = new WebGPU_GLSLProcess();
        const procFS = new WebGPU_GLSLProcess();
        procVS.process(vsBody, textureNames_vs);
        procFS.process(fsBody, textureNames_fs);
        //console.log(procVS);
        //console.log(procFS);

        //合并成完整的GLSL4.5代码
        let dstVS = vertexHead + procVS.glslCode;
        let dstFS = fragmentHead + procFS.glslCode;
        //console.log(dstVS);
        //console.log(dstFS);

        //转译成WGSL代码
        let wgsl_vs = this.naga.compileGLSL2WGSL(dstVS, 'vertex');
        let wgsl_fs = this.naga.compileGLSL2WGSL(dstFS, 'fragment');

        //处理textureSample
        {
            const regex: RegExp = /let\s+([_a-zA-Z][_a-zA-Z0-9]*)\s*=\s*textureSample\(((?:[^()]|\((?:[^()]*|\([^()]*\))*\))*)\);/g;
            let match;
            while ((match = regex.exec(wgsl_vs)) !== null) {
                const variable: string = match[1];
                const argss = match[2].split(',');

                let code: string;
                if (argss.length === 3) { //texture2D
                    code = `
    let ${variable}_1 = textureDimensions(${argss[0]}, 0);
    let ${variable}_2 = ${argss[2]};
    let ${variable}_3 = vec2<u32>(u32(f32(${variable}_1.x) * ${variable}_2.x), u32(f32(${variable}_1.y) * ${variable}_2.y));
    let ${variable} = textureLoad(${argss[0]}, ${variable}_3, 0);`;
                } else if (argss.length === 4) { //texture2DArray
                    code = `
    let ${variable}_1 = textureDimensions(${argss[0]}, 0);
    let ${variable}_2 = ${argss[2]};
    let ${variable}_3 = vec2<u32>(u32(f32(${variable}_1.x) * ${variable}_2.x), u32(f32(${variable}_1.y) * ${variable}_2.y));
    let ${variable} = textureLoad(${argss[0]}, ${variable}_3, ${argss[3]}, 0);`;
                }

                wgsl_vs = wgsl_vs.replace(match[0], code);
            }
        }

        //处理g_VertexID
        if (procVS.haveVertexID) {
            const regex: RegExp = /fn\s+main\([^{}]*\{/g;
            let match;
            if ((match = regex.exec(wgsl_vs)) !== null) {
                const str = match[0];
                let code = '';
                let add = false;
                for (let i = 0; i < str.length; i++) {
                    if (str[i] === '(' && !add) {
                        add = true;
                        code += str[i];
                        code += '@builtin(vertex_index) vertexIndex : u32, ';
                    } else if (str[i] === '{') {
                        code += str[i];
                        code += '\n    gl_VertexID = i32(vertexIndex);';
                    } else code += str[i];
                }
                wgsl_vs = wgsl_vs.replace(match[0], code);
            }
        }

        //console.log(wgsl_vs);
        //console.log(wgsl_fs);

        return { glsl_vs: dstVS, glsl_fs: dstFS, vs: wgsl_vs, fs: wgsl_fs, uniformInfo };
    }

    /**
     * 收集Uniform信息
     * @param defineString 
     * @param uniformMap 
     * @param VS 
     * @param FS 
     */
    static collectUniform(defineString: string[], uniformMap: UniformMapType, VS: ShaderNode, FS: ShaderNode) {
        //将uniformMap转换为uniformMapEx
        const uniformMapEx: WebGPUUniformMapType = {};
        for (const key in uniformMap) {
            if (typeof uniformMap[key] === 'object') {
                const blockUniform = <{ [name: string]: ShaderDataType }>uniformMap[key];
                for (const uniformName in blockUniform) {
                    const dataType = blockUniform[uniformName];
                    uniformMapEx[uniformName] = { name: uniformName, type: dataType };
                }
            } else uniformMapEx[key] = { name: key, type: uniformMap[key] as ShaderDataType };
        }

        defineString.push('GRAPHICS_API_GLES3'); //默认支持GLES3

        let defineStr: string = '';
        defineStr += '#define MAX_LIGHT_COUNT ' + Config3D.maxLightCount + '\n';
        defineStr += '#define MAX_LIGHT_COUNT_PER_CLUSTER ' + Config3D._maxAreaLightCountPerClusterAverage + '\n';
        defineStr += '#define CLUSTER_X_COUNT ' + Config3D.lightClusterCount.x + '\n';
        defineStr += '#define CLUSTER_Y_COUNT ' + Config3D.lightClusterCount.y + '\n';
        defineStr += '#define CLUSTER_Z_COUNT ' + Config3D.lightClusterCount.z + '\n';
        defineStr += '#define MORPH_MAX_COUNT ' + Config3D.maxMorphTargetCount + '\n';
        defineStr += '#define SHADER_CAPAILITY_LEVEL ' + LayaGL.renderEngine.getParams(RenderParams.SHADER_CAPAILITY_LEVEL) + '\n';

        const defMap: NameBooleanMap = {};
        for (let i = defineString.length - 1; i > -1; i--)
            defMap[defineString[i]] = true;

        let keyWithArray: string;
        let vsOut = '', fsOut = '';
        const vs = VS.toscript(defMap, []);
        const fs = FS.toscript(defMap, []);
        const vsTod: TypeOutData = {};
        const fsTod: TypeOutData = {};
        const arrayMap: NameNumberMap = {}; //uniform中的数组
        //提取VertexShader的uniform参数
        {
            const token = WebGPUShaderCompileDef.compile(defineStr + vs.join('\n'));
            const defMap: NameBooleanMap = {};
            defineString.forEach(def => { defMap[def] = true; });
            defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
            vsOut = WebGPUShaderCompileUtil.toScript(token, defMap, vsTod);
            if (vsTod.uniform) {
                for (const key in vsTod.uniform) {
                    if (!uniformMapEx[key]) {
                        if (vsTod.uniform[key].length && vsTod.uniform[key].length[0]) {
                            keyWithArray = `${key}[${vsTod.uniform[key].length[0]}]`;
                            uniformMapEx[key] = {
                                name: keyWithArray,
                                type: this._getAttributeS2T(vsTod.uniform[key].type) as ShaderDataType
                            };
                            arrayMap[keyWithArray] = vsTod.uniform[key].length[0];
                        } else uniformMapEx[key] = {
                            name: key,
                            type: this._getAttributeS2T(vsTod.uniform[key].type) as ShaderDataType
                        }
                    }
                }
            }
        }
        //提取FragmentShader的uniform参数
        {
            const token = WebGPUShaderCompileDef.compile(defineStr + fs.join('\n'));
            const defMap: NameBooleanMap = {};
            defineString.forEach(def => { defMap[def] = true; });
            defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
            fsOut = WebGPUShaderCompileUtil.toScript(token, defMap, fsTod);
            if (fsTod.uniform) {
                for (const key in fsTod.uniform) {
                    if (!uniformMapEx[key]) {
                        if (fsTod.uniform[key].length && fsTod.uniform[key].length[0]) {
                            keyWithArray = `${key}[${fsTod.uniform[key].length[0]}]`;
                            uniformMapEx[key] = {
                                name: keyWithArray,
                                type: this._getAttributeS2T(fsTod.uniform[key].type) as ShaderDataType
                            };
                            arrayMap[keyWithArray] = fsTod.uniform[key].length[0];
                        } else uniformMapEx[key] = {
                            name: key,
                            type: this._getAttributeS2T(fsTod.uniform[key].type) as ShaderDataType
                        }
                    }
                }
            }
        }

        //预处理GLSL代码，获取代码中定义的Uniform变量
        const uniform_vs = new WebGPU_GLSLProcess().getUniforms(vsOut);
        const uniform_fs = new WebGPU_GLSLProcess().getUniforms(fsOut);
        for (let i = uniform_vs.length - 1; i > -1; i--) {
            const name = uniform_vs[i].name;
            const type = uniform_vs[i].fields.type;
            const arrayLength = uniform_vs[i].fields.arrayLength;
            if (uniformMapEx[name] && type === 'sampler2DShadow')
                uniformMapEx[name].shadow = true;
            else {
                uniformMapEx[name] = {
                    name,
                    type: this._getAttributeS2T(type) as ShaderDataType,
                    shadow: type === 'sampler2DShadow' ? true : undefined
                }
            }
            if (arrayLength !== undefined)
                arrayMap[`${name}[${arrayLength}]`] = arrayLength;
        }
        for (let i = uniform_fs.length - 1; i > -1; i--) {
            const name = uniform_fs[i].name;
            const type = uniform_fs[i].fields.type;
            const arrayLength = uniform_fs[i].fields.arrayLength;
            if (uniformMapEx[name] && type === 'sampler2DShadow')
                uniformMapEx[name].shadow = true;
            else {
                uniformMapEx[name] = {
                    name,
                    type: this._getAttributeS2T(type) as ShaderDataType,
                    shadow: type === 'sampler2DShadow' ? true : undefined
                }
            }
            if (arrayLength !== undefined)
                arrayMap[`${name}[${arrayLength}]`] = arrayLength;
        }
        return { uniform: uniformMapEx, arr: arrayMap };
    }
}