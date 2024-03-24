import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";

/**
 * WebGPU全局上下文
 */
export class WebGPUContext {
    static lastBundle: WebGPURenderBundle = null;
    static lastCommand: WebGPURenderCommandEncoder = null;
    static lastBundlePipeline: GPURenderPipeline = null;
    static lastCommandPipeline: GPURenderPipeline = null;
    static lastBundleGeometry: WebGPURenderGeometry = null;
    static lastCommandGeometry: WebGPURenderGeometry = null;

    static startRender() {
        this.lastBundle = null;
        this.lastCommand = null;
        this.lastBundlePipeline = null;
        this.lastCommandPipeline = null;
        this.lastBundleGeometry = null;
        this.lastCommandGeometry = null;
    }

    static clearLastBundle() {
        this.lastBundlePipeline = null;
        this.lastBundleGeometry = null;
    }

    static clearLastCommand() {
        this.lastCommandPipeline = null;
        this.lastCommandGeometry = null;
    }

    static setBundlePipeline(bundle: WebGPURenderBundle, pipeline: GPURenderPipeline) {
        if (this.lastBundle !== bundle || this.lastBundlePipeline !== pipeline) {
            bundle.setPipeline(pipeline);
            if (this.lastBundle !== bundle)
                this.clearLastBundle();
            this.lastBundle = bundle;
            this.lastBundlePipeline = pipeline;
        }
    }

    static setCommandPipeline(command: WebGPURenderCommandEncoder, pipeline: GPURenderPipeline) {
        if (this.lastCommand !== command || this.lastCommandPipeline !== pipeline) {
            command.setPipeline(pipeline);
            if (this.lastCommand !== command)
                this.clearLastCommand();
            this.lastCommand = command;
            this.lastCommandPipeline = pipeline;
        }
    }

    static applyBundleGeometry(bundle: WebGPURenderBundle, geometry: WebGPURenderGeometry) {
        if (this.lastBundle !== bundle || this.lastBundleGeometry !== geometry) {
            bundle.applyGeometry(geometry, true);
            if (this.lastBundle !== bundle)
                this.clearLastBundle();
            this.lastBundle = bundle;
            this.lastBundleGeometry = geometry;
        } else bundle.applyGeometry(geometry, false);
    }

    static applyCommandGeometry(command: WebGPURenderCommandEncoder, geometry: WebGPURenderGeometry) {
        if (this.lastCommand !== command || this.lastCommandGeometry !== geometry) {
            command.applyGeometry(geometry, true);
            if (this.lastCommand !== command)
                this.clearLastCommand();
            this.lastCommand = command;
            this.lastCommandGeometry = geometry;
        } else command.applyGeometry(geometry, false);
    }
}