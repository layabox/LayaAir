export class WebGPUVertexManager {
    device: GPUDevice;
    vertices: Map<string, GPUBuffer>;
    indices: Map<string, GPUBuffer>;

    constructor(device: GPUDevice) {
        this.device = device;
        this.vertices = new Map();
        this.indices = new Map();
    }

    addVertex(name:string, vertex: GPUBuffer) {
        this.vertices.set(name, vertex);
    }

    getVertex(name: string) {
        return this.vertices.get(name);
    }
}