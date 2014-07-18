var scene;
var camera;
var renderer;
var bump_map;
var ao_map;
var normal_map;
var normal_map_preview;
var material;
var rotation_enabled = true;
var displacement_enabled = true;
var normal_canvas_preview = document.createElement("canvas");
var ao_canvas = document.createElement("canvas");
var displacement_canvas = document.createElement("canvas");
var model;

var initRenderer = function(){

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, container_height / container_height, 0.1, 100 );

	renderer = new THREE.WebGLRenderer({ alpha: false, antialiasing: true  });
	renderer.setSize( container_height, container_height );
	//renderer.physicallyBasedShading = true;
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFShadowMap;
				
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	
	
	document.getElementById('render_view').appendChild( renderer.domElement );

	var height_canvas   = document.getElementById('height_canvas');
	
	displacement_map			= new THREE.Texture( displacement_canvas );
	displacement_map.wrapS 		= THREE.RepeatWrapping;
	displacement_map.wrapT 		= THREE.RepeatWrapping;
	displacement_map.magFilter 	= THREE.LinearFilter;
	displacement_map.minFilter 	= THREE.LinearMipMapNearestFilter;
	displacement_map.anisotropy = 2;
	bump_map  				= new THREE.Texture( height_canvas );
	ao_map  				= new THREE.Texture( ao_canvas );
	normal_map_preview  			= new THREE.Texture( normal_canvas_preview );
	normal_map_preview.wrapS 		= THREE.RepeatWrapping;
	normal_map_preview.wrapT 		= THREE.RepeatWrapping;
	normal_map_preview.magFilter 	= THREE.LinearFilter;
	normal_map_preview.minFilter 	= THREE.LinearMipMapNearestFilter;
	normal_map_preview.anisotropy 	= 2;
	
	
	var shader = THREE.ShaderLib[ "normalmap" ];
	
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	//console.log(uniforms);
	uniforms[ "enableDisplacement" ].value = true;
	uniforms[ "enableDiffuse" ].value = false;
	uniforms[ "enableAO" ].value = false;
	
	uniforms[ "diffuse" ].value = new THREE.Color(0xcccccc);
	uniforms[ "specular" ].value = new THREE.Color(0x777777);
	uniforms[ "ambient" ].value = new THREE.Color(0x606060);
	uniforms[ "tDisplacement"].value = displacement_map;
	uniforms[ "tNormal" ].value = normal_map_preview;
	uniforms[ "tAO" ].value = ao_map;
	uniforms[ "uDisplacementScale" ].value = 0.3;
	uniforms[ "uDisplacementBias" ].value = 0;
	
	var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true };
	material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;
	//var geometry = new THREE.PlaneGeometry(16,16,128,128);
	//var geometry = new THREE.BoxGeometry(1,1,1, 128, 128, 128);
	var geometry = new THREE.BoxGeometry(1,1,1, 128, 128, 128);
	geometry.computeTangents();
	
	model = new THREE.Mesh( geometry, material);
	model.castShadow = true;
	model.receiveShadow = true;
	scene.add( model );
	
	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x606060 );
	scene.add(ambientLight);
	
	// directional lighting
	
	var directionalLight = new THREE.DirectionalLight(0xdddddd, 0.4 );
	directionalLight.position.set(1, 1, 1);
	directionalLight.castShadow = true;
	directionalLight.shadowCameraNear = 1;
	directionalLight.shadowCameraFov = 70;
	directionalLight.shadowBias = 1;
	directionalLight.shadowMapWidth = 512;
	directionalLight.shadowMapHeight = 512;
	scene.add(directionalLight);	
	
	var dL2 = new THREE.DirectionalLight( 0xbbdbff, 0.3 );
	dL2.position.set( 0, -1, 1 );
	scene.add( dL2 );
	
	var dL2 = new THREE.DirectionalLight( 0xbbffff, 0.25 );
	dL2.position.set( -3, 1, -1 );
	scene.add( dL2 );
	
	
	camera.position.z = 1.5;
}


function animate() {
    setTimeout( function() {
        requestAnimationFrame( animate );
    }, 1000 / 30 );
    renderer.render();

}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	if(rotation_enabled){
		model.rotation.x += 0.003;
		model.rotation.y += 0.003;
	}
	normal_map_preview.needsUpdate = true;
	displacement_map.needsUpdate = true;
	bump_map.needsUpdate = true;
	ao_map.needsUpdate = true;
	
}


var setRepeat = function(v_x, v_y){
	normal_map_preview.repeat.set( v_x, v_y );
}

var setModel = function(type){
	scene.remove( model );

	if (type == "Cube"){
		var geometry = new THREE.BoxGeometry(1,1,1, 128, 128, 128);
		geometry.computeTangents();
		model = new THREE.Mesh( geometry, material);
		model.castShadow = true;
		model.receiveShadow = true;
		scene.add( model );
	}
	else if (type == "Sphere"){
		var geometry = new THREE.SphereGeometry( 0.7, 32, 32);
		geometry.computeTangents();
		model = new THREE.Mesh( geometry, material);
		scene.add( model );
	}
	else if (type == "Cylinder"){
		var geometry = new THREE.CylinderGeometry( 0.7, 0.5, 1, 32 );
		geometry.computeTangents();
		model = new THREE.Mesh( geometry, material);
		scene.add( model );
	}
	else if (type == "Plane"){
		var geometry = new THREE.PlaneGeometry(1, 1, 128, 128);
		geometry.computeTangents();
		rotation_enabled = 0;
		model.rotation.x = 0;
		model.rotation.y = 0;
		document.getElementById('input_rot').checked = false;
		model = new THREE.Mesh( geometry, material);
		scene.add( model );
	}
	
}

function setDisplacementScale(scale){
	model.material.uniforms[ "uDisplacementScale" ].value = scale * 0.5;
	model.material.uniforms[ "uDisplacementBias" ].value = scale * 0.5 * -displacement_bias;
}


function toggleRotation(){
	rotation_enabled = !rotation_enabled;
}

function toggleDisplacement(){
	displacement_enabled = !displacement_enabled;
	model.material.uniforms[ "enableDisplacement" ].value = displacement_enabled;
	/*if (!displacement_enabled){
		model.material.uniforms[ "uDisplacementScale" ].value = 0;
		model.material.uniforms[ "uDisplacementBias" ].value = 0;
	}*/
}

function switchRenderView(){
	
}

$(document).ready(function() {
	$(".various").fancybox({
		maxWidth	: 600,
		maxHeight	: 600,
		fitToView	: false,
		width		: 600,
		height		: 600,
		autoSize	: false,
		closeClick	: false,
		openEffect	: 'none',
		closeEffect	: 'none',
		
		afterShow: function(){
			document.getElementById('renderBig').appendChild(renderer.domElement);
			renderer.setSize( 600, 600 );

		},
		afterClose: function(){
			document.getElementById('render_view').appendChild(renderer.domElement);
			renderer.setSize(container_height, container_height );
		}
	});
});
