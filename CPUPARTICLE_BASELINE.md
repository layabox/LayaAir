# CPUParticle 结构调整前基线

2026-10-08，本仓库的粒子相关引擎改动冻结在本地标签 `cpuparticle-pre-shared-core-20261008`。

权威文档位于相邻 Native 仓库：[基线与验证](../LayaNative3.0-CPUParticleDownshift-3.4Latest/docs/cpuparticle-shared-core/baseline-20261008.md)、[双端共享核心设计](../LayaNative3.0-CPUParticleDownshift-3.4Latest/docs/cpuparticle-shared-core/architecture.md)。

当前引擎改动包括 ComponentDriver 回调遍历、能力查询缓存、渲染节点/宏/Bounds 共享读回和 Transform 读取门控。Transform 门控的存在不代表在当前 V8 13 运行条件下取得了独立可量化收益。

后续本仓库仅提供通用组件/渲染接入。C++ 粒子运行时由 Native 仓库维护，Web/WASM 与 Native 共用该实现。

本轮只整理和冻结现状，没有开始架构迁移。已有性能成绩与本轮源码检查的区别、产物哈希、恢复方式见权威基线文档。
