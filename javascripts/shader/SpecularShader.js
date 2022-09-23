NMO_SpecularShader = {
	uniforms: {
		//"type": 		{type: "1i", value: 0},
    	"invert": 		{type: "1i", value: 1},
    	"range": 		{type: "1f", value: 0},
    	"strength": 	{type: "1f", value: 0},
    	"mean": 		{type: "1f", value: 0},
    	"falloff": 		{type: "1i", value: 0},
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
		}`,

	fragmentShader: `
		precision mediump float;
        varying vec2 vUv;
        uniform float range;
        uniform float strength;
        uniform float mean;
        uniform int invert;
        uniform int falloff;
		uniform sampler2D tHeight;
        
		void main(void) 
		{
			vec4 v = vec4(texture2D(tHeight,  vUv.xy));
			float perc_dist_to_mean = (range - abs(v.r - mean)) / range;
			if (falloff == 0) // No FallOff
				perc_dist_to_mean = (perc_dist_to_mean > 0.0) ? 1.0 : 0.0;
			else if (falloff == 1) // linear
				perc_dist_to_mean = (perc_dist_to_mean > 0.0) ? perc_dist_to_mean : 0.0;
			else if (falloff == 2) // square
				perc_dist_to_mean = (perc_dist_to_mean > 0.0) ? sqrt(perc_dist_to_mean) : 0.0;
			v.r = v.g = v.b = perc_dist_to_mean;
		   v.rgb = v.rgb * strength;
		   v.rgb = (invert == 1) ? (1.0 - v.rgb) : v.rgb;
			gl_FragColor = v;
		}`
}