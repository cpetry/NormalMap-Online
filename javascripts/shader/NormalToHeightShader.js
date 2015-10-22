THREE.NormalToHeightShader = {
	uniforms: {
		//"type": 		{type: "1i", value: 0},
    	"tAbove": 	{type: "t", value: null },
    	"tLeft": 	{type: "t", value: null },
    	"tRight": 	{type: "t", value: null },
    	"tBelow": 	{type: "t", value: null }
	},

	vertexShader: [
		"precision mediump float;",
        "varying vec2 vUv;",
        "void main() {",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"vUv = uv;",
			"vUv.y = 1.0 - vUv.y;",
		"}"
	].join("\n"),

	fragmentShader: [
		"precision mediump float;",
        "varying vec2 vUv;",
        //"uniform int type;",
		"uniform sampler2D tAbove;",
		"uniform sampler2D tLeft;",
		"uniform sampler2D tRight;",
		"uniform sampler2D tBelow;",
        
		"void main(void) {",
		//"	gl_FragColor = texture2D(tBelow, vUv);",
		//"	gl_FragColor = vec4(1,1,0,1);",
		"	vec4 sum = (texture2D(tAbove, vUv) + texture2D(tLeft, vUv) + texture2D(tRight, vUv) + texture2D(tBelow, vUv)) / 4.0;",
		"	float gray = dot(sum.rgb, vec3(0.299, 0.587, 0.114));",
		"	gl_FragColor.rgb = vec3(gray, gray, gray);",
		"	gl_FragColor.a = sum.a;",
		"}"
	].join("\n")

}