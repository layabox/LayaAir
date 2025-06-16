  #define SHADER_NAME colorEffect2D
        #include "Color.glsl"
        #include "OutputTransform.glsl";

        varying vec2 v_Texcoord0;

        void main()
        {
            vec4 mainColor = texture2D(u_MainTex, v_Texcoord0);
            //#ifdef Gamma_u_MainTex
            //mainColor = gammaToLinear(mainColor);
            //#endif // Gamma_u_AlbedoTexture
            gl_FragColor = mainColor;
            #ifdef COLORFILTER
                mat4 alphaMat = u_colorMat;
                alphaMat[0][3] *= gl_FragColor.a;
                alphaMat[1][3] *= gl_FragColor.a;
                alphaMat[2][3] *= gl_FragColor.a;

                gl_FragColor = gl_FragColor * alphaMat;
                gl_FragColor += u_colorAlpha / 255.0 * gl_FragColor.a;
            #endif

            gl_FragColor = outputTransform(gl_FragColor);
            // gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        }