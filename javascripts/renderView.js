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


var NMO_RenderView = new function(){

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 30, 1, 0.1, 100000 );
	this.renderer = new THREE.WebGLRenderer({ alpha: false,  antialias: true });
	this.displacement_map, this.diffuse_map, this.normal_map, this.specular_map, this.ao_map;
	this.material;
	this.rotation_enabled = true;
	this.render_model;

	this.renderView = function(){
		// request new frame
        requestAnimationFrame(function(){
            NMO_RenderView.renderView();
        });
		this.renderer.render(this.scene, this.camera);
		
		if(this.rotation_enabled){
			this.render_model.rotation.x += 0.0015;
			this.render_model.rotation.y += 0.0015;
		}
		//console.log("rendering");
	};


	this.initRenderer = function(){

		this.renderer.setSize( NMO_FileDrop.container_height, NMO_FileDrop.container_height );
		//renderer.physicallyBasedShading = true;
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
		document.getElementById('render_view').appendChild( this.renderer.domElement );
		
		//camera.position.x = 2000;
	    this.camera.position.z = 29;
		this.camera.lookAt({
	        x: 0,
	        y: 0,
	        z: 0
	    });
		
		var controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		
		// add subtle ambient lighting
		var ambientLight = new THREE.AmbientLight(0x606060 );
		this.scene.add(ambientLight);
		
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
		this.scene.add(directionalLight);
		
		// light without any shadows
		var dL2 = new THREE.DirectionalLight( 0xbbdbff, 0.3 );
		dL2.position.set( 0, -1, 1 );
		this.scene.add( dL2 );
		
		// light without any shadows
		var dL3 = new THREE.DirectionalLight( 0xbbffff, 0.25 );
		dL3.position.set( -3, 1, -1 );
		this.scene.add( dL3 );
		
		
		
		//var height_canvas   = document.getElementById('height_canvas');
		
		this.displacement_map				= new THREE.Texture( NMO_DisplacementMap.displacement_canvas );
		this.displacement_map.wrapS 		= this.displacement_map.wrapT = THREE.RepeatWrapping;
		this.displacement_map.minFilter 	= THREE.LinearFilter;
		this.displacement_map.anisotropy 	= 2;
		this.diffuse_map				= new THREE.Texture( diffuse_canvas );
		this.diffuse_map.wrapS 			= this.diffuse_map.wrapT = THREE.RepeatWrapping;
		this.diffuse_map.minFilter 		= THREE.LinearFilter;
		this.diffuse_map.anisotropy  	= 2;
		//bump_map  				= new THREE.Texture( height_canvas );
		this.ao_map  			= new THREE.Texture( NMO_AmbientOccMap.ao_canvas );
		this.ao_map.wrapS 		= this.ao_map.wrapT = THREE.RepeatWrapping;
		this.ao_map.minFilter 	= THREE.LinearFilter;
		this.ao_map.anisotropy 	= 2;
		this.normal_map  			= new THREE.Texture( NMO_NormalMap.normal_canvas );
		this.normal_map.wrapS 		= this.normal_map.wrapT 		= THREE.RepeatWrapping;
		this.normal_map.minFilter 	= THREE.LinearFilter;
		this.normal_map.anisotropy 	= 2;
		this.specular_map  				= new THREE.Texture( NMO_SpecularMap.specular_canvas );
		this.specular_map.wrapS 		= this.specular_map.wrapT = THREE.RepeatWrapping;
		this.specular_map.minFilter 	= THREE.LinearFilter;
		this.specular_map.anisotropy 	= 2;
		
		
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

		uniforms[ "tDiffuse"].value 	 = this.diffuse_map;
		uniforms[ "tDisplacement"].value = this.displacement_map;
		uniforms[ "tNormal" ].value 	 = this.normal_map;
		uniforms[ "tSpecular" ].value 	 = this.specular_map;
		uniforms[ "tAO" ].value 		 = this.ao_map;
		uniforms[ "uDisplacementScale" ].value = -0.3;
		uniforms[ "uDisplacementBias" ].value = 0;	
		
		var parameters = { 
			fragmentShader: shader.fragmentShader, 
			vertexShader: shader.vertexShader, 
			uniforms: uniforms, 
			lights: true 
		};
		this.material = new THREE.ShaderMaterial( parameters );
		this.material.wrapAround = true;

		
		// width height depth widthsegments heightsegments depthsegments
		this.setModel("Cube");

		//console.log("init done");
		this.renderView();
	};


	this.setRepeat = function(v_x, v_y){
		this.render_model.material.uniforms[ "uRepeat" ].value = new THREE.Vector2(v_x, v_y);
	};


	this.setModel = function(type){
		this.scene.remove( this.render_model );

		if (type == "Cube"){
			var geometry = new THREE.BoxGeometry(10, 10, 10, 96, 96, 96);
			geometry.computeTangents();
			this.render_model = new THREE.Mesh( geometry, this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
		}
		else if (type == "Sphere"){
			var geometry = new THREE.SphereGeometry( 7, 128, 128);
			geometry.computeTangents();
			this.render_model = new THREE.Mesh( geometry, this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
		}
		else if (type == "Cylinder"){
			var geometry = new THREE.CylinderGeometry( 7, 7, 10, 128 );
			geometry.computeTangents();
			this.render_model = new THREE.Mesh( geometry, this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
		}
		else if (type == "Plane"){
			var geometry = new THREE.PlaneBufferGeometry(12, 12, 128, 128);
			geometry.computeTangents();
			this.rotation_enabled = 0;
			this.render_model.rotation.x = 0;
			this.render_model.rotation.y = 0;
			this.camera.position.x = 0;
			this.camera.position.y = 0;
			this.camera.position.z = 29;
			this.camera.lookAt({
	        	x: 0,
	        	y: 0,
		        z: 0
	    	});
			document.getElementById('input_rot').checked = false;
			this.render_model = new THREE.Mesh( geometry, this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.render_model.material.side = THREE.DoubleSide;
			this.scene.add( this.render_model );
		}		
	};



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

	this.toggleRotation = function(){
		this.rotation_enabled = !this.rotation_enabled;
	};

	this.toggleDisplacement = function(){
		if(this.render_model.material.uniforms[ "enableDisplacement" ].value == true)
			this.render_model.material.uniforms[ "enableDisplacement" ].value = false;
		else
			this.render_model.material.uniforms[ "enableDisplacement" ].value = true;
	};

	this.toggleNormal = function(){
		if(this.render_model.material.uniforms[ "enableNormal" ].value == true)
			this.render_model.material.uniforms[ "enableNormal" ].value = false;
		else
			this.render_model.material.uniforms[ "enableNormal" ].value = true;
	};

	this.toggleAO = function(){
		if(this.render_model.material.uniforms[ "enableAO" ].value == true)
			this.render_model.material.uniforms[ "enableAO" ].value = false;
		else
			this.render_model.material.uniforms[ "enableAO" ].value = true;
	};

	this.toggleSpecular = function(){
		if(this.render_model.material.uniforms[ "enableSpecular" ].value == true)
			this.render_model.material.uniforms[ "enableSpecular" ].value = false;
		else
			this.render_model.material.uniforms[ "enableSpecular" ].value = true;
	};


	this.toggleDiffuse = function(){
		if(this.render_model.material.uniforms[ "enableDiffuse" ].value == true)
			this.render_model.material.uniforms[ "enableDiffuse" ].value = false;
		else
			this.render_model.material.uniforms[ "enableDiffuse" ].value = true;
	};

	this.enableDiffuse = function(){
		this.render_model.material.uniforms[ "enableDiffuse" ].value = true;
		document.getElementById('input_diffuse').disabled = false;
		document.getElementById('input_diffuse').checked = true;
	};

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
	});

	$(".big_preview").fancybox({
		maxWidth	: 800,
		maxHeight	: 800,
		fitToView	: false,
		width		: 800,
		height		: 800,
		autoSize	: false,
		closeClick	: false,
		openEffect	: 'none',
		closeEffect	: 'none',
		
		afterShow: function(){
			document.getElementById('renderBig').appendChild(NMO_RenderView.renderer.domElement);
			NMO_RenderView.renderer.setSize( 800, 800 );

		},
		afterClose: function(){
			document.getElementById('render_view').appendChild(NMO_RenderView.renderer.domElement);
			NMO_RenderView.renderer.setSize(NMO_FileDrop.container_height, NMO_FileDrop.container_height );
		}
	});
});