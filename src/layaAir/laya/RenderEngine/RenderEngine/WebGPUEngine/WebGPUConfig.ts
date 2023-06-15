/**
 * init webgpu option
 */
export class WebGPUConfig{
    /**
     * Defines the category of adapter to use.
     */
    powerPreference:GPUPowerPreference;
    /**
     * Defines the device descriptor used to create a device.
     */
    deviceDescriptor?: GPUDeviceDescriptor = {};
    /**
     * context params 
     */
    swapChainFormat?:GPUTextureFormat;
    /**
     * canvans alpha mode
     */
    alphaMode:GPUCanvasAlphaMode = "premultiplied";
    /**
     * attach canvans usage
     */
    usage?: GPUTextureUsageFlags = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
    /**
     * color space
     */
    colorSpace? = "srgb" /* default="srgb" */;

    
}