import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../../common/CameraMoveScript";
import { hybridSystemUtil, TestGCARender, testGCAShader } from "./TestUtil2";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { GCA_InsBatchAgent } from "../GCA_InsBatchAgent";
import { Quaternion } from "laya/maths/Quaternion";
import { GCA_OneBatchInfo } from "../GCA_OneBatchInfo";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { GCA_BaseFactory, GCA_Config } from "../GCA_Config";
import { QXLodLevel } from "./HyBridUtil";

export class GCASystemTest {
    private testSystem = new hybridSystemUtil();
    private testAgent: GCA_InsBatchAgent;
    private tempMatrix: Matrix4x4 = new Matrix4x4();

    // 动态减少测试相关变量
    private dynamicTestInstances: Array<Array<any>> = []; // 存储各个资源的实例数组
    private dynamicTestRunning: boolean = false;
    private lastReduceTime: number = 0;
    private reduceInterval: number = 100; // 减少间隔时间（毫秒）

    // LOD切换测试相关变量
    private lodTestInstances: Array<Array<any>> = []; // 存储LOD测试的实例数组
    private lodSwitchTimer: number = 0;
    private lodSwitchDelay: number = 10000; // 10秒延迟

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.hide();
            var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
            var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 500)));
            camera.transform.translate(new Vector3(-49.22597611084587, 32.18178779371752, 32.400060133440455));
            camera.transform.rotation = new Quaternion(-0.17967885879238119, -0.7626494012869607, -0.2389016021843756, 0.5735916865623546)
            camera.addComponent(CameraMoveScript);
            camera.clearColor = new Color(0.0, 0.0, 0.0, 1.0);
            console.log("test GCAAgent Demo");


            testGCAShader.initShader();
            this.testSystem._createMesh();
            this.testSystem._createMaterial();
            this.testSystem._creatResDatas();
            let sprite = scene.addChild(new Sprite3D());
            let baseRender = sprite.addComponent(TestGCARender);
            this.testAgent = baseRender._GCA_Agent;
            GCA_Config.init();
            GCA_Config.factory = new GCA_BaseFactory();
            {//set custom Data
                let customData = new Map();
                customData.set("color1", [0, ShaderDataType.Vector4])
                customData.set("color2", [1, ShaderDataType.Vector4])
                GCA_OneBatchInfo.setCustomCommandmap(customData);
            }
             this.changeLodTest();
            //this.testAddIns(5,1);
            //this.testMultipleResIns()
            // this.testDynamicReduce(); // 启动动态减少测试
            this.testLodLevelSwitch(); // 启动LOD级别切换测试
        });
    }

    //增加一种
    testAddIns(count: number, ycount: number) {
        for (var i = 0; i < count; i++) {
            let pos = new Vector3(i * 2, 0, 0);
            Matrix4x4.createAffineTransformation(pos, Quaternion.DEFAULT, Vector3.ONE, this.tempMatrix);
            let ins = this.testSystem._createIns(0, this.tempMatrix, true, true, true, 0, { color1: new Color(1, 0, 0, 1), color2: new Color(0, 1, 0, 1), customDataArray: new Float32Array([1, 0, 0, 1, 0, 1, 0, 1]) })
            this.testAgent.addIns(ins);
        }
    }

    changeLodTest() {
        // 测试创建十种不同资源的实例各十个
        this.testMultipleResIns();
    }

    /**
     * 测试创建十种不同的res实例各十个，整齐排列在场景中
     */
    testMultipleResIns() {
        const resCount = 10; // 十种不同的资源
        const instancesPerRes = 50; // 每种资源创建十个实例
        const spacing = 3; // 实例之间的间距

        // 生成不同的颜色用于区分不同的资源类型
        const colors = [
            new Color(1, 0, 0, 1),   // 红色
            new Color(0, 1, 0, 1),   // 绿色
            new Color(0, 0, 1, 1),   // 蓝色
            new Color(1, 1, 0, 1),   // 黄色
            new Color(1, 0, 1, 1),   // 品红
            new Color(0, 1, 1, 1),   // 青色
            new Color(1, 0.5, 0, 1), // 橙色
            new Color(0.5, 0, 1, 1), // 紫色
            new Color(1, 0.75, 0.8, 1), // 粉色
            new Color(0.5, 0.5, 0.5, 1)  // 灰色
        ];

        for (let resId = 0; resId < resCount; resId++) {
            for (let instanceId = 0; instanceId < resId * 5; instanceId++) {
                // 计算位置：resId决定x轴位置，instanceId决定z轴位置
                let pos = new Vector3(resId * spacing, 0, instanceId * spacing);

                // 创建变换矩阵
                Matrix4x4.createAffineTransformation(pos, Quaternion.DEFAULT, Vector3.ONE, this.tempMatrix);

                // 为每种资源类型分配不同的颜色
                let color1 = colors[resId];
                let color2 = new Color(1 - color1.r, 1 - color1.g, 1 - color1.b, 1); // 互补色

                // 创建自定义数据数组，根据资源ID和实例ID生成不同的颜色值
                let customDataArray = new Float32Array([
                    color1.r, color1.g, color1.b, color1.a,
                    color2.r, color2.g, color2.b, color2.a
                ]);

                // 创建实例
                let ins = this.testSystem._createIns(
                    resId % 10, // 使用不同的资源ID (0-9)
                    this.tempMatrix,
                    true,
                    true,
                    true,
                    0,
                    {
                        color1: color1,
                        color2: color2,
                        customDataArray: customDataArray
                    }
                );

                // 添加到代理中
                this.testAgent.addIns(ins);
            }
        }

        console.log(`创建了${resCount}种不同资源，每种${instancesPerRes}个实例，总共${resCount * instancesPerRes}个实例`);
    }

    /**
     * 动态减少测试：生成五个资源各50个实例，然后每帧减少直到减少为1
     */
    testDynamicReduce() {
        this.dynamicTestInstances = [[], [], [], [], []]; // 五个资源的实例数组
        this.dynamicTestRunning = true;
        this.lastReduceTime = Date.now();

        const resCount = 5; // 五种不同的资源
        const instancesPerRes = 50; // 每种资源创建50个实例
        const spacing = 4; // 实例之间的间距

        // 生成不同的颜色用于区分不同的资源类型
        const colors = [
            new Color(1, 0, 0, 1),   // 红色
            new Color(0, 1, 0, 1),   // 绿色
            new Color(0, 0, 1, 1),   // 蓝色
            new Color(1, 1, 0, 1),   // 黄色
            new Color(1, 0, 1, 1),   // 品红
        ];

        console.log("开始动态减少测试：创建5种资源，每种50个实例");

        for (let resId = 0; resId < resCount; resId++) {
            for (let instanceId = 0; instanceId < instancesPerRes; instanceId++) {
                // 计算位置：resId决定x轴位置，instanceId决定z轴位置
                let pos = new Vector3(resId * spacing, 0, instanceId * spacing);

                // 创建变换矩阵
                Matrix4x4.createAffineTransformation(pos, Quaternion.DEFAULT, Vector3.ONE, this.tempMatrix);

                // 为每种资源类型分配不同的颜色
                let color1 = colors[resId];
                let color2 = new Color(1 - color1.r, 1 - color1.g, 1 - color1.b, 1); // 互补色

                // 创建自定义数据数组
                let customDataArray = new Float32Array([
                    color1.r, color1.g, color1.b, color1.a,
                    color2.r, color2.g, color2.b, color2.a
                ]);

                // 创建实例
                let ins = this.testSystem._createIns(
                    resId, // 使用不同的资源ID (0-4)
                    this.tempMatrix,
                    true,
                    true,
                    true,
                    0,
                    {
                        color1: color1,
                        color2: color2,
                        customDataArray: customDataArray
                    }
                );

                // 添加到代理中
                this.testAgent.addIns(ins);

                // 存储到动态测试数组中
                this.dynamicTestInstances[resId].push(ins);
            }
        }

        console.log(`动态测试初始化完成：创建了${resCount}种资源，每种${instancesPerRes}个实例，总共${resCount * instancesPerRes}个实例`);

        // 启动每帧更新
        this.startFrameUpdate();
    }

    /**
     * 启动帧更新循环
     */
    private startFrameUpdate() {
        const updateLoop = () => {
            if (this.dynamicTestRunning) {
                this.updateDynamicReduce();
            }
        };
        Laya.stage.timer.frameLoop(1, this, updateLoop);
    }

    /**
     * 每帧更新动态减少测试
     */
    private updateDynamicReduce() {
        if (!this.dynamicTestRunning) return;

        const currentTime = Date.now();
        const elapsedTime = currentTime - this.lastReduceTime;

        if (elapsedTime >= this.reduceInterval) {
            this.lastReduceTime = currentTime;
            let allInstancesCount = 0;
            let hasReduced = false;

            // 遍历每种资源，减少实例数量
            for (let resId = 0; resId < this.dynamicTestInstances.length; resId++) {
                let instances = this.dynamicTestInstances[resId];
                allInstancesCount += instances.length;

                if (instances.length > 0) {
                    // 移除最后一个实例
                    let removedInstance = instances.pop();
                    this.testAgent.removeIns(removedInstance);
                    hasReduced = true;
                }
            }

            if (hasReduced) {
                console.log(`动态减少测试：当前总实例数 ${allInstancesCount - this.dynamicTestInstances.length}`);
            }

            // 检查是否所有资源都只剩1个实例
            let minInstances = Math.min(...this.dynamicTestInstances.map(instances => instances.length));
            if (minInstances <= 1) {
                console.log("动态减少测试完成：所有资源都减少到1个实例");
                this.dynamicTestRunning = false;
            }
        }
    }

    /**
     * LOD级别切换测试：创建十种资源各五个实例，十秒后切换到Lower级别
     */
    testLodLevelSwitch() {
        this.lodTestInstances = [];
        const resCount = 10; // 十种不同的资源
        const instancesPerRes = 50; // 每种资源创建5个实例
        const spacing = 4; // 实例之间的间距

        // 生成不同的颜色用于区分不同的资源类型
        const colors = [
            new Color(1, 0, 0, 1),     // 红色
            new Color(0, 1, 0, 1),     // 绿色
            new Color(0, 0, 1, 1),     // 蓝色
            new Color(1, 1, 0, 1),     // 黄色
            new Color(1, 0, 1, 1),     // 品红
            new Color(0, 1, 1, 1),     // 青色
            new Color(1, 0.5, 0, 1),   // 橙色
            new Color(0.5, 0, 1, 1),   // 紫色
            new Color(1, 0.75, 0.8, 1), // 粉色
            new Color(0.5, 0.5, 0.5, 1)  // 灰色
        ];

        console.log("开始LOD级别切换测试：创建10种资源，每种5个实例，10秒后切换到Lower级别");

        for (let resId = 0; resId < resCount; resId++) {
            let resourceInstances: any[] = [];

            for (let instanceId = 0; instanceId < instancesPerRes; instanceId++) {
                // 计算位置：resId决定x轴位置，instanceId决定z轴位置
                let pos = new Vector3(resId * spacing, 0, instanceId * spacing);

                // 创建变换矩阵
                Matrix4x4.createAffineTransformation(pos, Quaternion.DEFAULT, Vector3.ONE, this.tempMatrix);

                // 为每种资源类型分配不同的颜色
                let color1 = colors[resId];
                let color2 = new Color(1 - color1.r, 1 - color1.g, 1 - color1.b, 1); // 互补色

                // 创建自定义数据数组
                let customDataArray = new Float32Array([
                    color1.r, color1.g, color1.b, color1.a,
                    color2.r, color2.g, color2.b, color2.a
                ]);

                // 创建实例
                let ins = this.testSystem._createIns(
                    resId, // 使用不同的资源ID (0-9)
                    this.tempMatrix,
                    true,
                    true,
                    true,
                    0,
                    {
                        color1: color1,
                        color2: color2,
                        customDataArray: customDataArray
                    }
                );

                // 添加到代理中
                this.testAgent.addIns(ins);

                // 存储到LOD测试数组中
                resourceInstances.push(ins);
            }

            this.lodTestInstances.push(resourceInstances);
        }

        console.log(`LOD测试初始化完成：创建了${resCount}种资源，每种${instancesPerRes}个实例，总共${resCount * instancesPerRes}个实例`);

        // 设置10秒后的LOD切换定时器
        this.lodSwitchTimer = Date.now();
        this.startLodSwitchTimer();
    }

    /**
     * 启动LOD切换定时器
     */
    private startLodSwitchTimer() {

        // 使用frameLoop方法每秒检查一次
        Laya.stage.timer.frameOnce(180, this, this.switchToLowerLod); // 60帧约等于1秒
    }

    /**
     * 切换所有实例到Lower LOD级别
     */
    private switchToLowerLod() {
        console.log("开始切换LOD级别到Lower...");

        // 创建LOD变化映射
        const lodChangeMap = new Map<number, QXLodLevel>();

        // 遍历所有实例，设置LOD级别为Lower
        for (let resId = 0; resId < this.lodTestInstances.length; resId++) {
            const instances = this.lodTestInstances[resId];
            for (let instanceId = 0; instanceId < instances.length; instanceId++) {
                const ins = instances[instanceId];
                lodChangeMap.set(ins.id, QXLodLevel.Lower);
            }
        }

        // 调用Agent的setChangeInsId2LevelList接口通知系统
        this.testAgent.setChangeInsId2LevelList(lodChangeMap);

        console.log(`LOD级别切换完成：${lodChangeMap.size}个实例已切换到Lower级别`);
    }
}