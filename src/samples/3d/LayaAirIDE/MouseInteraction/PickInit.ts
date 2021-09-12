import { DefineDatas } from "laya/d3/shader/DefineDatas";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { SubShader } from "laya/d3/shader/SubShader";
import { ShaderNode } from "laya/webgl/utils/ShaderNode";
import MeshPick from "../EditorShader/MeshPick.fs";
import ShurikenPickVS from "../EditorShader/ParticleShuriKenPick.vs";
import ShurikenPickFS from "../EditorShader/ParticleShuriKenPick.fs";  

/**
 * 为所有的Shader 添加Pass
 * @author miner
 */
export class PickInit{

    static shader3DCompileShader:any;
    /**
     * 初始化
     */
    static Init():void{
        //@ts-ignore
        PickInit.shader3DCompileShader=  Shader3D._preCompileShader;
        PickInit.addPickShaderPath();
    }

    /**
     * 给所有的SubShader添加PickSprite渲染pass
     * 每增加一个自定义的shader 都需要重新调用一下
     */
    static addPickShaderPath():void{
        var shader;
        var shaderMap;
        var shaderName;
        var subShaders;
        var subShader;
        var i,n;
        shaderMap =PickInit.shader3DCompileShader;
        for(var index in shaderMap){
            shader = shaderMap[index] as Shader3D;
            shaderName = shader.name;
            //@ts-ignore
            subShaders = shader._subShaders;
            for(i = 0,n = subShaders.length;i<n;i++){
                subShader = subShaders[i];
               
                var uniformMap = subShader._uniformMap;
                //Uniform原始数据中添加pickColor属性
                uniformMap["u_PickColor"] = Shader3D.PERIOD_SPRITE;
               
                var shaders= subShader._passes;
                var stateMap;
                var vsShaderNode;
                var validDefine;
                var havePickPass = false;
                for(var j = 0,m=shaders.length;j<m;j++){
                   var shaderpass = shaders[j];
                   //TODO:如果有延迟渲染管线后 需要考虑延迟渲染情况
                   //@ts-ignore
                   if(shaderpass._pipelineMode=="Forward"){
                       //@ts-ignore
                       stateMap = shaderpass._stateMap;
                       vsShaderNode = shaderpass._VS;
                       //@ts-ignore
                       validDefine = shaderpass._validDefine;
                       //@ts-ignore
                   }else if(shaderpass._pipelineMode=="PickSprite"){
                        havePickPass = true;
                   }
                }
                //去重
                if(havePickPass)
                    break;
                if(shaderName=="PARTICLESHURIKEN")
                {
                    //粒子特殊处理一下
                    shaderpass = subShader.addShaderPass(ShurikenPickVS,ShurikenPickFS,stateMap,"PickSprite");
                    //@ts-ignore
                    shaderpass._validDefine = validDefine;
                }
                else if(shaderName == "BlitScreen"){
                    continue;
                }
                else
                {
                    shaderpass = subShader.addShaderPass("",MeshPick,stateMap,"PickSprite");
                    shaderpass._VS = vsShaderNode;
                    //@ts-ignore
                    shaderpass._validDefine = validDefine;
                }
            }
        }
    }
}

