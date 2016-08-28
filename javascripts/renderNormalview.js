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


var NMO_RenderNormalview = new function(){

	this.renderer_Normalview;
	this.composer_Normalview;
	this.scene_Normalview;
	this.camera_Normalview;
	this.gaussian_shader_y, this.gaussian_shader_x, this.gaussian_shader;
	this.NormalRenderScene;
	this.normalmap_uniforms, this.normalmap_from_pictures_uniforms;
	this.normal_map_material, this.normal_map_from_pictures_material;
	this.render_mesh;
	this.mesh_geometry;

	this.normal_to_height_canvas;
	this.height_from_normal_img_data;

	this.height_map;
	this.picture_above_map, this.picture_left_map, this.picture_right_map, this.picture_below_map;

	this.renderNormalView = function() {
		this.composer_Normalview.render( 1 / 60 );		
	};

	this.renderNormalview_init = function() {
		
		this.renderer_Normalview = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: NMO_NormalMap.normal_canvas });
		this.renderer_Normalview.setClearColor( 0x000000, 0 ); // the default
		//camera_Normalview = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 10 );
		this.camera_Normalview = new THREE.OrthographicCamera(  1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0, 1);
		this.scene_Normalview = new THREE.Scene();
		
		
		// start the renderer
		this.renderer_Normalview.setSize(NMO_FileDrop.height_image.width, NMO_FileDrop.height_image.height);
		
		// attach the render-supplied DOM element
		//$('#normal_map').append(renderer_Normalview.domElement);

		// normal map shader
		var normal_map_shader = THREE.NormalMapShader;
		this.normalmap_uniforms = THREE.UniformsUtils.clone( normal_map_shader.uniforms );
		
		this.height_map				= new THREE.Texture( NMO_FileDrop.height_image );
		this.height_map.wrapS 		= this.height_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.height_map.minFilter 	= this.height_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.height_map.anisotropy  = 2;
		this.normalmap_uniforms["tHeightMap"].value = this.height_map;
		this.normalmap_uniforms["dimensions"].value = [NMO_FileDrop.height_image.width, NMO_FileDrop.height_image.height, 0];
		this.normalmap_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));
		
		var normal_map_parameters = {
			fragmentShader: normal_map_shader.fragmentShader, 
			vertexShader: normal_map_shader.vertexShader, 
			uniforms: this.normalmap_uniforms
		};

		// normal map from pictures shader
		var normal_map_from_pictures_shader = THREE.NormalMapFromPicturesShader;
		this.normalmap_from_pictures_uniforms = THREE.UniformsUtils.clone( normal_map_from_pictures_shader.uniforms );
		
		this.picture_above_map				= new THREE.Texture( NMO_FileDrop.picture_above );
		this.picture_above_map.wrapS 		= this.picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.picture_above_map.minFilter 	= this.picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.picture_above_map.anisotropy  	= 2;
		this.picture_left_map				= new THREE.Texture( NMO_FileDrop.picture_left );
		this.picture_left_map.wrapS 		= this.picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.picture_left_map.minFilter 	= this.picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.picture_left_map.anisotropy   	= 2;
		this.picture_right_map				= new THREE.Texture( NMO_FileDrop.picture_right );
		this.picture_right_map.wrapS 		= this.picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.picture_right_map.minFilter 	= this.picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.picture_right_map.anisotropy  	= 2;
		this.picture_below_map				= new THREE.Texture( NMO_FileDrop.picture_below );
		this.picture_below_map.wrapS 		= this.picture_above_map.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.picture_below_map.minFilter 	= this.picture_above_map.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.picture_below_map.anisotropy  	= 2;
		this.normalmap_from_pictures_uniforms["tAbove"].value = this.picture_above_map;
		this.normalmap_from_pictures_uniforms["tLeft"].value = this.picture_left_map;
		this.normalmap_from_pictures_uniforms["tRight"].value = this.picture_right_map;
		this.normalmap_from_pictures_uniforms["tBelow"].value = this.picture_below_map;
		this.normalmap_from_pictures_uniforms["dimensions"].value = [NMO_FileDrop.picture_above.width, NMO_FileDrop.picture_above.height, 0];
		//normalmap_from_pictures_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));

		var normal_map_from_pictures_parameters = { 
			fragmentShader: normal_map_from_pictures_shader.fragmentShader, 
			vertexShader: normal_map_from_pictures_shader.vertexShader, 
			uniforms: this.normalmap_from_pictures_uniforms
		};

		this.normal_map_material = new THREE.ShaderMaterial( normal_map_parameters );
		//this.normal_map_material.wrapAround = true;
		this.normal_map_material.transparent = true;
		this.normal_map_from_pictures_material = new THREE.ShaderMaterial( normal_map_from_pictures_parameters );
		//this.normal_map_from_pictures_material.wrapAround = true;
		this.normal_map_from_pictures_material.transparent = true;
		

		//geometry = new THREE.PlaneBufferGeometry(2, 2, 2, 2);
		this.mesh_geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
		this.render_mesh = new THREE.Mesh( this.mesh_geometry, this.normal_map_material );
		this.render_mesh.name = "mesh";
		
		this.scene_Normalview.add(this.render_mesh);
		
		this.NormalRenderScene = new THREE.RenderPass( this.scene_Normalview, this.camera_Normalview );
		//NormalRenderScene.renderToScreen = true;

		// Prepare the blur shader passes
		this.gaussian_shader_y = new THREE.ShaderPass( THREE.VerticalBlurShader );
		this.gaussian_shader_x = new THREE.ShaderPass( THREE.HorizontalBlurShader );
		 
		var bluriness = 0;
	 
		this.gaussian_shader_y.uniforms[ "v" ].value = bluriness / NMO_FileDrop.height_image.width;
		this.gaussian_shader_x.uniforms[ "h" ].value = bluriness / NMO_FileDrop.height_image.height;

		this.gaussian_shader_x.renderToScreen = true;

		/*this.gaussian_shader.uniforms[ "sigma" ].value = bluriness / NMO_FileDrop.height_image.height;
		this.gaussian_shader.uniforms[ "dimensions" ].value = [NMO_FileDrop.picture_above.width, NMO_FileDrop.picture_above.height, 0];
		this.gaussian_shader.renderToScreen = true;*/

		//copyPass = new THREE.ShaderPass( THREE.CopyShader );
		//copyPass.renderToScreen = true;
		//composer_Normalview.addPass( copyPass );

		var renderTargetParameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBufer: false };
		renderTarget = new THREE.WebGLRenderTarget( NMO_FileDrop.height_image.width, NMO_FileDrop.height_image.height, renderTargetParameters );
		this.composer_Normalview = new THREE.EffectComposer( this.renderer_Normalview, renderTarget );
		this.composer_Normalview.setSize( NMO_FileDrop.height_image.width, NMO_FileDrop.height_image.height );
		this.composer_Normalview.addPass( this.NormalRenderScene );
		this.composer_Normalview.addPass( this.gaussian_shader_y );	
		this.composer_Normalview.addPass( this.gaussian_shader_x );
		
		
		
		// draw!
		this.renderNormalView();		
	};


	this.reinitializeShader = function(material_type){
		var selectedObject = this.scene_Normalview.getObjectByName("mesh");
		this.scene_Normalview.remove(selectedObject);
		if (material_type == "pictures")
			this.render_mesh = new THREE.Mesh( this.mesh_geometry, this.normal_map_from_pictures_material );
		else if (material_type == "height")
			this.render_mesh = new THREE.Mesh( this.mesh_geometry, this.normal_map_material );
		this.render_mesh.name = "mesh";
		this.scene_Normalview.add(this.render_mesh);
		this.render_mesh.buffersNeedUpdate = true;
		this.render_mesh.uvsNeedUpdate = true;
		this.render_mesh.needUpdate = true;
		this.renderNormalView();
	};


	this.renderNormalview_update = function(map){
		//composer_Normalview = new THREE.EffectComposer( renderer_Normalview, renderTarget );
		
		var img = (map === "height") ? NMO_FileDrop.height_image : NMO_FileDrop.picture_above;
		//console.log(img);
		img.width = NMO_FileDrop.container_height;
		img.height = NMO_FileDrop.container_height;
		//console.log(img.width);
		
		var context = NMO_FileDrop.height_canvas.getContext("2d");
		context.clearRect(0, 0, NMO_FileDrop.height_canvas.width, NMO_FileDrop.height_canvas.height);
		
		NMO_FileDrop.height_canvas.width = img.width;
		NMO_FileDrop.height_canvas.height = img.height;
		
		var ratio = img.naturalWidth / img.naturalHeight;
		var draw_width = ratio > 1 ? img.width : (img.width * ratio);
		var draw_height = ratio > 1 ? (img.height / ratio) : img.height;
		context.drawImage(img, NMO_FileDrop.container_height/2 - draw_width/2, 
							NMO_FileDrop.container_height/2 - draw_height/2, draw_width, draw_height);
		img.width = img.naturalWidth;
		img.height = img.naturalHeight;

		var size_text = "" + (img.width) + " x " + (img.height);
		size_text += (!NMO_FileDrop.isPowerOf2(img.width) || !NMO_FileDrop.isPowerOf2(img.height)) ? " NOT POWER OF 2 !" : "";
		document.getElementById("size").value = size_text;
		
		
		if (map === "height"){
			this.height_map.image = NMO_FileDrop.height_image;
		
			this.normalmap_uniforms["tHeightMap"].value = this.height_map;
			this.normalmap_uniforms["dimensions"].value = [img.naturalWidth, img.naturalHeight, 0];

			this.renderer_Normalview.setSize( img.naturalWidth, img.naturalHeight );
			this.composer_Normalview.setSize( img.naturalWidth, img.naturalHeight );
			var renderTargetParameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBufer: false };
			renderTarget = new THREE.WebGLRenderTarget( img.width, img.height, renderTargetParameters );
			this.composer_Normalview.reset(renderTarget);
		}

		else if (map === "pictures"){
			//NMO_FileDrop.height_canvas.width = img.width;
			//NMO_FileDrop.height_canvas.height = img.height;
			//NMO_FileDrop.height_canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0,0, NMO_FileDrop.height_canvas.width, NMO_FileDrop.height_canvas.height);
			//img.width = img.naturalWidth;
			//img.height = img.naturalHeight;

			this.picture_above_map.image		= img;
			this.picture_left_map.image			= NMO_FileDrop.picture_left;
			this.picture_right_map.image		= NMO_FileDrop.picture_right;
			this.picture_below_map.image		= NMO_FileDrop.picture_below;
			this.normalmap_from_pictures_uniforms["tAbove"].value = this.picture_above_map;
			this.normalmap_from_pictures_uniforms["tLeft"].value  = this.picture_left_map;
			this.normalmap_from_pictures_uniforms["tRight"].value = this.picture_right_map;
			this.normalmap_from_pictures_uniforms["tBelow"].value = this.picture_below_map;
			this.normalmap_from_pictures_uniforms["dimensions"].value = [img.naturalWidth, img.naturalHeight, 0];

			this.renderer_Normalview.setSize( img.naturalWidth, img.naturalHeight );
			this.composer_Normalview.setSize( img.naturalWidth, img.naturalHeight );
			var renderTargetParameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBufer: false };
			renderTarget = new THREE.WebGLRenderTarget( img.width, img.height, renderTargetParameters );
			this.composer_Normalview.reset(renderTarget);

			this.picture_above_map.needsUpdate = true;
			this.picture_left_map.needsUpdate = true;
			this.picture_right_map.needsUpdate = true;
			this.picture_below_map.needsUpdate = true;
		}
		else
			console.log("wrong parameter: " + map);

		//composer_Normalview.addPass( NormalRenderScene );
		//composer_Normalview.addPass( gaussian_shader_y );	
		//composer_Normalview.addPass( gaussian_shader_x );
		this.renderNormalView();
	};

	
	this.renderNormalToHeight = function(){
		//console.log("NormalToHeight: " + NMO_FileDrop.picture_above.width);
		//composer_Normalview = new THREE.EffectComposer( renderer_Normalview, renderTarget );
		if (this.normal_to_height_canvas == null){
			//console.log("Create canvas");
			this.normal_to_height_canvas = document.createElement("canvas");
		}
		var renderTargetParameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBufer: false };
		var renderTarget = new THREE.WebGLRenderTarget( NMO_FileDrop.picture_above.width, NMO_FileDrop.picture_above.height, renderTargetParameters );
		this.normal_to_height_canvas.width = NMO_FileDrop.picture_above.width;
		this.normal_to_height_canvas.height = NMO_FileDrop.picture_above.height;
		var renderer_normal_to_height = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: this.normal_to_height_canvas });
		renderer_normal_to_height.setClearColor( 0x000000, 0 ); // the default
		//camera_Normalview = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 10 );
		var camera_normal_to_height = new THREE.OrthographicCamera(  -1/2, 1/2, 1/2, -1/2, 0, 1);
		var scene_normal_to_height = new THREE.Scene();

		// Shader + uniforms
		var normal_to_height_shader = THREE.NormalToHeightShader;
		var normal_to_height_uniforms = THREE.UniformsUtils.clone( normal_to_height_shader.uniforms );
		var picture_above_map = new THREE.Texture( NMO_FileDrop.picture_above );
		var picture_left_map  = new THREE.Texture( NMO_FileDrop.picture_left );
		var picture_right_map = new THREE.Texture( NMO_FileDrop.picture_right );
		var picture_below_map = new THREE.Texture( NMO_FileDrop.picture_below );
		picture_above_map.needsUpdate = true;
		picture_left_map.needsUpdate = true;
		picture_right_map.needsUpdate = true;
		picture_below_map.needsUpdate = true;
		normal_to_height_uniforms["tAbove"].value = picture_above_map;
		normal_to_height_uniforms["tLeft"].value  = picture_left_map;
		normal_to_height_uniforms["tRight"].value = picture_right_map;
		normal_to_height_uniforms["tBelow"].value = picture_below_map;
		//console.log("Width: " + normal_map.width);
		
		var normal_to_height_parameters = { 
			fragmentShader: normal_to_height_shader.fragmentShader, 
			vertexShader: normal_to_height_shader.vertexShader, 
			uniforms: normal_to_height_uniforms
		};
		var normal_to_height_material = new THREE.ShaderMaterial( normal_to_height_parameters );
		//normal_to_height_material.wrapAround = true;
		normal_to_height_material.transparent = true;

		var render_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1, 1, 1, 1), normal_to_height_material );
		render_mesh.name = "mesh";
		scene_normal_to_height.add(render_mesh);
		
		renderer_normal_to_height.setSize( NMO_FileDrop.picture_above.width, NMO_FileDrop.picture_above.height );
		renderer_normal_to_height.render( scene_normal_to_height, camera_normal_to_height, renderTarget );
		renderer_normal_to_height.render( scene_normal_to_height, camera_normal_to_height );

	    var gl = renderer_normal_to_height.getContext();
	    //gl.scale(1, -1);
		var data = new Uint8Array(4 * this.normal_to_height_canvas.width * this.normal_to_height_canvas.height)
		var texture = new THREE.DataTexture(data, this.normal_to_height_canvas.width, this.normal_to_height_canvas.height, THREE.RGBAFormat);
		//texture.flipY = false;
		gl.readPixels( 0, 0, this.normal_to_height_canvas.width, this.normal_to_height_canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, texture.image.data );
		//texture.flipY = true;
		texture.needsUpdate = true;
		this.height_from_normal_img = texture.image;

		NMO_DisplacementMap.createDisplacementMap();
		NMO_SpecularMap.createSpecularTexture();
		NMO_AmbientOccMap.createAmbientOcclusionTexture();
	};

}