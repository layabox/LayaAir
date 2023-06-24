import { Material } from "../../d3/core/material/Material";
import { PBRMaterial } from "../../d3/core/material/PBRMaterial";
import { PBRShaderLib } from "../../d3/shader/pbr/PBRShaderLib";
import { IBatchProgress } from "../../net/BatchProgress";
import { Texture2D } from "../../resource/Texture2D";
import * as glTF from "../glTFInterface";

import { glTFResource } from "../glTFResource";
import { glTFShader } from "../shader/glTFShader";
import { glTFExtension } from "./glTFExtension";

const ExtensionName = "KHR_materials_clearcoat";

declare module "../glTFInterface" {

    export interface glTFMaterialClearCoat {
        /** The clearcoat layer intensity. default: 0.0*/
        clearcoatFactor?: number;
        /** The base color texture */
        clearcoatTexture?: glTFTextureInfo;
        /** The clearcoat layer roughness.  default: 0.0*/
        clearcoatRoughnessFactor?: number;
        /** The clearcoat layer roughness texture.*/
        clearcoatRoughnessTexture?: glTFTextureInfo;
        /** The clearcoat normal map texture. */
        clearcoatNormalTexture?: glTFMaterialNormalTextureInfo;
    }

}

/**
 * @internal
 * https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_clearcoat
 * 
 * exclusions: KHR_materials_pbrSpecularGlossiness, KHR_materials_unlit
 */
export class KHR_materials_clearcoat implements glTFExtension {
    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    loadAdditionTextures(basePath: string, progress?: IBatchProgress): Promise<any> {
        let materials = this._resource.data.materials;
        let textures = this._resource.data.textures;

        if (materials && textures) {
            let promises: Array<Promise<Texture2D>> = [];
            materials.forEach(material => {
                let extension: glTF.glTFMaterialClearCoat = material.extensions?.KHR_materials_clearcoat;
                if (extension) {
                    if (extension.clearcoatTexture) {
                        let promise = this._resource.loadTextureFromInfo(extension.clearcoatTexture, false, basePath, progress);
                        promises.push(promise);
                    }
                    if (extension.clearcoatRoughnessTexture) {
                        let promise = this._resource.loadTextureFromInfo(extension.clearcoatRoughnessTexture, false, basePath, progress);
                        promises.push(promise);
                    }
                    if (extension.clearcoatNormalTexture) {
                        let promise = this._resource.loadTextureFromInfo(extension.clearcoatNormalTexture, false, basePath, progress);
                        promises.push(promise);
                    }
                }
            });
            return Promise.all(promises);
        }
        else {
            return Promise.resolve();
        }
    }

    additionMaterialProperties(glTFMaterial: glTF.glTFMaterial, material: Material): void {
        let extension: glTF.glTFMaterialClearCoat = glTFMaterial.extensions.KHR_materials_clearcoat;
        let clearCoat = extension.clearcoatFactor ?? 0.0;
        let clearCoatRoughness = extension.clearcoatRoughnessFactor ?? 0.0;

        material.setDefine(PBRShaderLib.DEFINE_CLEARCOAT, true);

        material.setFloat("u_ClearCoatFactor", clearCoat);
        if (extension.clearcoatTexture) {
            this._resource.setMaterialTextureProperty(material, extension.clearcoatTexture, "u_ClearCoatTexture", glTFShader.Define_ClearCoatMap, "u_ClearCoatMapTransform", glTFShader.Define_ClearCoatMapTransform);
        }

        material.setFloat("u_ClearCoatRoughness", clearCoatRoughness);
        if (extension.clearcoatRoughnessTexture) {
            this._resource.setMaterialTextureProperty(material, extension.clearcoatRoughnessTexture, "u_ClearCoatRoughnessTexture", glTFShader.Define_ClearCoatRoughnessMap, "u_ClearCoatRoughnessMapTransform", glTFShader.Define_ClearCoatRoughnessMapTransform);
        }

        if (extension.clearcoatNormalTexture) {
            material.setDefine(PBRShaderLib.DEFINE_CLEARCOAT_NORMAL, true);

            this._resource.setMaterialTextureProperty(material, extension.clearcoatNormalTexture, "u_ClearCoatNormalTexture", null, "u_ClearCoatNormalMapTransform", glTFShader.Define_ClearCoatNormalMapTransform);

            let scale = extension.clearcoatNormalTexture.scale ?? 1.0;
            material.setFloat("u_ClearCoatNormalScale", scale);

        }
    }


}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_clearcoat(resource));