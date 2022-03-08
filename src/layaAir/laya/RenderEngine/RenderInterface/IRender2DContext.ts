export interface IRender2DContext {
    activeTexture(textureID: number): void;
    bindTexture(target: number, texture: any): void;
    bindUseProgram(webglProgram: any):boolean;
    





}