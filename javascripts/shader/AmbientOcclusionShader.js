NMO_AmbientOcclusionShader = {
	uniforms: {
		//"type": 		{type: "1i", value: 0},
    	"invert": 		{type: "1f", value: 1},
    	"range": 		{type: "1f", value: 0},
    	"strength": 	{type: "1f", value: 0},
    	"mean": 		{type: "1f", value: 0},
    	"level": 		{type: "1f", value: 0},
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
        uniform float range;
        uniform float strength;
        uniform float mean;
        uniform float level;
        uniform float invert;
		uniform sampler2D tHeight;
        
		void main(void) 
		{
		
			vec4 v = vec4(texture2D(tHeight,  vUv.xy));
			float perc_dist_to_mean = (range - abs(v.r - mean)) / range;
			v.r = v.g = v.b = ((perc_dist_to_mean > 0.0) ? sqrt(perc_dist_to_mean) : 0.0 );
		    v.rgb = v.rgb + (vec3(1,1,1) - v.rgb) * (1.0 - strength);
		    v.rgb = (invert > 0.5) ? (1.0 - v.rgb) : v.rgb;
			gl_FragColor = v;
		}`
}