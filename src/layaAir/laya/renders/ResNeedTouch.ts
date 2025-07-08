export interface IAutoExpiringResource{
    isRandomTouch:boolean; 
    referenceCount:number;
    touch():void;
}

