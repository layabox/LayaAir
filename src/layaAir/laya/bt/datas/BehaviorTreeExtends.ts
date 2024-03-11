// import { TypeExtendsData } from "./types/BlueprintTypes";

import { TBPDeclaration } from "../../bp/datas/types/BlueprintDeclaration"

// export const extendsData: TypeExtendsData = {
//     Node: {
//         /**
//         * 组件被激活后执行，此时所有节点和组件均已创建完毕，次方法只执行一次
//         * 此方法为虚方法，使用时重写覆盖即可
//         */
//         onAwake: {},
//         /**
//          * 组件被启用后执行，比如节点被添加到舞台后
//          * 此方法为虚方法，使用时重写覆盖即可
//          */
//         onEnable: {},
//         /**
//          * 组件被禁用时执行，比如从节点从舞台移除后
//          * 此方法为虚方法，使用时重写覆盖即可
//          */
//         onDisable: {},
//         /**
//          * 反序列化后会调用
//          */
//         onAfterDeserialize: {}
//     },
//     Sprite: {
//         extends: "Node",
//     },
//     Sprite3D: {
//         extends: "Node",
//     }
// }

/**
 * 开发者自定义相关
 */
/* export const customData : Record<string , TBPDeclaration> = {
} */

export const extendsData: Record<string, TBPDeclaration> = {
}