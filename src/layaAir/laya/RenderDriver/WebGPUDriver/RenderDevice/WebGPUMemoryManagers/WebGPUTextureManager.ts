export class TextureBuffer {
    name: string;
    set: number;
    binding: number;

    private _gpu_BindGroupEntry: GPUBindGroupEntry;

    constructor(name: string, set: number, binding: number, texture: GPUTexture) {
        this.name = name;
        this.set = set;
        this.binding = binding;

        this._gpu_BindGroupEntry = {
            binding,
            resource: texture.createView(),
        };
    }

    /**
     * 获取WebGPU绑定资源入口
     */
    getGPUBindEntry() {
        return this._gpu_BindGroupEntry;
    }
}

export class WebGPUTextureManager {
    
}