
/** 
 * JS实现Box2D SayGoodbyeParticle
 * 相关类型对象被隐性移除时触发对应的SayGoodBye方法
 */
    export class DestructionListener {
        /**
         * Joint被隐性移除时触发
         * @param params box2d的Joint相关对象
         */
        public SayGoodbyeJoint(params:any):void{
            params.m_userData&&(params.m_userData.isDestroy = true);
        }
        /**
         * Fixtures被隐性移除时触发
         * @param params box2d的Fixtures相关对象
         */
        public SayGoodbyeFixture(params:any):void{

        }
        /**
         * ParticleGroup被隐性移除时触发
         * @param params box2d的ParticleGroup相关对象
         */
        public SayGoodbyeParticleGroup(params:any):void{

        }
        /**
         * Particle被隐性移除时触发
         * @param params box2d的Particle相关对象
         */
        public SayGoodbyeParticle(params:any):void{

        }
    }