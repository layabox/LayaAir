import * as glTF from "../glTFInterface";

import { Material } from "../../resource/Material";
import { IBatchProgress } from "../../net/BatchProgress";
import { Texture2D } from "../../resource/Texture2D";
import { glTFResource } from "../glTFResource";
import { glTFExtension } from "./glTFExtension";
import { Vector3 } from "../../maths/Vector3";
import { glTFShader } from "../shader/glTFShader";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

const ExtensionName = "KHR_materials_specular";

declare module "../glTFInterface" {

    export interface glTFMaterialSpecular {
        /** The strength of the specular reflection. default: 1.0 */
        specularFactor: number;
        /** A texture that defines the strength of the specular reflection, stored in the alpha (A) channel. This will be multiplied by specularFactor. */
        specularTexture: glTFTextureInfo;
        /** The F0 color of the specular reflection (linear RGB). default: [1.0, 1.0, 1.0] */
        specularColorFactor: number[];
        /** A texture that defines the F0 color of the specular reflection, stored in the RGB channels and encoded in sRGB. This texture will be multiplied by specularColorFactor. */
        specularColorTexture: glTFTextureInfo;
    }

}

export class KHR_materials_specular implements glTFExtension {
    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    loadAdditionTextures(basePath: string, progress?: IBatchProgress): Promise<Texture2D[]> {
        let promises: Array<Promise<Texture2D>> = [];

        let materials = this._resource.data.materials;
        let textures = this._resource.data.textures;
        if (materials && textures) {
            materials.forEach(material => {
                let extension: glTF.glTFMaterialSpecular = material.extensions?.KHR_materials_specular;
                if (extension) {
                    if (extension.specularTexture) {
                        let sRGB = false;
                        let promise = this._resource.loadTextureFromInfo(extension.specularTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                    if (extension.specularColorTexture) {
                        let sRGB = true;
                        let promise = this._resource.loadTextureFromInfo(extension.specularColorTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                }
            });
        }

        return Promise.all(promises);
    }

    additionMaterialProperties(glTFMaterial: glTF.glTFMaterial, material: Material): void {
        let extension: glTF.glTFMaterialSpecular = glTFMaterial.extensions.KHR_materials_specular;

        let specularFactor = extension.specularFactor ?? 1.0;
        let specularColorFactor = new Vector3(1.0, 1.0, 1.0);
        if (extension.specularColorFactor) {
            specularColorFactor.fromArray(extension.specularColorFactor);
        }

        material.setDefine(Shader3D.getDefineByName("SPECULAR"), true);

        material.setFloat("u_SpecularFactor", specularFactor);
        material.setVector3("u_SpecularColorFactor", specularColorFactor);

        if (extension.specularTexture) {
            this._resource.setMaterialTextureProperty(material, extension.specularTexture, "u_SpecularFactorTexture", glTFShader.Define_SpecularFactorMap, "u_SpecularFactorMapTransfrom", glTFShader.Define_SpecularFactorMapTransform);
        }

        if (extension.specularColorTexture) {
            this._resource.setMaterialTextureProperty(material, extension.specularColorTexture, "u_SpecularColorTexture", glTFShader.Define_SpecularColorMap, "u_SpecularColorMapTransform", glTFShader.Define_SpecularColorMapTransform);
        }
    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_specular(resource));