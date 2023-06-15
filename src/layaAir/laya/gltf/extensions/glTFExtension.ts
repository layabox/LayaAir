import * as glTF from "../glTFInterface";

import { Material } from "../../d3/core/material/Material";

import { IBatchProgress } from "../../net/BatchProgress";

/**
 * @internal
 */
export interface glTFExtension {

    readonly name: string;

    loadTextures?(basePath: string, progress?: IBatchProgress): Promise<any>;

    createMaterial?(glTFMaterial: glTF.glTFMaterial): Material;

    /**
     * 
     * @param glTFMaterial 
     * @param material 
     * @return need default property apply
     */
    additionMaterialProperties?(glTFMaterial: glTF.glTFMaterial, material: Material): void;
}

