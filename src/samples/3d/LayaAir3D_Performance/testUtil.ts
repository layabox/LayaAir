import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Color } from "laya/maths/Color";
import { Material, MaterialRenderMode } from "laya/resource/Material";

export class testUtil {
    meshArray: Mesh[] = [];
    materialArray: Material[] = [];

    constructor(){
        this.createMesh();
        this.createMaterial();

    }
    //创建mesh - 扩展为30种不同类型的网格
    createMesh() {
        // 1-4: 基础立方体变体
        this.meshArray.push(PrimitiveMesh.createBox(1, 1, 1));           // 标准立方体
        this.meshArray.push(PrimitiveMesh.createBox(0.5, 2, 0.5));       // 细长立方体
        this.meshArray.push(PrimitiveMesh.createBox(2, 0.5, 1));         // 扁平立方体
        this.meshArray.push(PrimitiveMesh.createBox(0.3, 0.3, 0.3));     // 小立方体

        // 5-8: 球体变体
        this.meshArray.push(PrimitiveMesh.createSphere(0.5, 16, 16));     // 标准球体
        this.meshArray.push(PrimitiveMesh.createSphere(0.3, 8, 8));       // 小球体
        this.meshArray.push(PrimitiveMesh.createSphere(1.0, 32, 32));     // 高精度球体
        this.meshArray.push(PrimitiveMesh.createSphere(0.8, 12, 12));     // 大球体

        // 9-12: 圆柱体变体
        this.meshArray.push(PrimitiveMesh.createCylinder(0.5, 2, 16));    // 标准圆柱体
        this.meshArray.push(PrimitiveMesh.createCylinder(0.3, 1, 8));     // 细圆柱体
        this.meshArray.push(PrimitiveMesh.createCylinder(1.0, 1, 32));    // 粗圆柱体
        this.meshArray.push(PrimitiveMesh.createCylinder(0.2, 3, 12));    // 长圆柱体

        // 13-16: 圆锥体变体
        this.meshArray.push(PrimitiveMesh.createCone(0.5, 2, 16));        // 标准圆锥体
        this.meshArray.push(PrimitiveMesh.createCone(0.3, 1, 8));         // 小圆锥体
        this.meshArray.push(PrimitiveMesh.createCone(1.0, 1, 32));        // 粗圆锥体
        this.meshArray.push(PrimitiveMesh.createCone(0.2, 3, 12));        // 长圆锥体

        // 17-20: 胶囊体变体
        this.meshArray.push(PrimitiveMesh.createCapsule(0.5, 2, 16, 16)); // 标准胶囊体
        this.meshArray.push(PrimitiveMesh.createCapsule(0.3, 1, 8, 8));   // 小胶囊体
        this.meshArray.push(PrimitiveMesh.createCapsule(0.8, 3, 20, 20)); // 长胶囊体
        this.meshArray.push(PrimitiveMesh.createCapsule(1.0, 1, 12, 12)); // 粗胶囊体

        // 21-24: 平面变体
        this.meshArray.push(PrimitiveMesh.createPlane(2, 2, 10, 10));     // 标准平面
        this.meshArray.push(PrimitiveMesh.createPlane(1, 1, 5, 5));       // 小平面
        this.meshArray.push(PrimitiveMesh.createPlane(5, 5, 20, 20));     // 大平面
        this.meshArray.push(PrimitiveMesh.createPlane(3, 1, 15, 5));      // 长方形平面

        // 25-28: 四边形变体
        this.meshArray.push(PrimitiveMesh.createQuad(1, 1));              // 标准四边形
        this.meshArray.push(PrimitiveMesh.createQuad(0.5, 0.5));          // 小四边形
        this.meshArray.push(PrimitiveMesh.createQuad(2, 2));              // 大四边形
        this.meshArray.push(PrimitiveMesh.createQuad(1.5, 0.5));          // 长方形四边形

        // 29-40: 额外变体 - 使用基础方法的不同参数组合
        // 立方体变体 (29-32)
        this.meshArray.push(PrimitiveMesh.createBox(0.8, 1.2, 0.8));     // 细高立方体
        this.meshArray.push(PrimitiveMesh.createBox(1.5, 0.8, 1.2));     // 扁宽立方体
        this.meshArray.push(PrimitiveMesh.createBox(0.6, 0.6, 2.0));     // 长条立方体
        this.meshArray.push(PrimitiveMesh.createBox(1.8, 1.8, 0.4));     // 薄片立方体

        // 球体变体 (33-36)
        this.meshArray.push(PrimitiveMesh.createSphere(0.7, 12, 12));     // 中等球体
        this.meshArray.push(PrimitiveMesh.createSphere(1.2, 24, 24));     // 大球体高精度
        this.meshArray.push(PrimitiveMesh.createSphere(0.4, 6, 6));       // 小球体低精度
        this.meshArray.push(PrimitiveMesh.createSphere(0.9, 48, 48));     // 超高精度球体

        // 圆柱体变体 (37-40)
        this.meshArray.push(PrimitiveMesh.createCylinder(0.7, 3, 24));    // 高圆柱体
        this.meshArray.push(PrimitiveMesh.createCylinder(1.2, 0.5, 40));   // 粗矮圆柱体
        this.meshArray.push(PrimitiveMesh.createCylinder(0.3, 4, 8));     // 细高圆柱体
        this.meshArray.push(PrimitiveMesh.createCylinder(0.9, 1.5, 60));  // 高精度圆柱体

        console.log(`已创建 ${this.meshArray.length} 种网格类型`);
    }


