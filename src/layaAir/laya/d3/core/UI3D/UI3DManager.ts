import { SingletonList } from "../../../utils/SingletonList";
import { UI3D } from "./UI3D";

export class UI3DManager{
    private _UI3Dlist:SingletonList<UI3D> = new SingletonList<UI3D>();
    constructor(){
    }

    add(value:UI3D){
        this._UI3Dlist.add(value);
    }

    remove(value:UI3D){
        this._UI3Dlist.remove(value);
    }

    //需要在
    update(){
        for(var i = 0,n = this._UI3Dlist.length;i<n;i++){
            let elements = this._UI3Dlist.elements;
            elements[i]._submitRT();
        }
    }

    destory(){
        this._UI3Dlist.destroy();
    }
}