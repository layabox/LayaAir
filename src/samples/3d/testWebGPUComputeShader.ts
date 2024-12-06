// import { Matrix4x4 } from "laya/maths/Matrix4x4";
// import { Vector3 } from "laya/maths/Vector3";
// import { HTMLCanvas } from "laya/resource/HTMLCanvas";
// import { Browser } from "laya/utils/Browser";

// export class webGPUComputeShaderTest {
//     constructor() {
//         console.log("test WebGPUCompute");
//         this.testIndirectDraw();
//     }

//     private getGPUContext(width: number, height: number, device: GPUDevice) {
//         let mainCanv = Browser.mainCanvas = new HTMLCanvas(true);
//         let style: any = mainCanv.source.style;
//         style.position = 'absolute';
//         style.top = style.left = "0px";
//         style.background = "#000000";

//         let context = mainCanv.getContext('webgpu') as any as GPUCanvasContext;
//         mainCanv.width = width;
//         mainCanv.height = height;
//         const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
//         context.configure({
//             device,
//             format: presentationFormat
//         });
//         return context;
//     }
//     //测试computeShader 数据乘以2
//     async testDoubleScaleData() {
//         //init
//         let adapter = await navigator.gpu?.requestAdapter();
//         let device = await adapter.requestDevice();

//         //create compute shader
//         let computeCode = `
//             @group(0) @binding(0) var<storage,read_write> data:array<f32>;
//             @compute @workgroup_size(1) fn computeDoubleMulData(
//                 @builtin(global_invocation_id) id: vec3u
//             ){
//                 let i = id.x;
//                 data[i] = data[i] * 2.0;
//             }`;
//         let shaderModule = device.createShaderModule({
//             label: "computeShader",
//             code: computeCode
//         })

//         //create GPUComputePipeLine
//         let bindgroupLayoutDes: GPUBindGroupLayoutDescriptor = {
//             entries: [
//                 {
//                     binding: 0,
//                     visibility: GPUShaderStage.COMPUTE,
//                     buffer: {
//                         type: "storage"
//                     }
//                 }
//             ]
//         }
//         let bindgroupLayout: GPUBindGroupLayout = device.createBindGroupLayout(bindgroupLayoutDes);
//         let pipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
//             label: "storage data",
//             bindGroupLayouts: [
//                 bindgroupLayout
//             ]

//         }
//         let pipelineLayout: GPUPipelineLayout = device.createPipelineLayout(pipelineLayoutDesc);
//         let computePipeLin = device.createComputePipeline({
//             label: "pipeline",
//             layout: pipelineLayout,
//             compute: {
//                 module: shaderModule,
//                 entryPoint: "computeDoubleMulData"
//             }
//         });

//         //create storage Buffer
//         let input = new Float32Array([1, 3, 5]);
//         let workBuffer = device.createBuffer({
//             size: input.byteLength,
//             usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
//         })
//         device.queue.writeBuffer(workBuffer, 0, input);

//         // create resoult Buffer
//         let resultBuffer = device.createBuffer({
//             label: 'result buffer',
//             size: input.byteLength,
//             usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
//         });

//         const bindGroup = device.createBindGroup({
//             label: 'bindGroup for work buffer',
//             layout: bindgroupLayout,
//             entries: [
//                 { binding: 0, resource: { buffer: workBuffer } },
//             ],
//         });

//         //draw
//         // Encode commands to do the computation
//         let encoder = device.createCommandEncoder({
//             label: 'doubling encoder',
//         });
//         let computepass = encoder.beginComputePass({
//             label: 'doubling compute pass',
//         })
//         computepass.setPipeline(computePipeLin);
//         computepass.setBindGroup(0, bindGroup);
//         computepass.dispatchWorkgroups(input.length)