    //创建材质 - 扩展为40种材质变体以配合40种网格
    createMaterial() {
        let createOneMaterial = (r: number, g: number, b: number, name?: string): Material => {
            let mat = new Material();
            mat.setShaderName("PBR");
            mat.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
            mat.setColor("u_AlbedoColor", new Color(r, g, b, 1));
            if (name) {
                mat.name = name;
            }
            return mat;
        }

        // 基础颜色材质
        this.materialArray.push(createOneMaterial(1, 1, 1, "White"));
        this.materialArray.push(createOneMaterial(1, 0, 0, "Red"));
        this.materialArray.push(createOneMaterial(0, 1, 0, "Green"));
        this.materialArray.push(createOneMaterial(0, 0, 1, "Blue"));
        this.materialArray.push(createOneMaterial(1, 1, 0, "Yellow"));
        this.materialArray.push(createOneMaterial(1, 0, 1, "Magenta"));
        this.materialArray.push(createOneMaterial(0, 1, 1, "Cyan"));
        this.materialArray.push(createOneMaterial(0.5, 0.5, 0.5, "Gray"));
        this.materialArray.push(createOneMaterial(0.5, 0, 0, "DarkRed"));
        this.materialArray.push(createOneMaterial(0, 0.5, 0, "DarkGreen"));
        this.materialArray.push(createOneMaterial(0, 0, 0.5, "DarkBlue"));
        this.materialArray.push(createOneMaterial(0.5, 0.5, 0, "Olive"));
        this.materialArray.push(createOneMaterial(0.5, 0, 0.5, "Purple"));
        this.materialArray.push(createOneMaterial(0, 0.5, 0.5, "Teal"));

        // 扩展颜色材质
        this.materialArray.push(createOneMaterial(1, 0.5, 0, "Orange"));
        this.materialArray.push(createOneMaterial(1, 0.2, 0.6, "Pink"));
        this.materialArray.push(createOneMaterial(0.2, 0.8, 0.4, "Lime"));
        this.materialArray.push(createOneMaterial(0.4, 0.2, 0.8, "Lavender"));
        this.materialArray.push(createOneMaterial(0.8, 0.4, 0.2, "Coral"));
        this.materialArray.push(createOneMaterial(0.6, 0.8, 0.2, "Chartreuse"));
        this.materialArray.push(createOneMaterial(0.8, 0.6, 0.4, "Tan"));
        this.materialArray.push(createOneMaterial(0.4, 0.6, 0.8, "SkyBlue"));
        this.materialArray.push(createOneMaterial(0.8, 0.2, 0.4, "Rose"));
        this.materialArray.push(createOneMaterial(0.2, 0.6, 0.8, "Azure"));

        // 更多变体材质
        this.materialArray.push(createOneMaterial(0.9, 0.5, 0.1, "Gold"));
        this.materialArray.push(createOneMaterial(0.7, 0.7, 0.7, "Silver"));
        this.materialArray.push(createOneMaterial(0.6, 0.3, 0.1, "Bronze"));
        this.materialArray.push(createOneMaterial(0.8, 0.8, 0.2, "LightYellow"));
        this.materialArray.push(createOneMaterial(0.9, 0.3, 0.3, "Salmon"));
        this.materialArray.push(createOneMaterial(0.3, 0.9, 0.3, "LightGreen"));
        this.materialArray.push(createOneMaterial(0.3, 0.3, 0.9, "LightBlue"));
        this.materialArray.push(createOneMaterial(0.7, 0.9, 0.7, "Mint"));
        this.materialArray.push(createOneMaterial(0.9, 0.7, 0.3, "Peach"));
        this.materialArray.push(createOneMaterial(0.5, 0.7, 0.9, "PowderBlue"));

        // 最终补充材质
        this.materialArray.push(createOneMaterial(0.8, 0.4, 0.6, "Pinkish"));
        this.materialArray.push(createOneMaterial(0.4, 0.8, 0.6, "Greenish"));
        this.materialArray.push(createOneMaterial(0.6, 0.4, 0.8, "Purplish"));
        this.materialArray.push(createOneMaterial(0.8, 0.6, 0.4, "Orangish"));
        this.materialArray.push(createOneMaterial(0.6, 0.8, 0.6, "Yellowish"));
        this.materialArray.push(createOneMaterial(0.4, 0.6, 0.4, "DarkCyan"));
        this.materialArray.push(createOneMaterial(0.6, 0.4, 0.6, "DarkMagenta"));
        this.materialArray.push(createOneMaterial(0.4, 0.4, 0.8, "DarkBlue"));
        this.materialArray.push(createOneMaterial(0.8, 0.8, 0.4, "LightOrange"));
        this.materialArray.push(createOneMaterial(0.4, 0.8, 0.8, "LightCyan"));

        console.log(`已创建 ${this.materialArray.length} 种材质`);
    }
}