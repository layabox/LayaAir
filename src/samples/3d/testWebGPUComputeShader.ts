
export class webGPUComputeShaderTest {
    constructor() {
        console.log("test WebGPUCompute");
        this.testGPUBitonicSort();
    }
    //测试computeShader 数据乘以2
    async testDoubleScaleData() {
        //init
        let adapter = await navigator.gpu?.requestAdapter();
        let device = await adapter.requestDevice();

        //create compute shader
        let computeCode = `
            @group(0) @binding(0) var<storage,read_write> data:array<f32>;
            @compute @workgroup_size(1) fn computeDoubleMulData(
                @builtin(global_invocation_id) id: vec3u
            ){
                let i = id.x;
                data[i] = data[i] * 2.0;
            }`;
        let shaderModule = device.createShaderModule({
            label: "computeShader",
            code: computeCode
        })

        //create GPUComputePipeLine
        let bindgroupLayoutDes: GPUBindGroupLayoutDescriptor = {
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "storage"
                    }
                }
            ]
        }
        let bindgroupLayout: GPUBindGroupLayout = device.createBindGroupLayout(bindgroupLayoutDes);
        let pipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
            label: "storage data",
            bindGroupLayouts: [
                bindgroupLayout
            ]

        }
        let pipelineLayout: GPUPipelineLayout = device.createPipelineLayout(pipelineLayoutDesc);
        let computePipeLin = device.createComputePipeline({
            label: "pipeline",
            layout: pipelineLayout,
            compute: {
                module: shaderModule,
                entryPoint: "computeDoubleMulData"
            }
        });

        //create storage Buffer
        let input = new Float32Array([1, 3, 5]);
        let workBuffer = device.createBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(workBuffer, 0, input);

        // create resoult Buffer
        let resultBuffer = device.createBuffer({
            label: 'result buffer',
            size: input.byteLength,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        const bindGroup = device.createBindGroup({
            label: 'bindGroup for work buffer',
            layout: bindgroupLayout,
            entries: [
                { binding: 0, resource: { buffer: workBuffer } },
            ],
        });

        //draw
        // Encode commands to do the computation
        let encoder = device.createCommandEncoder({
            label: 'doubling encoder',
        });
        let computepass = encoder.beginComputePass({
            label: 'doubling compute pass',
        })
        computepass.setPipeline(computePipeLin);
        computepass.setBindGroup(0, bindGroup);
        computepass.dispatchWorkgroups(input.length)

        //compute工作组大小在Shader中定义  @workgroup_size(3, 4, 2)
        //local_invocation_id 是workgroup里面的线程id
        //要调用多少个compute工作组，在computepass中定义dispatchWorkgroups(1,1,1);
        //compute shader中的 workgroup_id是dispatchWork的调用组ID
        //global_invocation_id：每个线程的唯一id
        //global_invocation_id = workgroup_id * workgroup_size + local_invocation_id
        //num_workgroups 工作组的数量
        //local_invocation_index:另外一种线程ID的算法
        computepass.end();
        encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
        let commaneBuffer = encoder.finish();
        device.queue.submit([commaneBuffer]);
        await resultBuffer.mapAsync(GPUMapMode.READ);
        let resoultArray = new Float32Array(resultBuffer.getMappedRange());
        console.log("input", input);
        console.log("result", resoultArray);
        resultBuffer.unmap();
        console.log("result", resoultArray);
    }

    async testGPUBitonicSort() {
        //init
        let adapter = await navigator.gpu?.requestAdapter();
        let device = await adapter.requestDevice();

        let generateComputeCode = `

            struct uboData {
                _DataLength: i32,
                _SignLength: i32,
                _CompareLength: i32
            }

          @group(0) @binding(0) var<storage,read_write> dataBuffer:array<i32>;
          @group(1) @binding(0) var<uniform> data:uboData;

          @compute @workgroup_size(16,16,1) 
          fn generateBitonic(
          @builtin(local_invocation_index) lid:u32
        ){
            var index =i32(lid) ;
            if(index>=data._DataLength){
                return;
            }
               
            let sign =f32( (index / data._SignLength) % 2);
            let vaild = (index / data._CompareLength) % 2;
            if (vaild != 0) {
                return;
            }
            
            let a = f32(dataBuffer[index]) ;
            let b = f32(dataBuffer[index + data._CompareLength]);
            let max_value = max(a, b);
            let min_value = min(a, b);

            //use 'lerp' to assign value.
            dataBuffer[index] =i32(mix(min_value, max_value, sign)) ;//不支持i32 只支持f16 f32
            dataBuffer[index + data._CompareLength] = i32(mix(max_value, min_value, sign));
        }`;

        let sortComputeCode = `

            struct uboData {
                _DataLength: i32,
                _SignLength: i32,
                _CompareLength: i32
            }
            @group(0) @binding(0) var<storage,read_write> dataBuffer:array<i32>;
            @group(1) @binding(0) var<uniform> data:uboData;
            @compute @workgroup_size(16,16,1) fn Sort(
            @builtin(local_invocation_index) lid:u32
            ){
                let index =i32(lid) ;
                if(index>=data._DataLength){
                    return;
                }
                   
                let valid = (index / data._CompareLength) % 2;
                if (valid != 0) {
                  return;
                }
                  
                let a = dataBuffer[index];
                let b = dataBuffer[index + data._CompareLength];

                dataBuffer[index] = min(a, b);
                dataBuffer[index + data._CompareLength] = max(a, b);
            }
         `;
        let generateBitonicModule = device.createShaderModule({
            label: "generateBitonModule",
            code: generateComputeCode
        });

        let sortModule = device.createShaderModule({
            label: "Sort",
            code: sortComputeCode
        });

        //create storage Buffer
        let bindgroupLayoutDes: GPUBindGroupLayoutDescriptor = {
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "storage"
                    }
                }
            ]
        }
        let bindgroupLayout: GPUBindGroupLayout = device.createBindGroupLayout(bindgroupLayoutDes);
        //other uniform bindGroupLayout
        let otherBindGroupLayoutDes: GPUBindGroupLayoutDescriptor = {
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform"
                    }
                }
            ]
        };
        let otherUniformBindGroupLayout: GPUBindGroupLayout = device.createBindGroupLayout(otherBindGroupLayoutDes);

        //generate compute pipeline
        let generatePipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
            label: "generate data",
            bindGroupLayouts: [
                bindgroupLayout,
                otherUniformBindGroupLayout
            ]

        }
        let generatePipelineLayout: GPUPipelineLayout = device.createPipelineLayout(generatePipelineLayoutDesc);

        let generatePipeline: GPUComputePipeline = device.createComputePipeline({
            label: "generate pipeline",
            layout: generatePipelineLayout,
            compute: {
                module: generateBitonicModule,
                entryPoint: "generateBitonic"
            }
        });

        //generate sort compute pipeline
        let sortPipelineLayourDesc: GPUPipelineLayoutDescriptor = {
            label: "sort data",
            bindGroupLayouts: [
                bindgroupLayout,
                otherUniformBindGroupLayout
            ]
        }

        let sortPipelineLayout: GPUPipelineLayout = device.createPipelineLayout(sortPipelineLayourDesc);


        let sortPipeline: GPUComputePipeline = device.createComputePipeline({
            label: "sort pipeline",
            layout: sortPipelineLayout,
            compute: {
                module: sortModule,
                entryPoint: "Sort"
            }
        });

        //create storage Buffer & sort Buffer
        let sortLength = 64;
        let input = new Int32Array(sortLength);

        let dataBuffer = device.createBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        })

        // create resoult Buffer
        let resultBuffer = device.createBuffer({
            label: 'result buffer',
            size: input.byteLength,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        const bindGroup = device.createBindGroup({
            label: 'bindGroup for work buffer',
            layout: bindgroupLayout,
            entries: [
                { binding: 0, resource: { buffer: dataBuffer } },
            ],
        });

        //插入一堆的随机数字
        for (var i = 0; i < input.length; i++) {
            input[i] = (Math.random() * 1000) | 0;
        }
        device.queue.writeBuffer(dataBuffer, 0, input);
        console.log(input);

        const generateSortUniform = {};
        //create all uniformBuffer bindGroup
        {
            let setArray = new Int32Array(1);
            var signLength = 2;
            while (signLength < sortLength) {
                var compareLength = signLength / 2;
                if (!generateSortUniform[signLength]) {
                    generateSortUniform[signLength] = {};
                }

                while (compareLength > 0) {
                    if (!generateSortUniform[signLength][compareLength]) {
                        let ubuffer = device.createBuffer({
                            size: 16,
                            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                        })
                        let data = new Int32Array([sortLength, signLength, compareLength, 0]);
                        device.queue.writeBuffer(ubuffer, 0, data);
                        let uniformBindGroup = device.createBindGroup({
                            layout: otherUniformBindGroupLayout,
                            entries: [
                                { binding: 0, resource: { buffer: ubuffer } },
                            ],
                        });
                        generateSortUniform[signLength][compareLength] = uniformBindGroup;
                    }

                    compareLength = Math.floor(compareLength / 2);
                }
                signLength *= 2;
            }


            var compareLength = Math.floor(sortLength / 2);
            generateSortUniform[0] = {};
            while (compareLength != 0) {
                if (!generateSortUniform[0][compareLength]) {
                    let ubuffer = device.createBuffer({
                        size: 16,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                    })
                    let data = new Int32Array([sortLength, 0, compareLength, 0]);
                    device.queue.writeBuffer(ubuffer, 0, data);
                    let uniformBindGroup = device.createBindGroup({
                        layout: otherUniformBindGroupLayout,
                        entries: [
                            { binding: 0, resource: { buffer: ubuffer } },
                        ],
                    });
                    generateSortUniform[0][compareLength] = uniformBindGroup;
                }
                compareLength = Math.floor(compareLength / 2);
            }

        }


        //dispatch
        //generat sort
        let encoder = device.createCommandEncoder({
            label: 'encoder',
        });
        let generateSortcomputepass = encoder.beginComputePass({
            label: 'generateSortcomputepass',
        })
        generateSortcomputepass.setPipeline(generatePipeline);
        generateSortcomputepass.setBindGroup(0, bindGroup);
        //generate computeBuffer
        {
            var signLength = 2;
            while (signLength < sortLength) {
                var compareLength = Math.floor(signLength / 2);
                while (compareLength > 0) {
                    generateSortcomputepass.setBindGroup(1, generateSortUniform[signLength][compareLength]);
                    generateSortcomputepass.dispatchWorkgroups(1, 1, 1);


                    compareLength = Math.floor(compareLength / 2);
                }
                signLength *= 2;
            }
        }
        generateSortcomputepass.setPipeline(sortPipeline);
        generateSortcomputepass.setBindGroup(0, bindGroup);
        {
            var compareLength = sortLength / 2;
            while (compareLength != 0) {
                generateSortcomputepass.setBindGroup(1, generateSortUniform[0][compareLength]);
                generateSortcomputepass.dispatchWorkgroups(1, 1, 1);
                compareLength = Math.floor(compareLength / 2);
            }
        }
        generateSortcomputepass.end();
        encoder.copyBufferToBuffer(dataBuffer, 0, resultBuffer, 0, resultBuffer.size);
        let commaneBuffer = encoder.finish();
        device.queue.submit([commaneBuffer]);
        await resultBuffer.mapAsync(GPUMapMode.READ);
        let resoultArray = new Int32Array(resultBuffer.getMappedRange());
        console.log(resoultArray);
        resultBuffer.unmap();
    }
}