//         //compute工作组大小在Shader中定义  @workgroup_size(3, 4, 2)
//         //local_invocation_id 是workgroup里面的线程id
//         //要调用多少个compute工作组，在computepass中定义dispatchWorkgroups(1,1,1);
//         //compute shader中的 workgroup_id是dispatchWork的调用组ID
//         //global_invocation_id：每个线程的唯一id
//         //global_invocation_id = workgroup_id * workgroup_size + local_invocation_id
//         //num_workgroups 工作组的数量
//         //local_invocation_index:另外一种线程ID的算法
//         computepass.end();
//         encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
//         let commaneBuffer = encoder.finish();
//         device.queue.submit([commaneBuffer]);
//         await resultBuffer.mapAsync(GPUMapMode.READ);
//         let resoultArray = new Float32Array(resultBuffer.getMappedRange());
//         console.log("input", input);
//         console.log("result", resoultArray);
//         resultBuffer.unmap();
//         console.log("result", resoultArray);
//     }

//     //测试双向排序。
//     async testGPUBitonicSort() {
//         //init
//         let adapter = await navigator.gpu?.requestAdapter();
//         let device = await adapter.requestDevice();

//         let generateComputeCode = `

//             struct uboData {
//                 _DataLength: i32,
//                 _SignLength: i32,
//                 _CompareLength: i32
//             }

//           @group(0) @binding(0) var<storage,read_write> dataBuffer:array<i32>;
//           @group(1) @binding(0) var<uniform> data:uboData;

//           @compute @workgroup_size(16,16,1) 
//           fn generateBitonic(
//           @builtin(local_invocation_index) lid:u32
//         ){
//             var index =i32(lid) ;
//             if(index>=data._DataLength){
//                 return;
//             }
               
//             let sign =f32( (index / data._SignLength) % 2);
//             let vaild = (index / data._CompareLength) % 2;
//             if (vaild != 0) {
//                 return;
//             }
            
//             let a = f32(dataBuffer[index]) ;
//             let b = f32(dataBuffer[index + data._CompareLength]);
//             let max_value = max(a, b);
//             let min_value = min(a, b);

//             //use 'lerp' to assign value.
//             dataBuffer[index] =i32(mix(min_value, max_value, sign)) ;//不支持i32 只支持f16 f32
//             dataBuffer[index + data._CompareLength] = i32(mix(max_value, min_value, sign));
//         }`;

//         let sortComputeCode = `

//             struct uboData {
//                 _DataLength: i32,
//                 _SignLength: i32,
//                 _CompareLength: i32
//             }
//             @group(0) @binding(0) var<storage,read_write> dataBuffer:array<i32>;
//             @group(1) @binding(0) var<uniform> data:uboData;
//             @compute @workgroup_size(16,16,1) fn Sort(
//             @builtin(local_invocation_index) lid:u32
//             ){
//                 let index =i32(lid) ;
//                 if(index>=data._DataLength){
//                     return;
//                 }
                   
//                 let valid = (index / data._CompareLength) % 2;
//                 if (valid != 0) {
//                   return;
//                 }
                  
//                 let a = dataBuffer[index];
//                 let b = dataBuffer[index + data._CompareLength];

//                 dataBuffer[index] = min(a, b);
//                 dataBuffer[index + data._CompareLength] = max(a, b);
//             }
//          `;
//         let generateBitonicModule = device.createShaderModule({
//             label: "generateBitonModule",
//             code: generateComputeCode
//         });

//         let sortModule = device.createShaderModule({
//             label: "Sort",
//             code: sortComputeCode
//         });

//         //create storage Buffer
//         let bindgroupLayoutDes: GPUBindGroupLayoutDescriptor = {
//             entries: [
//                 {
//                     binding: 0,
//                     visibility: GPUShaderStage.COMPUTE,
//                     buffer: {
//                         type: "storage"
//                     }
//                 }
//             ]
//         }
//         let bindgroupLayout: GPUBindGroupLayout = device.createBindGroupLayout(bindgroupLayoutDes);
//         //other uniform bindGroupLayout
//         let otherBindGroupLayoutDes: GPUBindGroupLayoutDescriptor = {
//             entries: [
//                 {
//                     binding: 0,
//                     visibility: GPUShaderStage.COMPUTE,
//                     buffer: {
//                         type: "uniform"
//                     }
//                 }
//             ]
//         };
//         let otherUniformBindGroupLayout: GPUBindGroupLayout = device.createBindGroupLayout(otherBindGroupLayoutDes);

