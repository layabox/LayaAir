import { Value2D } from "./Value2D";
import { ShaderDefines2D } from "../ShaderDefines2D"

export class PrimitiveSV extends Value2D{	
    constructor(args:any){
        super(ShaderDefines2D.PRIMITIVE,0);
        this._attribLocation = ['position', 0, 'attribColor', 1];// , 'clipDir', 2, 'clipRect', 3];
    }
}

