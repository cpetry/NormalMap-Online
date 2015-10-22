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

	vertexShader: [
		"precision mediump float;",
        "varying vec2 vUv;",
		"uniform float flipY;",
        "void main() {",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"vUv = uv;",
			"vUv.y = (flipY > 0.0) ? (1.0 - vUv.y) : vUv.y;",
		"}"
	].join("\n"),

	fragmentShader: [
		"precision mediump float;",
        "varying vec2 vUv;",
        "uniform float range;",
        "uniform float strength;",
        "uniform float mean;",
        "uniform float level;",
        "uniform float invert;",
		"uniform sampler2D tHeight;",
        
		"void main(void) {",
		//"	gl_FragColor = texture2D(tAbove, vUv);",
		// Lower value
		"	vec4 v = vec4(texture2D(tHeight,  vUv.xy));",
		// inside range around mean value?!
		//var per_dist_to_mean = (this.ao_range - Math.abs(v - this.ao_mean)) / this.ao_range;
		//v = per_dist_to_mean > 0 ? Math.sqrt(per_dist_to_mean,2) : 0;
		"	float perc_dist_to_mean = (range - abs(v.r - mean)) / range;",
		"	v.r = v.g = v.b = ((perc_dist_to_mean > 0.0) ? sqrt(perc_dist_to_mean) : 0.0 );",
		// multiply by strength
		//v = v * (1-this.ao_strength);
		"   v.rgb = v.rgb + (vec3(1,1,1) - v.rgb) * (1.0 - strength);",
		// invert if necessary
		//v = (!this.invert_ao) ? (1 - v) : v;
		//ao_map.data[i]   = ao_map.data[i+1] = ao_map.data[i+2] = v*255;
		"   v.rgb = (invert > 0.5) ? (1.0 - v.rgb) : v.rgb;",
		"	gl_FragColor = v;",
		"}"
	].join("\n")

}