import fs from "fs";
import path from "path";
import { rimrafSync } from "rimraf";
import { Application, OptionDefaults } from "typedoc";

const outDir = path.join(".", "docs");
const ourTags = ["@en", "@zh", "@perfTag"];
const currentVersion = "3.3.0-beta.2";

const configVersions = [
    "3.3.0-beta.2",
    "3.2.3",
    "3.1.6",
    "3.0.11",
];

const packageJson = {
    "versions": {
        [currentVersion]: {
            "entryPoints": [path.join(".", "src", "layaAir")],
            "tsconfig": path.join(".", "src", "layaAir", "tsconfig.json"),
            "out": path.join(".", "docs", currentVersion)
        }
    }
};

async function main() {
    rimrafSync(outDir);

    // 直接使用导入的 Application
    const app = await Application.bootstrapWithPlugins({
        excludeInternal: true,
        excludePrivate: true,
        excludeProtected: true,
        hideGenerator: true,
        // theme: "default",
        darkHighlightTheme: "dark-plus",
        exclude: [
            "**/node_modules/**",
            "**/*.d.ts",            
            "**/ILaya.ts",    
            "**/ILaya3D.ts",
            "**/AniLibPack.ts",
            "**/AnimationContent.ts",
            "**/AnimationNodeContent.ts",
            "**/AnimationParser01.ts",
            "**/AnimationParser02.ts",
            "**/AnimationState.ts",
            "**/Bone.ts",
            "**/DeformAniData.ts",
            "**/DeformSlotData.ts",
            "**/DeformSlotDisplayData.ts",
            "**/DrawOrderData.ts",
            "**/IkConstraint.ts",
            "**/IkConstraintData.ts",
            "**/PathConstraint.ts",
            "**/PathConstraintData.ts",
            "**/SkinData.ts",
            "**/TfConstraint.ts",
            "**/TfConstraintData.ts",
            "**/UVTools.ts",
            "**/ModuleDef.ts",
            "**/TempletLoader.ts",
            "**/AnimationClipParser03.ts",
            "**/AnimationClipParser04.ts",
            "**/VolumetricGIManager.ts",
            "**/LightQueue.ts",
            "**/LightSprite.ts",
            "**/ExtendTerrainMaterial.ts",
            "**/PixelLineVertex.ts",
            "**/BatchMark.ts",
            "**/DrawMeshCMD.ts",
            "**/MaterialInstanceProperty.ts",
            "**/SetGlobalShaderDataCMD.ts",
            "**/SetRenderTargetCMD.ts",
            "**/SkinRenderElement.ts",
            "**/SubMeshRenderElement.ts",
            "**/Input3D.ts",
            "**/Scene3DShaderDeclaration.ts",
            "**/InstanceBatchManager.ts",
            "**/RenderElementBatch_deprecated.ts",
            "**/FrustumCulling.ts",
            "**/MeshInstanceGeometry.ts",
            "**/Cluster.ts",
            "**/SubMeshInstanceBatch.ts",
            "**/AnimationClipLoader.ts",
            "**/AvatarMaskLoader.ts",
            "**/CubemapLoader.ts",
            "**/LoadModelV04.ts",
            "**/LoadModelV05.ts",
            "**/MeshReader.ts",
            "**/Texture2DArrayLoader.ts",
            "**/Texture3DLoader.ts",
            "**/IBoundsCell.ts",
            "**/VertexPositionTexture.ts",
            "**/ModuleDef.ts",
            "**/StaticMeshBatchManager.ts",
            "**/StaticBatchMeshRenderElement.ts",
            "**/Constraint3D_deprecated.ts",
            "**/RaycastVehicle_deprecated.ts",
            "**/RaycastWheel_deprecated.ts",
            "**/HeightfieldTerrainShape_deprecated.ts",
            "**/StaticPlaneColliderShape_deprecated.ts",
            "**/LensFlareSettingsLoader.ts",
            "**/TextureGenerator.ts",
            "**/PBRDefaultDFG.ts",
            "**/ShaderInit3D.ts",
            "**/ShadowCasterPass.ts",
            "**/WebXRCamera.ts",
            "**/CacheStyle.ts",
            "**/GraphicsBounds.ts",
            "**/glTFExtension.ts",
            "**/KHR_*.ts",
            "**/glTFInterface.ts",
            "**/CommandEncoder.ts",
            "**/glTFShader.ts",
            "**/glTFResource.ts",
            "**/laya/legacy/*.ts",
            "**/laya/legacy/tiledmap/*.ts",
            "**/AnimationClip2DLoader.ts",
            "**/AnimationController2DLoader.ts",
            "**/AtlasLoader.ts",
            "**/BitmapFontLoader.ts",
            "**/GLSLLoader.ts",
            "**/ShaderLoader.ts",
            "**/TextResourceLoader.ts",
            "**/TTFFontLoader.ts",
            "**/MathUtil.ts",
            "**/WebAudioLoader.ts",
            "**/Navgiation2DUtils.ts",
            "**/Navgiation3DUtils.ts",
            "**/BaseNavMesh.ts",
            "**/BaseData.ts",
            "**/CacheData.ts",
            "**/ModifierVolumeData.ts",
            "**/ItemMapId.ts",
            "**/NavAgentLinkAnim.ts",
            "**/TitleConfig.ts",
            "**/AtlasInfoManager.ts",
            "**/ShapeUtils.ts",
            "**/ShuriKenParticle3DShaderDeclaration.ts",
            "**/ShurikenParticleData.ts",
            "**/VertexShuriKenParticle.ts",
            "**/VertexShurikenParticleBillboard.ts",
            "**/VertexShurikenParticleMesh.ts",
            "**/ColliderStructInfo.ts",
            "**/JointDefStructInfo.ts",
            "**/RigidBody2DInfo.ts",
            "**/CollisionTool.ts",
            "**/pxPrismaticJoint.ts",
            "**/GLESInternalTex.ts",
            "**/GLESShaderInstance.ts",
            "**/NativeTransform3D.ts",
            "**/WebGLInternalTex.ts",
            "**/GLSLCodeGenerator.ts",
            "**/RenderStateCommand.ts",
            "**/RenderStateContext.ts",
            "**/Context.ts",
            "**/LayaGLQuickRunner.ts",
            "**/RenderSprite.ts",
            "**/SpriteCache.ts",
            "**/SpineTempletLoader.ts",
            "**/Grid.ts",
            "**/TileMapChunk.ts",
            "**/TileMapPhysics.ts",
            "**/VertexTrail.ts",
            "**/Tweener.ts",
            "**/ColorUtils.ts",
            "**/IClone.ts",
            "**/WordText.ts",
            "**/TextRender.ts",
            "**/VertexTrail.ts",
        ],
        entryPointStrategy: "Expand",
        blockTags: [...OptionDefaults.blockTags, ...ourTags],
        entryPoints: [path.join(".", "src", "layaAir")], // 入口文件或目录
        tsconfig: path.join(".", "src", "layaAir", "tsconfig.json"),
        plugin: ["@shipgirl/typedoc-plugin-versions"],
        lang: "zh", // 设置中文
        favicon: "./favicon.ico", 
        readme: "./README.zh-CN.md",
        name: "LayaAir3引擎API"
    });

    // **解析 package.json 里的 typedocVersions**
    const versions = packageJson?.versions || {};
    if (!versions[currentVersion]) {
        console.error(`❌ 版本 ${currentVersion} 未在 package.json 配置`);
        return;
    }
    // **自动获取 entryPoints 和 tsconfig**
    app.options.setValue("entryPoints", versions[currentVersion].entryPoints);
    app.options.setValue("tsconfig", versions[currentVersion].tsconfig);
    // **转换项目**
    const project = await app.convert();
    if (!project) {
        console.error(`❌ 生成 ${currentVersion} 失败`);
        return;
    }

    // **自动获取 `out` 目录**
    const docDir = versions[currentVersion].out || path.join(".", "docs", currentVersion);
    await app.generateDocs(project, docDir);
    console.log(`✅ 版本 ${currentVersion} 文档已生成: ${docDir}`);

    // 
    let sourceFile = path.join(outDir, "dev", "assets", "versionsMenu.js");
    try {
        fs.copyFileSync(sourceFile, path.join(docDir, "assets", "versionsMenu.js"));
        console.log("✅ 拷贝versionMenu.js成功");
    } catch (error) {
        console.error(`❌ 拷贝versionMenu.js失败: ${error.message}`);
    }

    // configVersions
    try {
        // 读取 version.js 文件内容（同步）
        const data = await fs.promises.readFile(path.join(outDir, "versions.js"), 'utf8');

        // 正则表达式匹配 DOC_VERSIONS 数组
        const regex = /export const DOC_VERSIONS = \[([^\]]*)\];/;

        // 替换 DOC_VERSIONS 数组内容
        const newVersions = JSON.stringify(configVersions, null, 2); // 格式化为漂亮的 JSON 字符串
        const updatedData = data.replace(regex, `export const DOC_VERSIONS = ${newVersions};`);

        // 写回修改后的内容到文件（同步）
        await fs.promises.writeFile(path.join(outDir, "versions.js"), updatedData, 'utf8');

        console.log('✅ 版本更新成功');
    } catch (err) {
        console.error('❌ 文件操作失败:', err);
    }

    //
    try {
        // 读取 HTML 文件内容
        const data = await fs.promises.readFile(path.join(outDir, "index.html"), 'utf8');

        // 正则表达式匹配 <meta http-equiv="refresh"> 标签中的 url= 部分
        const regex = /<meta http-equiv="refresh" content="[^"]*url=([^"]*)[^"]*"/;

        // 替换 url 的值
        const updatedData = data.replace(regex, `<meta http-equiv="refresh" content="0; url=${configVersions[0]}"/>`);

        // 写回修改后的 HTML 文件
        await fs.promises.writeFile(path.join(outDir, "index.html"), updatedData, 'utf8');

        console.log('✅ HTML 文件更新成功');
    } catch (err) {
        console.error('❌ 文件操作失败:', err);
    }

}

main();