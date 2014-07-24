var scene;
var camera;
var renderer;
var bump_map;
var normal_map;
var ao_map;
var material;
var rotation_enabled = true;
var normal_enabled = true;
var ao_canvas = document.createElement("canvas");
var displacement_canvas_preview = document.createElement("canvas");
var current_disp_scale;
var model;

var initRenderer = function(){

	camera = new THREE.PerspectiveCamera( 30, container_height / container_height, 0.1, 100000 );
	//camera.position.x = 2000;
    camera.position.z = 2900;
	camera.lookAt({
        x: 0,
        y: 0,
        z: 0
    });
	
	renderer = new THREE.WebGLRenderer({ alpha: false,  antialias: true });
	renderer.setSize( container_height, container_height );
	//renderer.physicallyBasedShading = true;
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	
	scene = new THREE.Scene();
	
	// add subtle ambient lighting
	var ambientLight = new THREE.AmbientLight(0x606060 );
	scene.add(ambientLight);
	
	// directional lighting
	var directionalLight = new THREE.DirectionalLight(0xdddddd, 0.5 );
	directionalLight.position.set(2000, 2000, 2000);
	scene.add(directionalLight);
	directionalLight.castShadow = true;
	directionalLight.shadowDarkness = 0.3;
	//directionalLight.shadowCameraVisible = true;
	directionalLight.shadowMapWidth = 2048;
    directionalLight.shadowMapHeight = 2048;
	directionalLight.shadowCameraFar = 10000;
	directionalLight.shadowCameraRight     =  5000;
	directionalLight.shadowCameraLeft     = -5000;
	directionalLight.shadowCameraTop      =  5000;
	directionalLight.shadowCameraBottom   = -5000;
	
	var dL2 = new THREE.DirectionalLight( 0xbbdbff, 0.3 );
	dL2.position.set( 0, -1, 1 );
	scene.add( dL2 );
	
	var dL2 = new THREE.DirectionalLight( 0xbbffff, 0.25 );
	dL2.position.set( -3, 1, -1 );
	scene.add( dL2 );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	
	
	document.getElementById('render_view').appendChild( renderer.domElement );

	var height_canvas   = document.getElementById('height_canvas');
	
	displacement_map			= new THREE.Texture( displacement_canvas );
	displacement_map.wrapS 		= displacement_map.wrapT = THREE.RepeatWrapping;
	displacement_map.magFilter 	= THREE.LinearFilter;
	displacement_map.minFilter 	= THREE.LinearMipMapNearestFilter;
	displacement_map.anisotropy = 2;
	//bump_map  				= new THREE.Texture( height_canvas );
	ao_map  					= new THREE.Texture( ao_canvas );
	normal_map  			= new THREE.Texture( normal_canvas );
	normal_map.wrapS 		= normal_map.wrapT 		= THREE.RepeatWrapping;
	normal_map.magFilter 	= THREE.LinearFilter;
	normal_map.minFilter 	= THREE.LinearMipMapNearestFilter;
	normal_map.anisotropy 	= 2;
	
	
	var shader = THREE.ShaderLib[ "normalmap" ];
	
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	//console.log(uniforms);
	uniforms[ "enableDisplacement" ].value = true;
	uniforms[ "enableDiffuse" ].value = false;
	uniforms[ "enableAO" ].value = true;
	
	uniforms[ "diffuse" ].value = new THREE.Color(0xcccccc);
	uniforms[ "specular" ].value = new THREE.Color(0x777777);
	uniforms[ "ambient" ].value = new THREE.Color(0x000000);

	uniforms[ "tDisplacement"].value = displacement_map;
	uniforms[ "tNormal" ].value = normal_map;
	uniforms[ "tAO" ].value = ao_map;
	uniforms[ "uDisplacementScale" ].value = 0.3;
	uniforms[ "uDisplacementBias" ].value = 0;
	
	
	var parameters = { 
		fragmentShader: shader.fragmentShader, 
		vertexShader: shader.vertexShader, 
		uniforms: uniforms, 
		lights: true 
	};
	material = new THREE.ShaderMaterial( parameters );
	//material = new THREE.MeshPhongMaterial({
    //    color: 0x6C6C6C
    //});
	material.wrapAround = true;
	//var geometry = new THREE.PlaneGeometry(16,16,128,128);
	//var geometry = new THREE.BoxGeometry(1,1,1, 128, 128, 128);

	
	var st = new Date().getTime()
	var geometry = new THREE.BoxGeometry(1000,1000,1000, 96, 96, 96);
	geometry.computeTangents();
	console.log("generate geometry: " + (new Date().getTime() - st));
	
	
	st = new Date().getTime();
	model = new THREE.Mesh( geometry, material);
	model.castShadow = true;
	model.receiveShadow = true;
	
	
	/*var secmodel = new THREE.Mesh(new THREE.BoxGeometry(500,500,500), new THREE.MeshLambertMaterial({
		color: 'blue' 
	}));
	
	secmodel.position.set(1000,1000,1000);
	secmodel.castShadow = true;
	secmodel.receiveShadow = true;
	scene.add( secmodel );
	*/
	
	scene.add( model );
	console.log("create model: " + (new Date().getTime() - st));
}