//         //generate compute pipeline
//         let generatePipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
//             label: "generate data",
//             bindGroupLayouts: [
//                 bindgroupLayout,
//                 otherUniformBindGroupLayout
//             ]

//         }
//         let generatePipelineLayout: GPUPipelineLayout = device.createPipelineLayout(generatePipelineLayoutDesc);

//         let generatePipeline: GPUComputePipeline = device.createComputePipeline({
//             label: "generate pipeline",
//             layout: generatePipelineLayout,
//             compute: {
//                 module: generateBitonicModule,
//                 entryPoint: "generateBitonic"
//             }
//         });

//         //generate sort compute pipeline
//         let sortPipelineLayourDesc: GPUPipelineLayoutDescriptor = {
//             label: "sort data",
//             bindGroupLayouts: [
//                 bindgroupLayout,
//                 otherUniformBindGroupLayout
//             ]
//         }

//         let sortPipelineLayout: GPUPipelineLayout = device.createPipelineLayout(sortPipelineLayourDesc);


//         let sortPipeline: GPUComputePipeline = device.createComputePipeline({
//             label: "sort pipeline",
//             layout: sortPipelineLayout,
//             compute: {
//                 module: sortModule,
//                 entryPoint: "Sort"
//             }
//         });

//         //create storage Buffer & sort Buffer
//         let sortLength = 64;
//         let input = new Int32Array(sortLength);

//         let dataBuffer = device.createBuffer({
//             size: input.byteLength,
//             usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
//         })

//         // create resoult Buffer
//         let resultBuffer = device.createBuffer({
//             label: 'result buffer',
//             size: input.byteLength,
//             usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
//         });

//         const bindGroup = device.createBindGroup({
//             label: 'bindGroup for work buffer',
//             layout: bindgroupLayout,
//             entries: [
//                 { binding: 0, resource: { buffer: dataBuffer } },
//             ],
//         });

//         //插入一堆的随机数字
//         for (var i = 0; i < input.length; i++) {
//             input[i] = (Math.random() * 1000) | 0;
//         }
//         device.queue.writeBuffer(dataBuffer, 0, input);
//         console.log(input);

//         const generateSortUniform = {};
//         //create all uniformBuffer bindGroup
//         {
//             let setArray = new Int32Array(1);
//             var signLength = 2;
//             while (signLength < sortLength) {
//                 var compareLength = signLength / 2;
//                 if (!generateSortUniform[signLength]) {
//                     generateSortUniform[signLength] = {};
//                 }

//                 while (compareLength > 0) {
//                     if (!generateSortUniform[signLength][compareLength]) {
//                         let ubuffer = device.createBuffer({
//                             size: 16,
//                             usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
//                         })
//                         let data = new Int32Array([sortLength, signLength, compareLength, 0]);
//                         device.queue.writeBuffer(ubuffer, 0, data);
//                         let uniformBindGroup = device.createBindGroup({
//                             layout: otherUniformBindGroupLayout,
//                             entries: [
//                                 { binding: 0, resource: { buffer: ubuffer } },
//                             ],
//                         });
//                         generateSortUniform[signLength][compareLength] = uniformBindGroup;
//                     }

//                     compareLength = Math.floor(compareLength / 2);
//                 }
//                 signLength *= 2;
//             }


