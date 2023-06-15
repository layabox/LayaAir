import { Material } from "../../d3/core/material/Material";
import { IBatchProgress } from "../../net/BatchProgress";
import { glTFMaterial } from "../glTFInterface";
import { glTFExtension } from "./glTFExtension";

import * as glTF from "../glTFInterface";
import { glTFResource } from "../glTFResource";
import { PBRStandardMaterial } from "../../d3/core/material/PBRStandardMaterial";

const ExtensionName = "KHR_materials_emissive_strength";

declare module "../glTFInterface" {

    export interface glTFMaterialEmissionStrength {
        /** The strength adjustment to be multiplied with the material's emissive value. default: 1.0 */
        emissiveStrength: number;
    }

}

export class KHR_materials_emissive_strength implements glTFExtension {
    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    additionMaterialProperties?(glTFMaterial: glTFMaterial, material: Material): void {

        let extension: glTF.glTFMaterialEmissionStrength = glTFMaterial.extensions.KHR_materials_emissive_strength;

        let emissionStrength = extension.emissiveStrength ?? 1.0;

        material.setFloat("u_EmissionStrength", emissionStrength);
    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_emissive_strength(resource));