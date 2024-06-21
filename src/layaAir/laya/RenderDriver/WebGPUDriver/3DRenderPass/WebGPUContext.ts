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

    /**
     * 开始渲染（清空历史数据）
     */
    static startRender() {
        this.lastBundle = null;
        this.lastCommand = null;
        this.lastBundlePipeline = null;
        this.lastCommandPipeline = null;
        this.lastBundleGeometry = null;
        this.lastCommandGeometry = null;
    }

    /**
     * 清空上次打包数据
     */
    static clearLastBundle() {
        this.lastBundlePipeline = null;
        this.lastBundleGeometry = null;
    }

    /**
     * 清空上次命令数据
     */
    static clearLastCommand() {
        this.lastCommandPipeline = null;
        this.lastCommandGeometry = null;
    }

    /**
     * 设置打包管线
     * @param bundle 
     * @param pipeline 
     */
    static setBundlePipeline(bundle: WebGPURenderBundle, pipeline: GPURenderPipeline) {
        if (this.lastBundle !== bundle || this.lastBundlePipeline !== pipeline) {
            bundle.setPipeline(pipeline);
            if (this.lastBundle !== bundle)
                this.clearLastBundle();
            this.lastBundle = bundle;
            this.lastBundlePipeline = pipeline;
        }
    }

    /**
     * 设置命令管线
     * @param command 
     * @param pipeline 
     */
    static setCommandPipeline(command: WebGPURenderCommandEncoder, pipeline: GPURenderPipeline) {
        if (this.lastCommand !== command || this.lastCommandPipeline !== pipeline) {
            command.setPipeline(pipeline);
            if (this.lastCommand !== command)
                this.clearLastCommand();
            this.lastCommand = command;
            this.lastCommandPipeline = pipeline;
        }
    }

    /**
     * 设置打包几何数据
     * @param bundle 
     * @param geometry 
     */
    static applyBundleGeometry(bundle: WebGPURenderBundle, geometry: WebGPURenderGeometry) {
        let triangles = 0;
        if (this.lastBundle !== bundle || this.lastBundleGeometry !== geometry) {
            triangles += bundle.applyGeometry(geometry, true);
            if (this.lastBundle !== bundle)
                this.clearLastBundle();
            this.lastBundle = bundle;
            this.lastBundleGeometry = geometry;
        } else triangles += bundle.applyGeometry(geometry, false);
        return triangles;
    }

    /**
     * 设置打包几何数据（部分）
     * @param bundle 
     * @param geometry 
     * @param part 
     */
    static applyBundleGeometryPart(bundle: WebGPURenderBundle, geometry: WebGPURenderGeometry, part: number) {
        let triangles = 0;
        if (this.lastBundle !== bundle || this.lastBundleGeometry !== geometry) {
            triangles += bundle.applyGeometryPart(geometry, part, true);
            if (this.lastBundle !== bundle)
                this.clearLastBundle();
            this.lastBundle = bundle;
            this.lastBundleGeometry = geometry;
        } else triangles += bundle.applyGeometryPart(geometry, part, false);
        return triangles;
    }

    /**
     * 设置命令几何数据
     * @param command 
     * @param geometry 
     */
    static applyCommandGeometry(command: WebGPURenderCommandEncoder, geometry: WebGPURenderGeometry) {
        let triangles = 0;
        if (this.lastCommand !== command || this.lastCommandGeometry !== geometry) {
            triangles += command.applyGeometry(geometry, true);
            if (this.lastCommand !== command)
                this.clearLastCommand();
            this.lastCommand = command;
            this.lastCommandGeometry = geometry;
        } else triangles += command.applyGeometry(geometry, false);
        return triangles;
    }

    /**
     * 设置命令几何数据（部分）
     * @param command 
     * @param geometry 
     * @param part 
     */
    static applyCommandGeometryPart(command: WebGPURenderCommandEncoder, geometry: WebGPURenderGeometry, part: number) {
        let triangles = 0;
        if (this.lastCommand !== command || this.lastCommandGeometry !== geometry) {
            triangles += command.applyGeometryPart(geometry, part, true);
            if (this.lastCommand !== command)
                this.clearLastCommand();
            this.lastCommand = command;
            this.lastCommandGeometry = geometry;
        } else triangles += command.applyGeometryPart(geometry, part, false);
        return triangles;
    }
}