//             var compareLength = Math.floor(sortLength / 2);
//             generateSortUniform[0] = {};
//             while (compareLength != 0) {
//                 if (!generateSortUniform[0][compareLength]) {
//                     let ubuffer = device.createBuffer({
//                         size: 16,
//                         usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
//                     })
//                     let data = new Int32Array([sortLength, 0, compareLength, 0]);
//                     device.queue.writeBuffer(ubuffer, 0, data);
//                     let uniformBindGroup = device.createBindGroup({
//                         layout: otherUniformBindGroupLayout,
//                         entries: [
//                             { binding: 0, resource: { buffer: ubuffer } },
//                         ],
//                     });
//                     generateSortUniform[0][compareLength] = uniformBindGroup;
//                 }
//                 compareLength = Math.floor(compareLength / 2);
//             }

//         }


//         //dispatch
//         //generat sort
//         let encoder = device.createCommandEncoder({
//             label: 'encoder',
//         });
//         let generateSortcomputepass = encoder.beginComputePass({
//             label: 'generateSortcomputepass',
//         })
//         generateSortcomputepass.setPipeline(generatePipeline);
//         generateSortcomputepass.setBindGroup(0, bindGroup);
//         //generate computeBuffer
//         {
//             var signLength = 2;
//             while (signLength < sortLength) {
//                 var compareLength = Math.floor(signLength / 2);
//                 while (compareLength > 0) {
//                     generateSortcomputepass.setBindGroup(1, generateSortUniform[signLength][compareLength]);
//                     generateSortcomputepass.dispatchWorkgroups(1, 1, 1);


//                     compareLength = Math.floor(compareLength / 2);
//                 }
//                 signLength *= 2;
//             }
//         }
//         generateSortcomputepass.setPipeline(sortPipeline);
//         generateSortcomputepass.setBindGroup(0, bindGroup);
//         {
//             var compareLength = sortLength / 2;
//             while (compareLength != 0) {
//                 generateSortcomputepass.setBindGroup(1, generateSortUniform[0][compareLength]);
//                 generateSortcomputepass.dispatchWorkgroups(1, 1, 1);
//                 compareLength = Math.floor(compareLength / 2);
//             }
//         }
//         generateSortcomputepass.end();
//         encoder.copyBufferToBuffer(dataBuffer, 0, resultBuffer, 0, resultBuffer.size);
//         let commaneBuffer = encoder.finish();
//         device.queue.submit([commaneBuffer]);
//         await resultBuffer.mapAsync(GPUMapMode.READ);
//         let resoultArray = new Int32Array(resultBuffer.getMappedRange());
//         console.log(resoultArray);
//         resultBuffer.unmap();
//     }



//     //cube Data

//     private objCache:any = {};
//     async testIndirectDraw() {
//         //init
//         let adapter = await navigator.gpu?.requestAdapter();
//         let device =this.objCache.device = await adapter.requestDevice();
//         console.log("webgpu Start");
//         let cavansWidth = 500;
//         let cavansHeight = 500;
//         let context = this.getGPUContext(cavansWidth, cavansHeight, device);

//         let cubeVertex = device.createBuffer({
//             size: cubeData.cubeVertexArray.byteLength,
//             usage: GPUBufferUsage.VERTEX,
//             mappedAtCreation: true
//         });
//         new Float32Array(cubeVertex.getMappedRange()).set(cubeData.cubeVertexArray);
//         cubeVertex.unmap();

//         let vertex_wgsl = `
//         struct Uniforms {
//             modelViewProjectionMatrix : mat4x4f,
//         }
//             @binding(0) @group(0) var<uniform> uniforms : Uniforms;

//         struct VertexOutput {
//             @builtin(position) Position : vec4f,
//             @location(0) fragUV : vec2f,
//             @location(1) fragPosition: vec4f,
//         }

//         @vertex
//         fn main(
//             @location(0) position : vec4f,
//             @location(1) uv : vec2f
//         ) -> VertexOutput {
//             var output : VertexOutput;
//             output.Position = uniforms.modelViewProjectionMatrix * position;
//             output.fragUV = uv;
//             output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
//             return output;
//         }
//         `;
//         let frag_wgsl = `
//         @fragment
//         fn main(
//             @location(0) fragUV: vec2f,
//             @location(1) fragPosition: vec4f
//         ) -> @location(0) vec4f {
//             return fragPosition;
//         }
//         `;

