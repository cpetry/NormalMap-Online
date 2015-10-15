THREE.NormalToHeightShader = {
	uniforms: {
		//"type": 		{type: "1i", value: 0},
    	"dimensions": 	{type: "fv", value: [0, 0, 0]},
    	"tNormalMap": 	{type: "t", value: null }
	},

	vertexShader: [
		"precision mediump float;",
        "varying vec2 vUv;",
		"varying vec2 step;",
        "uniform vec3 dimensions;",
        "void main() {",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"step = vec2(-1.0 / dimensions.x, -1.0 / dimensions.y);", // - to switch from glsl orientation to my orientation :D
			"vUv = uv;",
		"}"
	].join("\n"),

	fragmentShader: [
		"precision mediump float;",
        "uniform vec3 dimensions;",
        "varying vec2 vUv;",
        "varying vec2 step;",
        //"uniform int type;",
		"uniform sampler2D tNormalMap;",
        
		"void main(void) {",
		//"	gl_FragColor = texture2D(tAbove, vUv);",
		// Lower value
		"	gl_FragColor = vec4(0.5,0.5,0.5,0.5);",
		"}"
	].join("\n")

}