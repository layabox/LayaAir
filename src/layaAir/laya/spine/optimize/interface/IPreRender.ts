export interface IPreRender {
    canCache:boolean;
    _updateState(delta:number):spine.Bone[];
    _play(animationName:string):number;
}