//         let pipeline = device.createRenderPipeline({
//             layout: 'auto',
//             vertex: {
//                 module: device.createShaderModule({
//                     code: vertex_wgsl,
//                 }),
//                 buffers: [
//                     {
//                         arrayStride: cubeData.cubeVertexSize,
//                         attributes: [
//                             {
//                                 // position
//                                 shaderLocation: 0,
//                                 offset: cubeData.cubePositionOffset,
//                                 format: 'float32x4',
//                             },
//                             {
//                                 // uv
//                                 shaderLocation: 1,
//                                 offset: cubeData.cubeUVOffset,
//                                 format: 'float32x2',
//                             },
//                         ],
//                     },
//                 ],
//             },
//             fragment: {
//                 module: device.createShaderModule({
//                     code: frag_wgsl,
//                 }),
//                 targets: [
//                     {
//                         format: context.getCurrentTexture().format,
//                     },
//                 ],
//             },
//             primitive: {
//                 topology: 'triangle-list',

//                 // Backface culling since the cube is solid piece of geometry.
//                 // Faces pointing away from the camera will be occluded by faces
//                 // pointing toward the camera.
//                 cullMode: 'back',
//             },

//             // Enable depth testing so that the fragment closest to the camera
//             // is rendered in front.
//             depthStencil: {
//                 depthWriteEnabled: true,
//                 depthCompare: 'less',
//                 format: 'depth24plus',
//             },
//         });

//         const depthTexture = device.createTexture({
//             size: [cavansWidth, cavansHeight],
//             format: 'depth24plus',
//             usage: GPUTextureUsage.RENDER_ATTACHMENT,
//         });

//         const matrixSize = 4 * 16; // 4x4 matrix
//         const offset = 256; // uniformBindGroup offset must be 256-byte aligned
//         const uniformBufferSize = offset + matrixSize;

//         this.objCache.uniformBuffer = device.createBuffer({
//             size: uniformBufferSize,
//             usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//         });

//         //cube1 uniform
//         this.objCache.uniformBindGroup1 = device.createBindGroup({
//             layout: pipeline.getBindGroupLayout(0),
//             entries: [
//                 {
//                     binding: 0,
//                     resource: {
//                         buffer: this.objCache.uniformBuffer,
//                         offset: 0,
//                         size: matrixSize,
//                     },
//                 },
//             ],
//         });
//         //cube2 uniform
//         this.objCache.uniformBindGroup2 = device.createBindGroup({
//             layout: pipeline.getBindGroupLayout(0),
//             entries: [
//                 {
//                     binding: 0,
//                     resource: {
//                         buffer: this.objCache.uniformBuffer,
//                         offset: offset,
//                         size: matrixSize,
//                     },
//                 },
//             ],
//         });

//         this.objCache.renderPassDescriptor = {
//             colorAttachments: [
//                 {
//                     view: undefined, // Assigned later

//                     clearValue: [0.5, 0.5, 0.5, 1.0],
//                     loadOp: 'clear',
//                     storeOp: 'store',
//                 },
//             ],
//             depthStencilAttachment: {
//                 view: depthTexture.createView(),

//                 depthClearValue: 1.0,
//                 depthLoadOp: 'clear',
//                 depthStoreOp: 'store',
//             },
//         };
//         this.objCache.aspect = cavansWidth / cavansHeight;
//         this.objCache.projectionMatrix = new Matrix4x4();
//         Matrix4x4.createPerspective((2 * Math.PI) / 5, this.objCache.aspect, 1, 100.0, this.objCache.projectionMatrix);
//         this.objCache.modelMatrix1 = new Matrix4x4();
//         this.objCache.modelMatrix1.setPosition(new Vector3(-2, 0, 0));
//         this.objCache.modelMatrix2 = new Matrix4x4();
//         this.objCache.modelMatrix2.setPosition(new Vector3(-2, 0, 0));


