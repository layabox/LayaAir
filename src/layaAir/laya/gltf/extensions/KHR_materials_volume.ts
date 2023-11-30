import * as glTF from "../glTFInterface";

import { Material } from "../../resource/Material";
import { IBatchProgress } from "../../net/BatchProgress";
import { Texture2D } from "../../resource/Texture2D";
import { glTFExtension } from "./glTFExtension";
import { glTFResource } from "../glTFResource";
import { glTFShader } from "../shader/glTFShader";
import { Vector3 } from "../../maths/Vector3";
import { PBRShaderLib } from "../../d3/shader/pbr/PBRShaderLib";

const ExtensionName = "KHR_materials_volume";

declare module "../glTFInterface" {

    export interface glTFMaterialVolume {
        /** The thickness of the volume beneath the surface. default: 0.0 */
        thicknessFactor: number;
        /** A texture that defines the thickness, stored in the G channel. */
        thicknessTexture: glTFTextureInfo;
        /** Density of the medium given as the average distance that light travels in the medium before interacting with a particle. default: +Infinity */
        attenuationDistance: number;
        /** The color that white light turns into due to absorption when reaching the attenuation distance. default: [1, 1, 1] */
        attenuationColor: number[];
    }

}

export class KHR_materials_volume implements glTFExtension {
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
                let extension: glTF.glTFMaterialVolume = material.extensions?.KHR_materials_volume;
                if (extension) {
                    if (extension.thicknessTexture) {
                        let sRGB = false;
                        let promise = this._resource.loadTextureFromInfo(extension.thicknessTexture, sRGB, basePath, progress);
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
        let extension: glTF.glTFMaterialVolume = glTFMaterial.extensions.KHR_materials_volume;

        material.setDefine(PBRShaderLib.DEFINE_THICKNESS, true);

        let thicknessFactor = extension.thicknessFactor ?? 0.0;
        let attenuationDistance = extension.attenuationDistance ?? 65504.0;

        material.setFloat("u_VolumeThicknessFactor", thicknessFactor);
        material.setFloat("u_VolumeAttenuationDistance", attenuationDistance);

        let attenuationColor = new Vector3(1, 1, 1);
        if (extension.attenuationColor) {
            attenuationColor.fromArray(extension.attenuationColor);
        }

        material.setVector3("u_VolumeAttenuationColor", attenuationColor);

        if (extension.thicknessTexture) {
            this._resource.setMaterialTextureProperty(material, extension.thicknessTexture, "u_VolumeThicknessTexture", glTFShader.Define_VolumeThicknessMap, "u_VoluemThicknessMapTransform", glTFShader.Define_VolumeThicknessMapTransform);
        }
    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_volume(resource));