function render() {
	setTimeout( function() {
        requestAnimationFrame( render );
    }, 1000 / 30 );
	
	renderer.render(scene, camera);
	
	if(rotation_enabled){
		model.rotation.x += 0.003;
		model.rotation.y += 0.003;
	}
	//bump_map.needsUpdate = true;
	//ao_map.needsUpdate = true;
	
}


var setRepeat = function(v_x, v_y){
	//bump_map.repeat.set( v_x, v_y );
	//normal_map_preview.repeat.set( v_x, v_y );
	//displacement_map.repeat.set( v_x, v_y );
	model.material.uniforms[ "uRepeat" ].value = new THREE.Vector2(v_x, v_y);
}

var setModel = function(type){
	scene.remove( model );

	if (type == "Cube"){
		var geometry = new THREE.BoxGeometry(1000,1000,1000, 96, 96, 96);
		geometry.computeTangents();
		model = new THREE.Mesh( geometry, material);
		model.castShadow = true;
		model.receiveShadow = true;
		scene.add( model );
	}
	else if (type == "Sphere"){
		var geometry = new THREE.SphereGeometry( 700, 32, 32);
		geometry.computeTangents();
		model = new THREE.Mesh( geometry, material);
		model.castShadow = true;
		model.receiveShadow = true;
		scene.add( model );
	}
	else if (type == "Cylinder"){
		var geometry = new THREE.CylinderGeometry( 700, 700, 1000, 128 );
		geometry.computeTangents();
		model = new THREE.Mesh( geometry, material);
		model.castShadow = true;
		model.receiveShadow = true;
		scene.add( model );
	}
	else if (type == "Plane"){
		var geometry = new THREE.PlaneGeometry(1200, 1200, 128, 128);
		geometry.computeTangents();
		rotation_enabled = 0;
		
		model.rotation.x = 0;
		model.rotation.y = 0;
		document.getElementById('input_rot').checked = false;
		model = new THREE.Mesh( geometry, material);
		model.castShadow = true;
		model.receiveShadow = true;
		scene.add( model );
	}
	
}

function setDisplacementScale(scale){
	current_disp_scale = scale;
	updateDisplacementBias();
}

function updateDisplacementBias(){
	model.material.uniforms[ "uDisplacementScale" ].value = current_disp_scale * 500;
	model.material.uniforms[ "uDisplacementBias" ].value = current_disp_scale * 500 * -displacement_bias;
}

/*
function setDisplacementResolution(res){
	
	scene.remove( model );
	
	
	var geometry = new THREE.CylinderGeometry( 0.7, 0.5, 1, 32 );
	geometry.computeTangents();
	model = new THREE.Mesh( model.geometry.clone();, material);
	scene.add( model );
	g.widthSegments = res;
	g.heightSegments = res;
	g.depthSegments = res;
	g.computeTangents();
	model = new THREE.Mesh( g, material);
}
*/

function toggleRotation(){
	rotation_enabled = !rotation_enabled;
}

function toggleDisplacement(){
	if(model.material.uniforms[ "enableDisplacement" ].value == true)
		model.material.uniforms[ "enableDisplacement" ].value = false;
	else
		model.material.uniforms[ "enableDisplacement" ].value = true;
}

function toggleNormal(){
	normal_enabled = !normal_enabled;
	createNormalMap();
}

function toggleAO(){
	if(model.material.uniforms[ "enableAO" ].value == true)
		model.material.uniforms[ "enableAO" ].value = false;
	else
		model.material.uniforms[ "enableAO" ].value = true;
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
