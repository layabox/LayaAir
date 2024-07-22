//https://github.com/greggman/webgpu-utils (参考)

import { TextureDimension } from "../../../../RenderEngine/RenderEnum/TextureDimension";
import { WebGPUInternalTex } from "../WebGPUInternalTex";
import { WebGPUTextureDimension, WebGPUTextureFormat } from "../WebGPUTextureContext";

function guessTextureBindingViewDimensionForTexture(texture: GPUTexture): GPUTextureViewDimension {
    switch (texture.dimension) {
        case '1d':
            return '1d';
        case '3d':
            return '3d';
        default:
        case '2d':
            return texture.depthOrArrayLayers > 1 ? '2d-array' : '2d';
    }
}

function getGPUTextureDescriptor(dimension: TextureDimension,
    width: number, height: number, format: WebGPUTextureFormat): GPUTextureDescriptor {
    const textureSize = {
        width,
        height,
        depthOrArrayLayers: 1,
    };
    let usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;

    let dimensionType: WebGPUTextureDimension;
    switch (dimension) {
        case TextureDimension.Tex2D:
        case TextureDimension.Cube:
        case TextureDimension.Texture2DArray:
            dimensionType = WebGPUTextureDimension.D2D;
            break;
        case TextureDimension.Tex3D:
            dimensionType = WebGPUTextureDimension.D3D;
            break;
        default:
            throw "DimensionType Unknown format";
    }
    const textureDescriptor: GPUTextureDescriptor = {
        size: textureSize,
        mipLevelCount: 1,
        sampleCount: 1,
        dimension: dimensionType,
        format,
        usage,
    }
    return textureDescriptor;
}

