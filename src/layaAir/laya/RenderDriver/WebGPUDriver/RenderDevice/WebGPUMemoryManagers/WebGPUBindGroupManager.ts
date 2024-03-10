export class WebGPUBindGroupManager {
    bindGroups: Map<string, GPUBindGroup[]>;

    constructor() {
        this.bindGroups = new Map();
    }

    addBindGroup(name: string, bindGroups: GPUBindGroup[]) {
        this.bindGroups.set(name, bindGroups);
    }

    getBindGroup(name: string) {
        return this.bindGroups.get(name);
    }
}