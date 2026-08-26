import { Shader3D, IShaderObjStructor, IShaderpassStructor, ShaderFeatureType } from "../RenderEngine/RenderShader/Shader3D";
import { ParseJSON } from "../utils/ParseJSON";
import { Color } from "../maths/Color";
import { Matrix3x3 } from "../maths/Matrix3x3";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { Texture2D } from "../resource/Texture2D";
import { TextureCube } from "../resource/TextureCube";
import { ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../layagl/LayaGL";


const CGBlock: string[] = ["GLSL Start", "GLSL End"];
const split: string[] = ["#defineGLSL", "#endGLSL"];
const shaderBlock: string[] = ["Shader3D Start", "Shader3D End"];
const globalUniformMapNames: string[] = ["Sprite2DGlobal", "Global"];
const shaderDataOBJ: Record<string, ShaderDataType> = {
    "Color": ShaderDataType.Color,
    "Int": ShaderDataType.Int,
    "Bool": ShaderDataType.Bool,
    "Float": ShaderDataType.Float,
    "Vector2": ShaderDataType.Vector2,
    "Vector3": ShaderDataType.Vector3,
    "Vector4": ShaderDataType.Vector4,
    "Vector4u": ShaderDataType.Vector4u,
    "Matrix4x4": ShaderDataType.Matrix4x4,
    "Matrix3x3": ShaderDataType.Matrix3x3,
    "Texture2D": ShaderDataType.Texture2D,
    "TextureCube": ShaderDataType.TextureCube,
    "Texture2DArray": ShaderDataType.Texture2DArray,
    "Texture3D": ShaderDataType.Texture3D,
    "StorageTexture2D": ShaderDataType.StorageTexture2D,
    "StorageBuffer": ShaderDataType.DeviceBuffer,
};

const glslUniformTypeOBJ: Record<string, string> = {
    "float": "Float",
    "int": "Int",
    "bool": "Bool",
    "vec2": "Vector2",
    "vec3": "Vector3",
    "vec4": "Vector4",
    "uvec4": "Vector4u",
    "mat3": "Matrix3x3",
    "mat4": "Matrix4x4",
    "sampler2D": "Texture2D",
    "sampler2DShadow": "Texture2D",
    "sampler3D": "Texture3D",
    "samplerCube": "TextureCube",
    "samplerCubeShadow": "TextureCube",
    "sampler2DArray": "Texture2DArray",
    "sampler2DArrayShadow": "Texture2DArray",
};

const glslUniformRegex = /\buniform\s+(?:(?:lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*(?:\[\s*(\d+)\s*\])?\s*;/gm;

//TODO 格式改变
export class ShaderParser {

    static parse(data: string, basePath?: string): Shader3D {
        let obj = ShaderParser.getShaderBlock(data);
        let cgmap = ShaderParser.getCGBlock(data);
        ShaderParser.bindCG(obj, cgmap);
        let shader = Shader3D.parse(obj, basePath);
        return shader;
    }

    static compileToTree(sliceFlag: string[], data: string, sliceIndex: number): string[] {
        if (sliceIndex == sliceFlag.length)
            return [data];
        let slicedata = sliceFlag[sliceIndex];
        let splitmap = data.split(slicedata);
        if (splitmap.length == 1)
            return splitmap;
        let map: string[] = [];
        for (let i = 0, n = splitmap.length; i < n; i++) {
            map = map.concat(ShaderParser.compileToTree(sliceFlag, splitmap[i], sliceIndex + 1));
            (i != n - 1) && map.push(slicedata);
        }
        return map;
    }

    static getMapKey(value: string) {
        let index = value.indexOf("\n");
        value = value.slice(0, index).replace("\r", "");
        value = value.slice(0, index).replace(" ", "");
        value = value.trim();
        return value;
    }

    /**
     * get Shader Data
     */
    static getShaderBlock(source: string) {
        let shaderObj: IShaderObjStructor = null;
        try {
            let i1 = source.indexOf(shaderBlock[0]);
            if (i1 == -1)
                throw new Error(`no '${shaderBlock[0]}' tag`);
            let i2 = source.indexOf(shaderBlock[1]);
            if (i2 == -1)
                throw new Error(`no '${shaderBlock[1]}' tag`);
            let shaderData = source.substring(i1 + shaderBlock[0].length, i2);
            shaderObj = ParseJSON.parse(shaderData);//TODO new FIle parse(1、去掉繁琐的json格式报错，2、可以有注释)

            if (typeof shaderObj.shaderType === 'string') {
                shaderObj.shaderType = ShaderFeatureType[shaderObj.shaderType as keyof typeof ShaderFeatureType] ?? ShaderFeatureType.None;
            } else {
                shaderObj.shaderType = shaderObj.shaderType as ShaderFeatureType ?? ShaderFeatureType.None;
            }
            // D2_primitive is deprecated
            if (shaderObj.shaderType === ShaderFeatureType.D2_primitive) {
                shaderObj.shaderType = ShaderFeatureType.D2_TextureSV;
            }

            shaderObj.previewType = shaderObj.previewType || null;
        } catch (err: any) {
            console.error("Shader parse error: " + err + "\n" + source.substring(0, 100) + "...");
        }
        return shaderObj;
    }

    /**
     * get CG data for map
     * @param source 
     * @returns 
     */
    static getCGBlock(source: string): { [key: string]: string } {
        let cgmap: { [key: string]: string } = {};
        try {
            let i1 = source.indexOf(CGBlock[0]);
            if (i1 == -1)
                throw new Error(`no '${shaderBlock[0]}' tag`);
            let i2 = source.indexOf(CGBlock[1]);
            if (i2 == -1)
                throw new Error(`no '${shaderBlock[1]}' tag`);
            let cgdata = source.substring(i1, i2);
            let map = ShaderParser.compileToTree(split, cgdata, 0);
            for (let i = 0, n = map.length; i < n; i++) {
                let value = map[i];
                if (value == split[0]) {
                    i += 1
                    let datavalue = map[i];
                    let key = ShaderParser.getMapKey(datavalue);
                    cgmap[key] = datavalue.slice(datavalue.indexOf("\n"), datavalue.length - 1);
                }
            }
        } catch (err: any) {
            console.error("Shader parse error: " + err + "\n" + source.substring(0, 100) + "...");
        }
        return cgmap;
    }

    static bindCG(shaderObj: IShaderObjStructor, cgmap: { [key: string]: string }) {
        //pass trans
        let passArray = shaderObj.shaderPass as Array<IShaderpassStructor>;
        if (passArray) {
            passArray.forEach(element => {
                if (element.VS) {
                    element.VS = cgmap[element.VS];
                }
                if (element.FS) {
                    element.FS = cgmap[element.FS];
                }
            });
        }
        ShaderParser.appendDirectGlslUniforms(shaderObj);
        //attribute map trans
        let attributemap = shaderObj.attributeMap;
        if (attributemap) {
            let indexofAttribute = 0;
            for (let i in attributemap) {
                //TODO  这里的格式要重新理 "name":type or "name":[type,custom Attribute Location]
                if (attributemap[i] instanceof Array) {
                    let dataArray = attributemap[i];
                    let type = ShaderParser.getShaderDataType(dataArray[0]);
                    if (type == null) {
                        console.warn(`${shaderObj.name}: unkown attribute type '${dataArray[0]}'`);
                        continue;
                    }
                    attributemap[i] = [dataArray[1], type];
                } else {
                    let type = ShaderParser.getShaderDataType(attributemap[i]);
                    if (type == null) {
                        console.warn(`${shaderObj.name}: unkown attribute type '${attributemap[i]}'`);
                        continue;
                    }
                    attributemap[i] = [indexofAttribute, type];
                    indexofAttribute++;
                }

            }
        }
        //uniform map trans
        let uniformMap = shaderObj.uniformMap;
        if (uniformMap) {
            let defaultmap: any = {};
            shaderObj.defaultValue = defaultmap;

            let newUniformMap: any = {};
            shaderObj.uniformMap = newUniformMap;

            for (let k in uniformMap) {
                let entry = uniformMap[k];
                if (entry.serializable === false)
                    continue;

                let dataType = ShaderParser.getShaderDataType(entry.type);
                if (dataType == null) {
                    console.warn(`${shaderObj.name}: unkown uniform type '${entry.type}'`);
                    continue;
                }

                if (entry.default != null)
                    defaultmap[k] = ShaderParser.getDefaultData(dataType, entry.default);

                let format: string | undefined;
                let access: 'readonly' | 'writeonly' | 'readwrite' | undefined;
                if (dataType == ShaderDataType.StorageTexture2D) {
                    format = entry.format ?? "rgba8";
                    access = entry.access ?? "writeonly";
                }
                else if (dataType == ShaderDataType.DeviceBuffer) {
                    access = entry.access ?? "readwrite";
                    if (access == "readonly")
                        dataType = ShaderDataType.ReadOnlyDeviceBuffer;
                }

                let value: any = (format !== undefined || access !== undefined)
                    ? { type: dataType, format, access }
                    : dataType;

                if (entry.block) {
                    let block: Record<string, any> = newUniformMap[entry.block];
                    if (!block)
                        newUniformMap[entry.block] = block = {};
                    block[k] = value;
                }
                else
                    newUniformMap[k] = value;
            }
        }
    }

    /**
     * Reflect uniforms declared directly in a shader resource's GLSL blocks.
     * This runs before SubShader and material ShaderData are created, matching
     * WebGL reflection without mutating an already-live native uniform layout.
     */
    private static appendDirectGlslUniforms(shaderObj: IShaderObjStructor): void {
        const uniformMap = shaderObj.uniformMap;
        const passes = shaderObj.shaderPass as Array<IShaderpassStructor>;
        if (!uniformMap || !passes)
            return;

        const registered = new Set<string>();
        for (const key in uniformMap) {
            registered.add(key.replace(/\s*\[.*$/, ""));
            const entry = uniformMap[key];
            if (entry && typeof entry === "object" && entry.type == null) {
                for (const blockName in entry)
                    registered.add(blockName.replace(/\s*\[.*$/, ""));
            }
        }

        for (const pass of passes) {
            for (const source of [pass.VS, pass.FS]) {
                if (!source)
                    continue;
                glslUniformRegex.lastIndex = 0;
                let match: RegExpExecArray;
                while ((match = glslUniformRegex.exec(source)) != null) {
                    const [, glslType, name, arrayLength] = match;
                    if (registered.has(name))
                        continue;
                    const propertyID = Shader3D.propertyNameToID(name);
                    if (ShaderParser.isGlobalUniform(propertyID)) {
                        registered.add(name);
                        continue;
                    }
                    const shaderType = glslUniformTypeOBJ[glslType];
                    if (!shaderType)
                        continue;
                    const key = arrayLength ? `${name}[${arrayLength}]` : name;
                    uniformMap[key] = { type: shaderType };
                    registered.add(name);
                }
            }
        }
    }

    private static isGlobalUniform(propertyID: number): boolean {
        const factory = LayaGL.renderDeviceFactory;
        if (!factory)
            return false;

        for (const mapName of globalUniformMapNames) {
            const uniformMap = factory.createGlobalUniformMap(mapName);
            if (uniformMap.hasPtrID(propertyID))
                return true;
        }
        return false;
    }

    /**
     * trans string to ShaderDataType
     * @param value 
     * @returns 
     */
    static getShaderDataType(value: string): ShaderDataType {
        return shaderDataOBJ[value];
    }

    /**
     * set ShaderData Value
     * @param type 
     * @param data 
     * @returns 
     */
    static getDefaultData(type: ShaderDataType, data: any) {
        switch (type) {
            case ShaderDataType.Int:
            case ShaderDataType.Float:
            case ShaderDataType.Bool:
                return data;
            case ShaderDataType.Vector2:
                return new Vector2(data[0], data[1]);
            case ShaderDataType.Vector3:
                return new Vector3(data[0], data[1], data[2]);
            case ShaderDataType.Vector4:
                return new Vector4(data[0], data[1], data[2], data[3]);
            case ShaderDataType.Color:
                return new Color(data[0], data[1], data[2], data[3]);
            case ShaderDataType.Matrix4x4:
                let mat = new Matrix4x4();
                mat.cloneByArray(data);
                return mat;
            case ShaderDataType.Matrix3x3:
                let mat3 = new Matrix3x3();
                mat3.cloneByArray(data);
                return mat3;
            case ShaderDataType.Texture2D:
                let tex = null;
                if (data == "white")
                    tex = Texture2D.whiteTexture;
                else if (data == "black")
                    tex = Texture2D.blackTexture;
                else if (data == "gray")
                    tex = Texture2D.grayTexture;
                else if (data == "normal")
                    tex = Texture2D.normalTexture;
                return tex;
            case ShaderDataType.TextureCube:
                let texcube = TextureCube.grayTexture;
                if (data == "white")
                    texcube = TextureCube.whiteTexture;
                else if (data == "black")
                    texcube = TextureCube.blackTexture;
                else if (data == "gray")
                    texcube = TextureCube.grayTexture;
                return texcube;
        }
    }
}
