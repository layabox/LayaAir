import * as glTF from "../glTFInterface";

import { IBatchProgress } from "../../net/BatchProgress";
import { Texture2D } from "../../resource/Texture2D";
import { glTFResource } from "../glTFResource";
import { glTFExtension } from "./glTFExtension";
import { Material } from "../../resource/Material";
import { PBRShaderLib } from "../../d3/shader/pbr/PBRShaderLib";
import { glTFShader } from "../shader/glTFShader";

const ExtensionName = "KHR_materials_iridescence";

declare module "../glTFInterface" {

    export interface glTFMaterialIridescence {
        /** The iridescence intensity factor. default: 0.0 */
        iridescenceFactor: number;
        /** The iridescence intensity texture. */
        iridescenceTexture: glTFTextureInfo;
        /** The index of refraction of the dielectric thin-film layer. default: 1.3 */
        iridescenceIor: number;
        /** The minimum thickness of the thin-film layer given in nanometers. default: 100.0 */
        iridescenceThicknessMinimum: number;
        /** The maximum thickness of the thin-film layer given in nanometers. default: 400.0 */
        iridescenceThicknessMaximum: number;
        /** The thickness texture of the thin-film layer. */
        iridescenceThicknessTexture: glTFTextureInfo;
    }

}

export class KHR_materials_iridescence implements glTFExtension {
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
                let extension: glTF.glTFMaterialIridescence = material.extensions?.KHR_materials_iridescence;
                if (extension) {
                    if (extension.iridescenceTexture) {
                        let promise = this._resource.loadTextureFromInfo(extension.iridescenceTexture, false, basePath, progress);
                        promises.push(promise);
                    }
                    if (extension.iridescenceThicknessTexture) {
                        let promise = this._resource.loadTextureFromInfo(extension.iridescenceThicknessTexture, false, basePath, progress);
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
        let extension: glTF.glTFMaterialIridescence = glTFMaterial.extensions.KHR_materials_iridescence;

        let factor = extension.iridescenceFactor ?? 0.0;
        let ior = extension.iridescenceIor ?? 1.3;
        let thicknessMin = extension.iridescenceThicknessMinimum ?? 100;
        let thicknessMax = extension.iridescenceThicknessMaximum ?? 400;

        material.setDefine(PBRShaderLib.DEFINE_IRIDESCENCE, true);
        material.setFloat("u_IridescenceFactor", factor);
        material.setFloat("u_IridescenceIor", ior);
        material.setFloat("u_IridescenceThicknessMinimum", thicknessMin);
        material.setFloat("u_IridescenceThicknessMaximum", thicknessMax);

        if (extension.iridescenceTexture) {
            this._resource.setMaterialTextureProperty(material, extension.iridescenceTexture, "u_IridescenceTexture", glTFShader.Define_IridescenceMap, "u_IridescenceMapTransform", glTFShader.Define_IridescenceMapTransform);
        }

        if (extension.iridescenceThicknessTexture) {
            this._resource.setMaterialTextureProperty(material, extension.iridescenceThicknessTexture, "u_IridescenceThicknessTexture", glTFShader.Define_IridescenceThicknessMap, "u_IridescenceThicknessMapTransform", glTFShader.Define_IridescenceThicknessMapTransform);
        }

    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_iridescence(resource));
