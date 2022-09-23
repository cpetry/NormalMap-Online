NMO_DisplacementShader = {
	uniforms: {
		//"type": 		{type: "1i", value: 0},
    	"invert": 		{type: "1f", value: 1},
    	"contrast":		{type: "1f", value: 0},
    	"flipY": 		{type: "1f", value: 0},
    	"tHeight": 		{type: "t", value: null }
	},

	vertexShader: `
		precision mediump float;
        varying vec2 vUv;
		uniform float flipY;
        void main() 
		{
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			vUv = uv;
			vUv.y = (flipY > 0.0) ? (1.0 - vUv.y) : vUv.y;
		}`
	,

	fragmentShader: `
		precision mediump float;
        varying vec2 vUv;
        uniform float contrast;
        uniform float invert;
		uniform sampler2D tHeight;
        
		void main(void) 
		{
			vec4 v = vec4(texture2D(tHeight,  vUv.xy));
		    float factor = (contrast + 1.0) / (1.0 - contrast);
		    v.rgb = factor * (v.rgb - vec3(0.5, 0.5, 0.5)) + vec3(0.5, 0.5, 0.5);
		    v.rgb = (invert == 1.0) ? vec3(1.0) - v.rgb : v.rgb;
			gl_FragColor = v;
		}`
}