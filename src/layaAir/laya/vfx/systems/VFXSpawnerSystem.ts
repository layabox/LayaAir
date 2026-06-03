import { VFXSpawnerSystemDesc } from "../VFXAsset";
import { VFXEventAttribute } from "../VFXEventAttribute";
import { sampleRange } from "../VFXUtils";
import { VFXState } from "../VFXState";
import { VFXSpawnerSettings, VFXSpawnerState } from "./VFXSpawnerState";
import { VFXSpawnerTask } from "./VFXSpawnerTask";
import { VFXSystem } from "./VFXSystem";

export class VFXSpawnerSystem extends VFXSystem {

    desc: VFXSpawnerSystemDesc;

    spawnerState: VFXSpawnerState = new VFXSpawnerState();

    settings: VFXSpawnerSettings = new VFXSpawnerSettings();

    tasks: VFXSpawnerTask[] = [];

    // 记录其他系统触发的 Onplay / Onstop 事件
    onPlayInputs: number[] = [];
    onStopInputs: number[] = [];

    private eventAttribute: VFXEventAttribute;

    onPlay(sourceEvtAttr: VFXEventAttribute) {
        this.spawnerState.prepareOnPlay(sourceEvtAttr);

        // 从 desc 范围采样 settings
        const rand = this.effect.state.rand;
        this.settings.loopCount = Math.round(sampleRange(this.desc.loopCount, rand));
        this.settings.loopDuration = sampleRange(this.desc.loopDuration, rand);

        this.spawnerState.onPlay(this.settings);

        for (let task of this.tasks) {
            task.play();
        }
    }

    onStop() {
        this.spawnerState.onStop();

        for (let task of this.tasks) {
            task.stop();
        }
    }

    init(): void {
        this.release();

        const attrDesc = this.effect.asset.eventAttributeDesc;
        this.eventAttribute = new VFXEventAttribute(attrDesc);
        {
            const buffer = attrDesc.createBuffer();
            this.eventAttribute.initBuffer(buffer);
            // 给关键 attribute 设 Unity 风格 default：粒子 setAttribute(lifetime, source=Source)
            // 但 spawn event 没 setSpawnEventAttribute(lifetime) 时，src.lifetime=0 让粒子瞬死。
            // Unity 默认 lifetime=1，保持一致避免 sample 默认配置不可见。
            if (attrDesc.hasAttribute("lifetime")) {
                this.eventAttribute.setFloat("lifetime", 1);
            }
        }
        this.spawnerState.setEventAttribute(this.eventAttribute);

        for (let task of this.tasks) {
            task.init();
        }
    }

    inputSpawner(onPlay: boolean, state: VFXState) {
        const inputs = onPlay ? this.onPlayInputs : this.onStopInputs;

        inputs.forEach(index => {
            const system = this.effect.systems[index] as VFXSpawnerSystem;
            const inputSpawnCount = system.spawnerState.spawnCount;
            if (inputSpawnCount >= 1) {
                let currentSpawnCount = this.spawnerState.spawnCount;
                if (onPlay) {
                    this.onPlay(system.spawnerState.eventAttribute);
                }
                else {
                    this.onStop();
                }
                this.spawnerState.spawnCount = currentSpawnCount;
            }
        });
    }

    update(state: VFXState): void {
        const spawnerState = this.spawnerState;
        // 检查是否有其他系统触发的 Onplay 事件
        this.inputSpawner(true, state);

        let accumulatedSpawn = 0;

        // 消耗上一帧的整数部分
        spawnerState.spawnCount -= Math.floor(spawnerState.spawnCount);


        // 如果不是新循环， 保存余量
        if (!spawnerState.newLoop) {
            accumulatedSpawn = spawnerState.spawnCount;
        }

        // 重置生成计数
        spawnerState.spawnCount = 0;

        // 新循环开始时重新采样 loopDuration
        if (spawnerState.delayDirty) {
            const rand = this.effect.state.rand;
            this.settings.loopDuration = sampleRange(this.desc.loopDuration, rand);
        }

        // 更新状态
        spawnerState.beginUpdate(state.deltaTime, this.settings);

        // 更新任务
        const rand = this.effect.state.rand;
        for (let task of this.tasks) {
            task.update(spawnerState, rand);
        }

        spawnerState.endUpdate();

        // 加回余量
        spawnerState.spawnCount += accumulatedSpawn;

        // 检查是否有其他系统触发的 Onstop 事件
        this.inputSpawner(false, state);
    }

    release() {
        // release resources
        this.spawnerState.release();

        if (this.eventAttribute) {
            this.eventAttribute.destroy();
            this.eventAttribute = null;
        }

        this.tasks.forEach(task => {
            task.release();
        });
    }

}
