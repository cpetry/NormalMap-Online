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
	this.customModel;
	this.textureCube;
	
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
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
		//directionalLight.shadowDarkness = 0.40;
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		directionalLight.shadow.camera.far = 100;
		directionalLight.shadow.camera.right     =  50;
		directionalLight.shadow.camera.left     = -50;
		directionalLight.shadow.camera.top      =  50;
		directionalLight.shadow.camera.bottom   = -50;
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
		this.ao_map  			= new THREE.Texture( NMO_AmbientOccMap.ao_canvas );
		this.ao_map.wrapS 		= this.ao_map.wrapT = THREE.RepeatWrapping;
		this.ao_map.minFilter 	= THREE.LinearFilter;
		this.ao_map.anisotropy 	= 2;
		this.normal_map  			= new THREE.Texture( NMO_NormalMap.normal_canvas );
		this.normal_map.wrapS 		= this.normal_map.wrapT = THREE.RepeatWrapping;
		this.normal_map.minFilter 	= THREE.LinearFilter;
		this.normal_map.anisotropy 	= 2;
		this.specular_map  				= new THREE.Texture( NMO_SpecularMap.specular_canvas );
		this.specular_map.wrapS 		= this.specular_map.wrapT = THREE.RepeatWrapping;
		this.specular_map.minFilter 	= THREE.LinearFilter;
		this.specular_map.anisotropy 	= 2;

		var loader = new THREE.CubeTextureLoader();
		loader.setPath( 'cubemaps/park/' );

		this.textureCube = loader.load( [
			'posx.jpg', 'negx.jpg',
			'posy.jpg', 'negy.jpg',
			'posz.jpg', 'negz.jpg'
		] );
		
		
		//var shader = THREE.NormalDisplacementShader;
		var shader = THREE.ShaderLib.phong
		
		// see ShaderLib (https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib.js)
		var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
		
		//uniforms[ "diffuse" ].value = new THREE.Color(0xbbbbbb);
		//uniforms[ "specular" ].value = new THREE.Color(0x777777);
		//uniforms[ "ambientLightColor" ].value = new THREE.Color(0x000000);

		console.log(this.diffuse_map);
		//uniforms["color"].value 	           = new THREE.Color("rgb(255, 0, 0)");
		var textureLoader = new THREE.TextureLoader();

		shaderUniforms = uniforms;
		//shaderUniforms.aoMap = this.ao_map;
		console.log(shaderUniforms);

		var defines = {};

		//defines[ "USE_MAP" ] = "";
		defines[ "USE_SPECULARMAP" ] = "";
		if (document.getElementById('input_displacement').checked)
			defines[ "USE_DISPLACEMENTMAP" ] = "";
		defines[ "USE_AOMAP" ] = "";
		
		
		//defines[ "USE_LIGHTMAP" ] = "";
		defines[ "USE_NORMALMAP" ] = "";

		this.material = new THREE.ShaderMaterial( { 
			name: "renderViewShader",
			defines: defines,
			uniforms: shaderUniforms,
			vertexShader: shader.vertexShader, 
			fragmentShader: shader.fragmentShader,
			//transparent: true,
			lights: true
		} );

		this.material.extensions.derivatives = true;  // needed for normalmap
		this.material.uniforms.map.value = this.diffuse_map;
		this.material.uniforms.normalMap.value = this.normal_map;
		this.material.uniforms.specularMap.value = this.specular_map;
		this.material.uniforms.displacementMap.value = this.displacement_map;
		//this.material.uniforms.lightMap.value = textureCube;
		this.material.uniforms.envMap.value = this.textureCube;
		this.material.uniforms.aoMap.value = this.ao_map;
		this.material.uniforms.displacementScale.value = -0.3
		this.material.uniforms.displacementBias.value = 0;
		this.material.uniforms.diffuse.value = new THREE.Color(0xbbbbbb);
		this.material.uniforms.specular.value = new THREE.Color(0x777777);
		//this.material.unshininess.value = 40;
		this.material.uniforms.ambientLightColor.value = new THREE.Color(0x777777);
		this.setModel("Cube");

		//this.scene.background = textureCube;
		
		//console.log("init done");
		this.renderView();
	};


	this.setRepeat = function(v_x, v_y){
		this.render_model.material.uniforms.offsetRepeat.value = new THREE.Vector4(0,0,v_x, v_y);
		this.render_model.material.needsUpdate = true;		
	};


	this.setModel = function(type){
		this.scene.remove( this.render_model );

		if (type == "Cube"){
			var geometry = new THREE.BoxGeometry(10, 10, 10, 96, 96, 96);
			//geometry.computeTangents();
			this.render_model = new THREE.Mesh( new THREE.BufferGeometry().fromGeometry( geometry), this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
		}
		else if (type == "Sphere"){
			var geometry = new THREE.SphereGeometry( 7, 128, 128);
			//geometry.computeTangents();
			this.render_model = new THREE.Mesh( new THREE.BufferGeometry().fromGeometry( geometry), this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
		}
		else if (type == "Cylinder"){
			var geometry = new THREE.CylinderGeometry( 7, 7, 10, 128 );
			//geometry.computeTangents();
			this.render_model = new THREE.Mesh( new THREE.BufferGeometry().fromGeometry( geometry), this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
		}
		else if (type == "Plane"){
			var geometry = new THREE.PlaneBufferGeometry(12, 12, 128, 128);
			//geometry.computeTangents();
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
			this.render_model = new THREE.Mesh( new THREE.BufferGeometry().fromGeometry( geometry), this.material);
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.render_model.material.side = THREE.DoubleSide;
			this.scene.add( this.render_model );
		}
		else if (type == "Teapot"){
			var geometry = new THREE.TeapotBufferGeometry( 3, //teapotSize,
				15, // tesselation?!
				true, // bottom
				true, // lid
				true, // body
				true, // fitLid,
				true // nonblinn
				);

			this.render_model = new THREE.Mesh(	geometry, this.material );	// if no match, pick Phong
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
			this.setDisplacement(false);
		}		
		else if (type == "Custom" && this.customModel){
			this.render_model = this.customModel;
			this.render_model.castShadow = true;
			this.render_model.receiveShadow = true;
			this.scene.add( this.render_model );
		}
	};

				

	this.setDisplacementOptions = function(scale, bias){
		this.render_model.material.uniforms[ "displacementScale" ].value = scale * 5;
		this.render_model.material.uniforms[ "displacementBias" ].value = scale * 5 * - bias;
	}

	this.toggleRotation = function(){
		this.rotation_enabled = !this.rotation_enabled;
	};

	this.setDisplacement = function(displacement){
		if (!displacement || this.render_model.material.defines["USE_DISPLACEMENTMAP"] == ""){
			delete this.render_model.material.defines["USE_DISPLACEMENTMAP"];
		}
		else{
			this.render_model.material.defines["USE_DISPLACEMENTMAP"] = "";
		}
		this.render_model.material.needsUpdate = true;
	};

	this.toggleNormal = function(){
		if (this.render_model.material.defines["USE_NORMALMAP"] == "")
			delete this.render_model.material.defines["USE_NORMALMAP"];
		else
			this.render_model.material.defines["USE_NORMALMAP"] = "";
		this.render_model.material.needsUpdate = true;
	};

	this.toggleAO = function(){
		if (this.render_model.material.defines["USE_AOMAP"] == "")
			delete this.render_model.material.defines["USE_AOMAP"];
		else
			this.render_model.material.defines["USE_AOMAP"] = "";
		this.render_model.material.needsUpdate = true;
	};

	this.toggleSpecular = function(){
		if (this.render_model.material.defines["USE_SPECULARMAP"] == "")
			delete this.render_model.material.defines["USE_SPECULARMAP"];
		else
			this.render_model.material.defines["USE_SPECULARMAP"] = "";
		this.render_model.material.needsUpdate = true;
	};


	this.toggleDiffuse = function(){
		if (this.render_model.material.defines["USE_MAP"] == "")
			delete this.render_model.material.defines["USE_MAP"];
		else
			this.render_model.material.defines["USE_MAP"] = "";
		this.render_model.material.needsUpdate = true;
	};

	this.enableDiffuse = function(){
		this.render_model.material.defines["USE_MAP"] = "";
		document.getElementById('input_diffuse').disabled = false;
		document.getElementById('input_diffuse').checked = true;

		this.render_model.material.needsUpdate = true;
	};

	this.setEnvironment = function(environment){
		if (!environment){
			delete this.render_model.material.defines["USE_ENVMAP"];
			delete this.render_model.material.defines["ENVMAP_MODE_REFLECTION"];
			delete this.render_model.material.defines["ENVMAP_TYPE_CUBE"];
			delete this.render_model.material.defines["ENVMAP_BLENDING_MIX"];
			this.scene.background = "";
		}
		else{
			this.render_model.material.defines["USE_ENVMAP"] = "";
			this.render_model.material.defines["ENVMAP_MODE_REFLECTION"] = "";
			this.render_model.material.defines["ENVMAP_TYPE_CUBE"] = "";
			this.render_model.material.defines["ENVMAP_BLENDING_MIX"] = "";
			//this.scene.background = this.textureCube;
		}
		this.render_model.material.needsUpdate = true;
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