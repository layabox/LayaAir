import { BlendEquationSeparate } from "../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../RenderEngine/RenderEnum/BlendFactor";
import { CompareFunction } from "../RenderEngine/RenderEnum/CompareFunction";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { Color } from "../maths/Color";
import { Matrix3x3 } from "../maths/Matrix3x3";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { Loader, ILoadURL } from "../net/Loader";
import { Material } from "../resource/Material";
import { ClassUtils } from "../utils/ClassUtils";
import { URL } from "../net/URL";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";

export class MaterialParser {

    static parse(data: any): Material {
        let props: any = data.props;

        switch (data.version) {
            case "LAYAMATERIAL:01":
            case "LAYAMATERIAL:02":
            case "LAYAMATERIAL:03":
                let mat = MaterialParser.parseLegacy(data);
                mat.oldparseEndEvent();
                return mat;
            case "LAYAMATERIAL:04":
                break;
            default:
                throw new Error(`unkonwn material version: ${data.version}`);
        }

        let mat = new Material();
        mat.setShaderName(props.type);
        let renderQueue: number;
        for (let key in props) {
            switch (key) {
                case "type":
                case "name":
                    break;
                case "defines":
                    let defineNames: any[] = props[key];
                    for (let i = 0, n = defineNames.length; i < n; i++) {
                        let define: ShaderDefine = Shader3D.getDefineByName(defineNames[i]);//TODO:是否取消defines
                        mat._shaderValues.addDefine(define);
                    }
                    break;
                case "textures":
                    let textures: any[] = props[key];
                    for (let i = 0, n = textures.length; i < n; i++) {
                        let texture: any = textures[i];
                        let path: string = texture.path;
                        (path) && (mat._shaderValues.setTexture(Shader3D.propertyNameToID(texture.name), Loader.getBaseTexture(path)));
                    }
                    break;
                case "renderQueue":
                    renderQueue = props[key];
                    break;
                case "alphaTest":
                    mat.alphaTest = props[key];
                    break;
                case "materialRenderMode":
                    mat.materialRenderMode = props[key];
                    break;
                default:
                    let property = props[key];
                    let uniName = Shader3D.propertyNameToID(key);

                    switch (uniName) {
                        case Shader3D.CULL:
                            mat.cull = property;
                            break;
                        case Shader3D.BLEND:
                            mat.blend = property;
                            break;
                        case Shader3D.BLEND_SRC:
                            mat.blendSrc = property;
                            break;
                        case Shader3D.BLEND_DST:
                            mat.blendDst = property;
                            break;
                        case Shader3D.BLEND_DST_ALPHA:
                            mat.blendDstAlpha = property;
                            break;
                        case Shader3D.BLEND_SRC_ALPHA:
                            mat.blendSrcAlpha = property;
                            break;
                        case Shader3D.BLEND_SRC_RGB:
                            mat.blendSrcRGB = property;
                            break;
                        case Shader3D.BLEND_SRC_RGB:
                            mat.blendDstRGB = property;
                            break;
                        case Shader3D.DEPTH_TEST:
                            mat.depthTest = property;
                            break;
                        case Shader3D.DEPTH_WRITE:
                            mat.depthWrite = !!props[key];
                            break;
                        case Shader3D.STENCIL_TEST:
                            mat.stencilTest = property;
                            break;
                        case Shader3D.STENCIL_Op:
                            mat.stencilOp = property;
                            break;
                        case Shader3D.STENCIL_Ref:
                            mat.stencilRef = property;
                            break;
                        case Shader3D.STENCIL_WRITE:
                            mat.stencilWrite = property;
                            break;
                        default:
                            if (!property.length) {
                                if (typeof property == 'boolean')
                                    mat._shaderValues.setBool(uniName, props[key]);
                                else {
                                    mat._shaderValues.setNumber(uniName, props[key]);
                                }
                            } else {
                                var vectorValue = property;
                                switch (vectorValue.length) {
                                    case 2:
                                        mat._shaderValues.setVector2(uniName, new Vector2(vectorValue[0], vectorValue[1]));
                                        break;
                                    case 3:
                                        mat._shaderValues.setVector3(uniName, new Vector3(vectorValue[0], vectorValue[1], vectorValue[2]));
                                        break;
                                    case 4:
                                        if (mat._shaderValues.getColor(uniName)) {
                                            mat._shaderValues.setColor(uniName, new Color(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]));
                                        } else
                                            mat._shaderValues.setVector(uniName, new Vector4(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]));
                                        break;
                                    case 9:
                                        let matrix3 = new Matrix3x3();
                                        matrix3.elements = new Float32Array(vectorValue);
                                        mat._shaderValues.setMatrix3x3(uniName, matrix3);
                                        break;
                                    case 16:
                                        let matrix4 = new Matrix4x4();
                                        matrix4.elements = new Float32Array(vectorValue);
                                        mat._shaderValues.setMatrix4x4(uniName, matrix4);
                                        break;
                                    default:
                                        mat._shaderValues.setBuffer(uniName, vectorValue);
                                }
                            }
                            break;
                    }
            }
        }
        if (null != renderQueue) {
            mat.renderQueue = renderQueue;
        }

        return mat;
    }

    static collectLinks(data: any, basePath: string) {
        let urls: ILoadURL[] = [];
        let textures: any[] = data.props?.textures;
        if (textures) {
            for (let i = 0, n = textures.length; i < n; i++) {
                let tex2D: any = textures[i];
                let tex2DPath: string = tex2D.path;
                if (tex2DPath) {
                    tex2D.path = URL.join(basePath, tex2DPath);
                    urls.push({ url: tex2D.path, type: Loader.TEXTURE2D, constructParams: tex2D.constructParams, propertyParams: tex2D.propertyParams });
                }
            }
        }
        return urls;
    }


    /**
     * @deprecated
     * @inheritDoc
     */
    static parseLegacy(data: any): Material {
        let jsonData: any = data;
        let props: any = jsonData.props;

        let mat: Material;
        let classType: string = props.type;
        let clas: any = ClassUtils.getClass(classType);
        if (!clas && classType && classType.startsWith("Laya."))
            clas = ClassUtils.getClass(classType.substring(5));
        if (clas)
            mat = new clas();
        else {
            mat = new Material();
            mat.setShaderName(classType);
        }

        switch (jsonData.version) {
            case "LAYAMATERIAL:01":
            case "LAYAMATERIAL:02":
                for (let key in props) {
                    switch (key) {
                        case "type":
                            break;
                        case "vectors":
                            let vectors = props[key];
                            for (let i = 0, n = vectors.length; i < n; i++) {
                                let vector = vectors[i];
                                let vectorValue = vector.value;
                                switch (vectorValue.length) {
                                    case 2:
                                        (<any>mat)[vector.name] = new Vector2(vectorValue[0], vectorValue[1]);
                                        break;
                                    case 3:
                                        if ((<any>mat)[vector.name] instanceof Color) {
                                            (<any>mat)[vector.name] = new Color(vectorValue[0], vectorValue[1], vectorValue[2], 1.0);
                                        } else
                                            (<any>mat)[vector.name] = new Vector3(vectorValue[0], vectorValue[1], vectorValue[2]);
                                        break;
                                    case 4:
                                        if ((<any>mat)[vector.name] instanceof Color) {
                                            (<any>mat)[vector.name] = new Color(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]);
                                        } else
                                            (<any>mat)[vector.name] = new Vector4(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]);
                                        break;
                                    default:
                                        throw new Error("unkonwn material color length: " + vectorValue.length);
                                }
                            }
                            break;
                        case "colors":
                            let colors = props[key];
                            for (let i = 0, n = colors.length; i < n; i++) {
                                let color = colors[i];
                                let vectorValue = color.value;
                                (<any>mat)[color.name] = new Color(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3])
                            }
                            break;
                        case "textures":
                            let textures: any[] = props[key];
                            for (let i = 0, n = textures.length; i < n; i++) {
                                let texture: any = textures[i];
                                let path: string = texture.path;
                                (path) && ((<any>mat)[texture.name] = Loader.getBaseTexture(path));
                            }
                            break;
                        case "defines":
                            let defineNames: any[] = props[key];
                            for (let i = 0, n = defineNames.length; i < n; i++) {
                                let define: ShaderDefine = Shader3D.getDefineByName(defineNames[i]);//TODO:是否取消defines
                                mat._shaderValues.addDefine(define);
                            }
                            break;
                        case "renderStates"://"LAYAMATERIAL:02" 
                            let renderStatesData: any[] = props[key];
                            let renderStateData: any = renderStatesData[0];
                            mat.blend = renderStateData.blend;
                            mat.cull = this._getRenderStateParams(renderStateData.cull);
                            mat.depthTest = this._getRenderStateParams(renderStateData.depthTest);
                            mat.depthWrite = renderStateData.depthWrite;
                            mat.blendSrc = this._getRenderStateParams(renderStateData.srcBlend);
                            mat.blendDst = this._getRenderStateParams(renderStateData.dstBlend);
                            break;
                        case "cull"://"LAYAMATERIAL:01"
                            mat.cull = this._getRenderStateParams(props[key]);
                            break;
                        case "blend"://"LAYAMATERIAL:01"
                            mat.blend = this._getRenderStateParams(props[key]);
                            break;
                        case "depthWrite"://"LAYAMATERIAL:01" 
                            mat.depthWrite = !!props[key];
                            break;
                        case "srcBlend"://"LAYAMATERIAL:01" 
                            mat.blendSrc = this._getRenderStateParams(props[key]);
                            break;
                        case "dstBlend"://"LAYAMATERIAL:01" 
                            mat.blendDst = this._getRenderStateParams(props[key]);
                            break;
                        case "depthTest":
                            mat.depthTest = this._getRenderStateParams(props[key]);
                            break;
                        case "blendDst":
                            mat.blendDst = this._getRenderStateParams(props[key]);
                            break;
                        case "blendSrc":
                            mat.blendSrc = this._getRenderStateParams(props[key]);
                            break;
                        default:
                            (<any>mat)[key] = props[key];
                    }
                }
                break;
            case "LAYAMATERIAL:03":
                for (let key in props) {
                    switch (key) {
                        case "type":
                        case "name":
                            break;
                        case "defines":
                            let defineNames: any[] = props[key];
                            for (let i = 0, n = defineNames.length; i < n; i++) {
                                let define: ShaderDefine = Shader3D.getDefineByName(defineNames[i]);//TODO:是否取消defines
                                mat._shaderValues.addDefine(define);
                            }
                            break;
                        case "textures":
                            let textures: any[] = props[key];
                            for (let i = 0, n = textures.length; i < n; i++) {
                                let texture: any = textures[i];
                                let path: string = texture.path;
                                (path) && (mat._shaderValues.setTexture(Shader3D.propertyNameToID(texture.name), Loader.getBaseTexture(path)));
                            }
                            break;
                        case "renderQueue":
                            mat.renderQueue = props[key];
                            break;
                        default:
                            let property = props[key];
                            let uniName = Shader3D.propertyNameToID(key);

                            switch (uniName) {
                                case Shader3D.CULL:
                                    mat.cull = this._getRenderStateParams(property);
                                    break;
                                case Shader3D.BLEND:
                                    mat.blend = this._getRenderStateParams(property);
                                    break;
                                case Shader3D.BLEND_SRC:
                                    mat.blendSrc = this._getRenderStateParams(property);
                                    break;
                                case Shader3D.BLEND_DST:
                                    mat.blendDst = this._getRenderStateParams(property);
                                    break;
                                case Shader3D.DEPTH_TEST:
                                    mat.depthTest = this._getRenderStateParams(property);
                                    break;
                                case Shader3D.DEPTH_WRITE:
                                    mat.depthWrite = !!props[key];
                                    break;
                                default:
                                    if (!property.length) {
                                        if (typeof property == 'boolean')
                                            mat._shaderValues.setBool(uniName, props[key]);
                                        else {
                                            mat._shaderValues.setNumber(uniName, props[key]);
                                        }

                                    } else {
                                        var vectorValue = property;
                                        switch (vectorValue.length) {
                                            case 2:
                                                mat._shaderValues.setVector2(uniName, new Vector2(vectorValue[0], vectorValue[1]));
                                                break;
                                            case 3:
                                                mat._shaderValues.setVector3(uniName, new Vector3(vectorValue[0], vectorValue[1], vectorValue[2]));
                                                break;
                                            case 4:
                                                if (mat._shaderValues.getColor(uniName)) {
                                                    mat._shaderValues.setColor(uniName, new Color(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]));
                                                } else
                                                    mat._shaderValues.setVector(uniName, new Vector4(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]));
                                                break;
                                            default:
                                                throw new Error("unkonwn material color length: " + vectorValue.length);
                                        }
                                    }
                                    break;
                            }


                    }
                }
                break;
            default:
                throw new Error("unkonwn material version: " + jsonData.version);
        }
        return mat;
    }


    /**
        * @deprecated
        * 兼容Blend数据
        */
    private static _getRenderStateParams(type: number) {
        switch (type) {
            case 0x0300:
                return BlendFactor.SourceColor;
            case 0x0301:
                return BlendFactor.OneMinusSourceColor;
            case 0x0306:
                return BlendFactor.DestinationColor;
            case 0x0307:
                return BlendFactor.OneMinusDestinationColor;
            case 0x0302:
                return BlendFactor.SourceAlpha;
            case 0x0303:
                return BlendFactor.OneMinusSourceAlpha;
            case 0x0304:
                return BlendFactor.DestinationAlpha;
            case 0x0305:
                return BlendFactor.OneMinusDestinationAlpha;
            case 0x0308:
                return BlendFactor.SourceAlphaSaturate;
            case 0x8006:
                return BlendEquationSeparate.ADD;
            case 0x800A:
                return BlendEquationSeparate.SUBTRACT;
            case 0x800B:
                return BlendEquationSeparate.REVERSE_SUBTRACT;
            case 0x0200:
                return CompareFunction.Never;
            case 0x0201:
                return CompareFunction.Less;
            case 0x0202:
                return CompareFunction.Equal;
            case 0x0203:
                return CompareFunction.LessEqual;
            case 0x0204:
                return CompareFunction.Greater;
            case 0x0205:
                return CompareFunction.NotEqual;
            case 0x0206:
                return CompareFunction.GreaterEqual;
            case 0x0207:
                return CompareFunction.Always;
            default:
                return type;
        }
    }
}