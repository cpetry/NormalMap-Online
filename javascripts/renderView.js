/*
 * Author: Christian Petry
 * Homepage: www.petry-christian.de
 *
 * License: MIT
 * Copyright (c) 2014 Christian Petry
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
 * OTHER DEALINGS IN THE SOFTWARE.
 */

var scene;
var camera;
var renderer;
var bump_map;
var normal_map;
var diffuse_map;
var ao_map;
var specular_map;
var material;
var rotation_enabled = true;
var normal_enabled = true;
var ao_canvas = document.createElement("canvas");
var displacement_canvas_preview = document.createElement("canvas");
var current_disp_scale;
var render_model;

var initRenderer = function(){

	camera = new THREE.PerspectiveCamera( 30, 1, 0.1, 100000 );
	//camera.position.x = 2000;
    camera.position.z = 29;
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
	
	// directional lighting with shadows
	var directionalLight = new THREE.DirectionalLight(0xdddddd, 0.5 );
	//console.log(directionalLight);
	directionalLight.position.set(40, 40, 40);
	directionalLight.castShadow = true;
	directionalLight.shadowDarkness = 0.40;
	directionalLight.shadowMapWidth = 2048;
	directionalLight.shadowMapHeight = 2048;
	directionalLight.shadowCameraFar = 100;
	directionalLight.shadowCameraRight     =  50;
	directionalLight.shadowCameraLeft     = -50;
	directionalLight.shadowCameraTop      =  50;
	directionalLight.shadowCameraBottom   = -50;
	// debug shadow
	//directionalLight.shadowCameraVisible = true;
	scene.add(directionalLight);
	
	// light without any shadows
	var dL2 = new THREE.DirectionalLight( 0xbbdbff, 0.3 );
	dL2.position.set( 0, -1, 1 );
	scene.add( dL2 );
	
	// light without any shadows
	var dL3 = new THREE.DirectionalLight( 0xbbffff, 0.25 );
	dL3.position.set( -3, 1, -1 );
	scene.add( dL3 );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	
	
	document.getElementById('render_view').appendChild( renderer.domElement );
	var height_canvas   = document.getElementById('height_canvas');
	
	displacement_map			= new THREE.Texture( displacement_canvas );
	displacement_map.wrapS 		= displacement_map.wrapT = THREE.RepeatWrapping;
	displacement_map.minFilter 	= THREE.LinearFilter;
	displacement_map.anisotropy = 2;
	diffuse_map				= new THREE.Texture( diffuse_canvas );
	diffuse_map.wrapS 		= diffuse_map.wrapT = THREE.RepeatWrapping;
	diffuse_map.minFilter 	= THREE.LinearFilter;
	diffuse_map.anisotropy  = 2;
	//bump_map  				= new THREE.Texture( height_canvas );
	ao_map  					= new THREE.Texture( ao_canvas );
	ao_map.wrapS 				= ao_map.wrapT = THREE.RepeatWrapping;
	ao_map.minFilter 			= THREE.LinearFilter;
	ao_map.anisotropy 			= 2;
	normal_map  			= new THREE.Texture( normal_canvas );
	normal_map.wrapS 		= normal_map.wrapT 		= THREE.RepeatWrapping;
	normal_map.minFilter 	= THREE.LinearFilter;
	normal_map.anisotropy 	= 2;
	specular_map  			= new THREE.Texture( specular_canvas );
	specular_map.wrapS 		= specular_map.wrapT = THREE.RepeatWrapping;
	specular_map.minFilter 	= THREE.LinearFilter;
	specular_map.anisotropy = 2;
	
	
	var shader = THREE.NormalDisplacementShader;
	
	// see ShaderLib (https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib.js)
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	//console.log(uniforms);
	uniforms[ "enableDisplacement" ].value = true;
	uniforms[ "enableDiffuse" ].value = false;
	uniforms[ "enableAO" ].value = true;
	uniforms[ "enableSpecular" ].value = true;
	
	uniforms[ "diffuse" ].value = new THREE.Color(0xbbbbbb);
	uniforms[ "specular" ].value = new THREE.Color(0x777777);
	//uniforms[ "shininess" ].value = new THREE.Color(0x777777);
	uniforms[ "ambientLightColor" ].value = new THREE.Color(0x000000);

	uniforms[ "tDiffuse"].value = diffuse_map;
	uniforms[ "tDisplacement"].value = displacement_map;
	uniforms[ "tNormal" ].value = normal_map;
	uniforms[ "tSpecular" ].value = specular_map;
	uniforms[ "tAO" ].value = ao_map;
	uniforms[ "uDisplacementScale" ].value = -0.3;
	uniforms[ "uDisplacementBias" ].value = 0;	
	
	var parameters = { 
		fragmentShader: shader.fragmentShader, 
		vertexShader: shader.vertexShader, 
		uniforms: uniforms, 
		lights: true 
	};
	material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;

	
	var st = new Date().getTime()
	// width height depth widthsegments heightsegments depthsegments
	var geometry = new THREE.BoxGeometry(10,10,10, 96, 96, 96);
	geometry.computeTangents();
	//console.log("generate geometry: " + (new Date().getTime() - st));
	
	
	st = new Date().getTime();
	render_model = new THREE.Mesh( geometry, material);
	render_model.castShadow = true;
	render_model.receiveShadow = true;
	
	
	/*var secmodel = new THREE.Mesh(new THREE.BoxGeometry(500,500,500), new THREE.MeshLambertMaterial({
		color: 'blue' 
	}));
	
	secmodel.position.set(1000,1000,1000);
	secmodel.castShadow = true;
	secmodel.receiveShadow = true;
	scene.add( secmodel );
	*/
	
	scene.add( render_model );
	//console.log("create render_model: " + (new Date().getTime() - st));

	function renderView() {
		// request new frame
        requestAnimationFrame(function(){
            renderView();
        });
		renderer.render(scene, camera);
		
		if(rotation_enabled){
			render_model.rotation.x += 0.0015;
			render_model.rotation.y += 0.0015;
		}
		//bump_map.needsUpdate = true;
		//ao_map.needsUpdate = true;
		
	}
	renderView();
}


