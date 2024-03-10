export class WebGPUPipelineManager {
    pipelines: Map<string, GPURenderPipeline>;

    constructor() {
        this.pipelines = new Map();
    }

    addPipeline(name: string, pipeline: GPURenderPipeline) {
        this.pipelines.set(name, pipeline);
    }

    getPipeline(name: string) {
        return this.pipelines.get(name);
    }
}