//         this.objCache.modelViewProjectionMatrix1 = new Matrix4x4();
//         this.objCache.modelViewProjectionMatrix2 = new Matrix4x4();

//         this.objCache.viewMatrix = new Matrix4x4();
//         this.objCache.viewMatrix.setPosition(new Vector3(0, 0, -7));
//         this.objCache.tmpMat41 = new Matrix4x4();
//         this.objCache.tmpMat42 = new Matrix4x4();
//     }

//     testIndirectDraw_updateTransformationMatrix(){
//         const now = Date.now() / 1000;
    
    
//         this.objCache.device.queue.writeBuffer(
//             this.objCache.uniformBuffer,
//             0,
//             modelViewProjectionMatrix1.buffer,
//             modelViewProjectionMatrix1.byteOffset,
//             modelViewProjectionMatrix1.byteLength
//           );
//           this.objCache.device.queue.writeBuffer(
//             uniformBuffer,
//             offset,
//             modelViewProjectionMatrix2.buffer,
//             modelViewProjectionMatrix2.byteOffset,
//             modelViewProjectionMatrix2.byteLength
//           );
      
//     }

//     testIndirectDraw_Frame(){
//         this.testIndirectDraw_updateTransformationMatrix();
//     }


// }

// class cubeData {
//     static cubeVertexSize: number = 4 * 10; // Byte size of one cube vertex.
//     static cubePositionOffset: number = 0;
//     static cubeColorOffset: number = 4 * 4; // Byte offset of cube vertex color attribute.
//     static cubeUVOffset: number = 4 * 8;
//     static cubeVertexCount = 36;

//     static cubeVertexArray = new Float32Array([
//         // float4 position, float4 color, float2 uv,
//         1, -1, 1, 1, 1, 0, 1, 1, 0, 1,
//         -1, -1, 1, 1, 0, 0, 1, 1, 1, 1,
//         -1, -1, -1, 1, 0, 0, 0, 1, 1, 0,
//         1, -1, -1, 1, 1, 0, 0, 1, 0, 0,
//         1, -1, 1, 1, 1, 0, 1, 1, 0, 1,
//         -1, -1, -1, 1, 0, 0, 0, 1, 1, 0,

//         1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
//         1, -1, 1, 1, 1, 0, 1, 1, 1, 1,
//         1, -1, -1, 1, 1, 0, 0, 1, 1, 0,
//         1, 1, -1, 1, 1, 1, 0, 1, 0, 0,
//         1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
//         1, -1, -1, 1, 1, 0, 0, 1, 1, 0,

//         -1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
//         1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
//         1, 1, -1, 1, 1, 1, 0, 1, 1, 0,
//         -1, 1, -1, 1, 0, 1, 0, 1, 0, 0,
//         -1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
//         1, 1, -1, 1, 1, 1, 0, 1, 1, 0,

//         -1, -1, 1, 1, 0, 0, 1, 1, 0, 1,
//         -1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
//         -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,
//         -1, -1, -1, 1, 0, 0, 0, 1, 0, 0,
//         -1, -1, 1, 1, 0, 0, 1, 1, 0, 1,
//         -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,

//         1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
//         -1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
//         -1, -1, 1, 1, 0, 0, 1, 1, 1, 0,
//         -1, -1, 1, 1, 0, 0, 1, 1, 1, 0,
//         1, -1, 1, 1, 1, 0, 1, 1, 0, 0,
//         1, 1, 1, 1, 1, 1, 1, 1, 0, 1,

//         1, -1, -1, 1, 1, 0, 0, 1, 0, 1,
//         -1, -1, -1, 1, 0, 0, 0, 1, 1, 1,
//         -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,
//         1, 1, -1, 1, 1, 1, 0, 1, 0, 0,
//         1, -1, -1, 1, 1, 0, 0, 1, 0, 1,
//         -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,
//     ]);

// }