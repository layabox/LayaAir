export class TileSetPhysicsLayer {

   /** 识别用索引 */
   id:number;
   
   /** @internal 密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10*/
   private _density: number = 10;

   /** @internal 摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2*/
   private _friction: number = 0.2;

   /** @internal 弹性系数，取值范围0-1，值越大，弹性越大，默认值为0*/
   private _restitution: number = 0;

   /**
    * @en [Read-only] Specifies the collision group to which the body belongs, default is 0, the collision rules are as follows:
    * 1. If the group values of two objects are equal:
    *    - If the group value is greater than zero, they will always collide.
    *    - If the group value is less than zero, they will never collide.
    *    - If the group value is equal to 0, then rule 3 is used.
    * 2. If the group values are not equal, then rule 3 is used.
    * 3. Each rigidbody has a category, this property receives a bit field, the range is the power of 2 in the range of [1,2^31].
    * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
    * @zh [只读] 指定了该主体所属的碰撞组，默认为0，碰撞规则如下：
    * 1. 如果两个对象 group 相等：
    *    - group 值大于零，它们将始终发生碰撞。
    *    - group 值小于零，它们将永远不会发生碰撞。
    *    - group 值等于0，则使用规则3。
    * 2. 如果 group 值不相等，则使用规则3。
    * 3. 每个刚体都有一个 category 类别，此属性接收位字段，范围为 [1,2^31] 范围内的2的幂。
    * 每个刚体也都有一个 mask 类别，指定与其碰撞的类别值之和（值是所有 category 按位 AND 的值）。
    */
   group: number = 0;

   /**
    * @en [Read-only] Collision category, specified using powers of 2, with 32 different collision categories available.
    * @zh [只读] 碰撞类别，使用2的幂次方值指定，有32种不同的碰撞类别可用。
    */
   category: number = 1;

   /**
    * @en [Read-only] Specifies the category of collision bit mask, the result of category bitwise operation.
    * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
    * @zh [只读] 指定冲突位掩码碰撞的类别，category 位操作的结果。
    * 每个刚体也都有一个 mask 类别，指定与其碰撞的类别值之和（值是所有 category 按位 AND 的值）。
    */
   mask: number = -1;

   /**
    * @en The density value. The value can be zero or a positive number. It is recommended to use similar densities to improve stacking stability. The default value is 10.
    * @zh 密度值。值可以为零或者是正数，建议使用相似的密度以改善堆叠稳定性。默认值为 10。
    */
   get density(): number {
      return this._density;
   }

   set density(value: number) {
      if (this._density == value) return;
      this._density = value;
   }

   /**
  * @en The friction coefficient. The value ranges from 0 to 1, the larger the value, the greater the friction. The default value is 0.2.
  * @zh 摩擦力。取值范围0-1，值越大，摩擦越大。默认值为0.2。
  */
   get friction(): number {
      return this._friction;
   }

   set friction(value: number) {
      if (this._friction == value) return;
      this._friction = value;
   }

   /**
   * @en The restitution coefficient. The value ranges from 0 to 1, the larger the value, the greater the elasticity. The default value is 0.
   * @zh 弹性系数。取值范围0-1，值越大，弹性越大。默认值为0。
   */
   get restitution(): number {
      return this._restitution;
   }

   set restitution(value: number) {
      if (this._restitution == value) return;
      this._restitution = value;
   }
}