var setRepeat = function(v_x, v_y){
	//ao_map.repeat.set( v_x, v_y );
	//normal_map.repeat.set( v_x, v_y );
	//displacement_map.repeat.set( v_x, v_y );
	//specular_map.repeat.set( v_x, v_y );
	render_model.material.uniforms[ "uRepeat" ].value = new THREE.Vector2(v_x, v_y);
	//render_model.geometry.computeTangents();

}

var setModel = function(type){
	scene.remove( render_model );

	if (type == "Cube"){
		var geometry = new THREE.BoxGeometry(10, 10, 10, 96, 96, 96);
		geometry.computeTangents();
		render_model = new THREE.Mesh( geometry, material);
		render_model.castShadow = true;
		render_model.receiveShadow = true;
		scene.add( render_model );
	}
	else if (type == "Sphere"){
		var geometry = new THREE.SphereGeometry( 7, 128, 128);
		geometry.computeTangents();
		render_model = new THREE.Mesh( geometry, material);
		render_model.castShadow = true;
		render_model.receiveShadow = true;
		scene.add( render_model );
	}
	else if (type == "Cylinder"){
		var geometry = new THREE.CylinderGeometry( 7, 7, 10, 128 );
		geometry.computeTangents();
		render_model = new THREE.Mesh( geometry, material);
		render_model.castShadow = true;
		render_model.receiveShadow = true;
		scene.add( render_model );
	}
	else if (type == "Plane"){
		var geometry = new THREE.PlaneBufferGeometry(12, 12, 128, 128);
		geometry.computeTangents();
		rotation_enabled = 0;
		render_model.rotation.x = 0;
		render_model.rotation.y = 0;
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 29;
		camera.lookAt({
        	x: 0,
        	y: 0,
	        z: 0
    	});
		document.getElementById('input_rot').checked = false;
		render_model = new THREE.Mesh( geometry, material);
		render_model.castShadow = true;
		render_model.receiveShadow = true;
		render_model.material.side = THREE.DoubleSide;
		scene.add( render_model );
	}
	
}

function setDisplacementScale(scale){
	current_disp_scale = -scale;
	updateDisplacementBias();
}

function updateDisplacementBias(){
	render_model.material.uniforms[ "uDisplacementScale" ].value = current_disp_scale * 5;
	render_model.material.uniforms[ "uDisplacementBias" ].value = current_disp_scale * 5 * -displacement_bias;
}

/*
function setDisplacementResolution(res){
	
	scene.remove( render_model );
	
	
	var geometry = new THREE.CylinderGeometry( 0.7, 0.5, 1, 32 );
	geometry.computeTangents();
	render_model = new THREE.Mesh( render_model.geometry.clone();, material);
	scene.add( render_model );
	g.widthSegments = res;
	g.heightSegments = res;
	g.depthSegments = res;
	g.computeTangents();
	render_model = new THREE.Mesh( g, material);
}
*/

function toggleRotation(){
	rotation_enabled = !rotation_enabled;
}

function toggleDisplacement(){
	if(render_model.material.uniforms[ "enableDisplacement" ].value == true)
		render_model.material.uniforms[ "enableDisplacement" ].value = false;
	else
		render_model.material.uniforms[ "enableDisplacement" ].value = true;
}

function toggleNormal(){
	if(render_model.material.uniforms[ "enableNormal" ].value == true)
		render_model.material.uniforms[ "enableNormal" ].value = false;
	else
		render_model.material.uniforms[ "enableNormal" ].value = true;
}

function toggleAO(){
	if(render_model.material.uniforms[ "enableAO" ].value == true)
		render_model.material.uniforms[ "enableAO" ].value = false;
	else
		render_model.material.uniforms[ "enableAO" ].value = true;
}

function toggleSpecular(){
	if(render_model.material.uniforms[ "enableSpecular" ].value == true)
		render_model.material.uniforms[ "enableSpecular" ].value = false;
	else
		render_model.material.uniforms[ "enableSpecular" ].value = true;
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

function toggleDiffuse(){
	if(render_model.material.uniforms[ "enableDiffuse" ].value == true)
		render_model.material.uniforms[ "enableDiffuse" ].value = false;
	else
		render_model.material.uniforms[ "enableDiffuse" ].value = true;
}

function enableDiffuse(){
	render_model.material.uniforms[ "enableDiffuse" ].value = true;
	document.getElementById('input_diffuse').disabled = false;
	document.getElementById('input_diffuse').checked = true;
}