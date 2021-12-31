namespace lolo {


    /**
     * 使用 cc.GLProgram(Shader) 实现一些滤镜效果
     * 2017/7/27
     * @author LOLO
     */
    export class Filter {

        /**不使用滤镜*/
        public static NONE: string = "none";
        /**使用灰显滤镜（常用于禁用状态）*/
        public static GRAY_SCALE: string = "grayscale";


        /**已缓存的 GLPrpgram(Shader)*/
        private static _programs: any = {};


        /**
         * 根据传入的 type 获取对应的 cc.GLProgram(Shader)
         * @param type
         */
        public static getShaderProgram(type: string): cc.GLProgram {
            let program: cc.GLProgram = this._programs[type];
            if (program == null) {
                let vertexShader: string = this.VS_DEFAULT;
                let fragmentShader: string;
                switch (type) {

                    case this.NONE:
                        fragmentShader = this.FS_NONE;
                        break;

                    case this.GRAY_SCALE:
                        fragmentShader = this.FS_GRAY_SCALE;
                        break;
                }

                program = new cc.GLProgram();
                program.retain();
                program.initWithString(vertexShader, fragmentShader);
                program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                program.link();
                program.updateUniforms();
                program.filterType = type;
                this._programs[type] = program;
            }
            return program;
        }


        //


        ////////////////////////////[ Vertex Shader ]////////////////////////////

        /**默认的 Vertex Shader*/
        private static VS_DEFAULT: string = ""
            + "attribute vec4 a_position; \n"
            + "attribute vec2 a_texCoord; \n"
            + "attribute vec4 a_color; \n"
            + "#ifdef GL_ES \n"
            + "    varying lowp vec4 v_fragmentColor; \n"
            + "    varying mediump vec2 v_texCoord; \n"
            + "#else \n"
            + "    varying vec4 v_fragmentColor; \n"
            + "    varying vec2 v_texCoord; \n"
            + "#endif \n"
            + "void main() \n"
            + "{ \n"
            + "    gl_Position = CC_PMatrix * a_position; \n"
            + "    v_fragmentColor = a_color; \n"
            + "    v_texCoord = a_texCoord; \n"
            + "}";
        //

        ///////////////////////////[ Fragment Shader ]///////////////////////////

        /**什么效果都没有，只使用本身纹理渲染的 Fragment Shader（用于还原 Shader 效果）*/
        private static FS_NONE: string = ""
            + "#ifdef GL_ES \n"
            + "    precision lowp float; \n"
            + "#endif \n"
            + "varying vec4 v_fragmentColor; \n"
            + "varying vec2 v_texCoord; \n"
            + "void main() \n"
            + "{ \n"
            + "    vec4 c = texture2D(CC_Texture0, v_texCoord); \n"
            + "    c = v_fragmentColor * c; \n"
            + "    gl_FragColor = c; \n"
            + "}";
        //

        /**灰显 Fragment Shader，常用于表示禁用状态*/
        private static FS_GRAY_SCALE: string = ""
            + "#ifdef GL_ES \n"
            + "    precision lowp float; \n"
            + "#endif \n"
            + "varying vec4 v_fragmentColor; \n"
            + "varying vec2 v_texCoord; \n"
            + "void main() \n"
            + "{ \n"
            + "    vec4 c = texture2D(CC_Texture0, v_texCoord); \n"
            + "    c = v_fragmentColor * c; \n"
            + "    gl_FragColor.xyz = vec3(0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b); \n"
            + "    gl_FragColor.w = c.w; \n"
            + "}";
        //


        //
    }
}