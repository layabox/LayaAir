import * as glTF from "../glTFInterface";

import { Material } from "../../d3/core/material/Material";

import { IBatchProgress } from "../../net/BatchProgress";
import { Texture2D } from "../../resource/Texture2D";

/**
 * @internal
 */
export interface glTFExtension {

    readonly name: string;

    loadExtensionTextureInfo?(info: glTF.glTFTextureInfo): any;

    /**
     * 加载附加纹理
     * @param basePath 
     * @param progress 
     */
    loadAdditionTextures?(basePath: string, progress?: IBatchProgress): Promise<Texture2D | void>;

    createMaterial?(glTFMaterial: glTF.glTFMaterial): Material;

    /**
     * 
     * @param glTFMaterial 
     * @param material 
     * @return need default property apply
     */
    additionMaterialProperties?(glTFMaterial: glTF.glTFMaterial, material: Material): void;
}