function getPremultiplyAlphaWGSL(textureBindingViewDimension: GPUTextureViewDimension) {
    let textureSnippet;
    let sampleSnippet;
    switch (textureBindingViewDimension) {
        case '2d':
            textureSnippet = 'texture_2d<f32>';
            sampleSnippet = 'textureSample(ourTexture, ourSampler, fsInput.texcoord)';
            break;
        case '2d-array':
            textureSnippet = 'texture_2d_array<f32>';
            sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              fsInput.texcoord,
              uni.layer)`;
            break;
        case 'cube':
            textureSnippet = 'texture_cube<f32>';
            sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              faceMat[uni.layer] * vec3f(fract(fsInput.texcoord), 1))`;
            break;
        case 'cube-array':
            textureSnippet = 'texture_cube_array<f32>';
            sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              faceMat[uni.layer] * vec3f(fract(fsInput.texcoord), 1), uni.layer)`;
            break;
        default:
            throw new Error(`unsupported view: ${textureBindingViewDimension}`);
    }

    return `
        const faceMat = array(
          mat3x3f( 0,  0,  -2,  0, -2,   0,  1,  1,   1),   // pos-x
          mat3x3f( 0,  0,   2,  0, -2,   0, -1,  1,  -1),   // neg-x
          mat3x3f( 2,  0,   0,  0,  0,   2, -1,  1,  -1),   // pos-y
          mat3x3f( 2,  0,   0,  0,  0,  -2, -1, -1,   1),   // neg-y
          mat3x3f( 2,  0,   0,  0, -2,   0, -1,  1,   1),   // pos-z
          mat3x3f(-2,  0,   0,  0, -2,   0,  1,  1,  -1));  // neg-z

        struct VSOutput {
          @builtin(position) position: vec4f,
          @location(0) texcoord: vec2f,
        };

        struct Uniforms {
          layer: f32,
          sx: f32,
          sy: f32,
          wx: f32,
          wy: f32,
        };

        @vertex fn vs(
          @builtin(vertex_index) vertexIndex : u32
        ) -> VSOutput {
          let pos1 = array<vec2f, 6>(
            vec2f(-1.0, 1.0),
            vec2f(1.0, 1.0),
            vec2f(-1.0, -1.0),
            vec2f(1.0, 1.0),
            vec2f(1.0, -1.0),
            vec2f(-1.0, -1.0),
          );

          let pos2 = array<vec2f, 6>(
            vec2f(uni.sx, uni.sy),
            vec2f(uni.sx + uni.wx, uni.sy),
            vec2f(uni.sx, uni.sy + uni.wy),
            vec2f(uni.sx + uni.wx, uni.sy),
            vec2f(uni.sx + uni.wx, uni.sy + uni.wy),
            vec2f(uni.sx, uni.sy + uni.wy),
          );

          var vsOutput: VSOutput;
          let xy1 = pos1[vertexIndex];
          let xy2 = pos2[vertexIndex];
          vsOutput.position = vec4f(xy1, 0.0, 1.0);
          vsOutput.texcoord = xy2 * vec2f(0.5) + vec2f(0.5);
          return vsOutput;
        }

        @group(0) @binding(0) var ourSampler: sampler;
        @group(0) @binding(1) var ourTexture: ${textureSnippet};
        @group(0) @binding(2) var<uniform> uni: Uniforms;

        @fragment fn fs(fsInput: VSOutput) -> @location(0) vec4f {
          _ = uni.layer; //make sure this is used so all pipelines have the same bindings
          let c = ${sampleSnippet};
          let r = c.x * c.w;
          let g = c.y * c.w;
          let b = c.z * c.w;
          let a = c.w;
          return vec4f(r, g, b, a);
        }
      `;
}

// Use a WeakMap so the device can be destroyed and/or lost
const byDevice = new WeakMap();

/**
 * 对贴图中的像素做预乘处理
 *
 * @param device A GPUDevice
 * @param tex The texture to premultiply Alpha
 * @param xOffset horizon offset
 * @param yOffset vertical offset
 * @param width 
 * @param height 
 */
export function doPremultiplyAlpha(device: GPUDevice, tex: WebGPUInternalTex,
    xOffset: number, yOffset: number, width: number, height: number) {
    const texture = tex.resource;
    const tw = texture.width;
    const th = texture.height;
    const sx = -1.0 + xOffset / tw * 2.0;
    const sy = -1.0 + yOffset / th * 2.0;
    const wx = width / tw * 2.0;
    const wy = height / th * 2.0;
    const textureDescriptor = getGPUTextureDescriptor(tex.dimension, width, height, tex._webGPUFormat);
    const textureTemp = device.createTexture(textureDescriptor); //创建一个临时贴图
    let perDeviceInfo = byDevice.get(device);
    if (!perDeviceInfo) {
        perDeviceInfo = {
            pipelineByFormatAndView: {},
            moduleByViewType: {},
        };
        byDevice.set(device, perDeviceInfo);
    }
    let {
        sampler,
        uniformBuffer,
        uniformValues,
    } = perDeviceInfo;
    const {
        pipelineByFormatAndView,
        moduleByViewType,
    } = perDeviceInfo;
    const textureBindingViewDimension = guessTextureBindingViewDimensionForTexture(texture);
    let module = moduleByViewType[textureBindingViewDimension];
    if (!module) {
        const code = getPremultiplyAlphaWGSL(textureBindingViewDimension);
        module = device.createShaderModule({
            label: `premultiplyAlpha for ${textureBindingViewDimension}`,
            code,
        });
        moduleByViewType[textureBindingViewDimension] = module;
    }

    if (!sampler) {
        sampler = device.createSampler({
            minFilter: 'linear',
            magFilter: 'linear',
        });
        uniformBuffer = device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        uniformValues = new Float32Array(8);
        Object.assign(perDeviceInfo, { sampler, uniformBuffer, uniformValues });
    }

    const id = `${texture.format}.${textureBindingViewDimension}`;
    if (!pipelineByFormatAndView[id]) {
        pipelineByFormatAndView[id] = device.createRenderPipeline({
            label: `premultiplyAlpha for ${textureBindingViewDimension}`,
            layout: 'auto',
            vertex: {
                module,
                entryPoint: 'vs',
            },
            fragment: {
                module,
                entryPoint: 'fs',
                targets: [{ format: texture.format }],
            },
        });
    }
    const pipeline = pipelineByFormatAndView[id];

    uniformValues[1] = sx;
    uniformValues[2] = sy;
    uniformValues[3] = wx;
    uniformValues[4] = wy;

    for (let baseArrayLayer = 0; baseArrayLayer < texture.depthOrArrayLayers; ++baseArrayLayer) {
        uniformValues[0] = baseArrayLayer;
        device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                {
                    binding: 1,
                    resource: texture.createView({
                        dimension: textureBindingViewDimension,
                        baseMipLevel: 0,
                        mipLevelCount: 1,
                    }),
                },
                { binding: 2, resource: { buffer: uniformBuffer } },
            ],
        });

        const renderPassDescriptor: GPURenderPassDescriptor = {
            label: 'premultiAlpha renderPass',
            colorAttachments: [
                {
                    view: textureTemp.createView({
                        dimension: '2d',
                        baseMipLevel: 0,
                        mipLevelCount: 1,
                        baseArrayLayer,
                        arrayLayerCount: 1,
                    }),
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        const encoder = device.createCommandEncoder({
            label: 'premultiAlpha encoder',
        });

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(6);
        pass.end();

        encoder.copyTextureToTexture(
            { texture: textureTemp },
            { texture, origin: { x: xOffset, y: yOffset } },
            { width, height, depthOrArrayLayers: 1 }
        );

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
}