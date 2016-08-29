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

NMO_AmbientOccMap = new function(){

	this.ao_canvas = document.createElement("canvas");
	this.ao_smoothing = 0;
	this.ao_strength = 0.5;
	this.ao_mean = 1;
	this.ao_range = 1;
	this.ao_level = 1;
	this.invert_ao = false;
	this.timer = 0;

	this.renderer;
	this.uniforms;
	this.height_map_tex;
	this.gaussian_shader_y, this.gaussian_shader_x;

	this.createAmbientOcclusionTexture = function(){
		this.createGPUbasedAOTexture();
		return;
		/*var start = Date.now();
		
		var grayscale;
		var height, width;
		// if normal from picture is selected
		if(NMO_Main.normal_map_mode == "pictures"){
			grayscale = NMO_RenderNormalview.height_from_normal_img;
			width = grayscale.width;
			height = grayscale.height;
		}
		// Normal from height is selected
		else{
			grayscale = Filters.filterImage(Filters.grayscale, NMO_FileDrop.height_image);
			width = NMO_FileDrop.height_image.width;
			height = NMO_FileDrop.height_image.height;
		}
		

		var ao_map = Filters.createImageData(width, height);

		for (var i=0; i<grayscale.data.length; i += 4){
			var v = grayscale.data[i];
			v = v < 1.0 || v > 255.0 ? 0 : v; // clamp

			var per_dist_to_mean = (this.ao_range - Math.abs(v - this.ao_mean)) / this.ao_range;
			v = per_dist_to_mean > 0 ? Math.sqrt(per_dist_to_mean,2) : 0;

			v = v * (1-this.ao_strength);
			v = (!this.invert_ao) ? (1 - v) : v;
			ao_map.data[i]   = ao_map.data[i+1] = ao_map.data[i+2] = v*255;

			//specular_map.data[i+3] = 255;
			ao_map.data[i+3] = grayscale.data[i+3];
		}
		
		
		if (this.ao_smoothing > 0)
			NMO_Gaussian.gaussiansharpen(ao_map, width, height, Math.abs(this.ao_smoothing));
		else if (this.ao_smoothing < 0)
			NMO_Gaussian.gaussianblur(ao_map, width, height, Math.abs(this.ao_smoothing));
				
		
		
		// write out texture
		var ctx_ambient = this.ao_canvas.getContext("2d");
		this.ao_canvas.width = grayscale.width;
		this.ao_canvas.height = grayscale.height;
		ctx_ambient.clearRect(0, 0, grayscale.width, grayscale.height);
		ctx_ambient.putImageData(ao_map, 0, 0, 0, 0, grayscale.width, grayscale.height);
		
		console.log("Ambient Occ: " + (Date.now() - start));
		

		NMO_Main.setTexturePreview(this.ao_canvas, "ao_img", grayscale.width, grayscale.height);
		//console.log("AmbientOcc: " + (new Date().getTime() - st));
		//NMO_RenderView.ao_map.needsUpdate = true;*/
	};

	this.createGPUbasedAOTexture = function(){
		var start = Date.now();
		var w, h;
		if(NMO_Main.normal_map_mode == "pictures"){
			//heightmap = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.height_from_normal_img);
			this.height_map_tex.image = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.normal_to_height_canvas);
			w = NMO_RenderNormalview.normal_to_height_canvas.width;
			h = NMO_RenderNormalview.normal_to_height_canvas.height;
		}
		else{
			this.height_map_tex.image = Filters.filterImage(Filters.grayscale, NMO_FileDrop.height_image);
			w = NMO_FileDrop.height_image.width;
			h = NMO_FileDrop.height_image.height;
			//console.log ("w: " + w + ", h: " + h);
		}
		this.height_map_tex.needsUpdate = true;

		this.uniforms["invert"].value = this.invert_ao;
		this.uniforms["range"].value = this.ao_range;
		this.uniforms["strength"].value = this.ao_strength;
		this.uniforms["mean"].value = this.ao_mean;
		this.uniforms["level"].value = this.ao_level;
		this.uniforms["tHeight"].value = this.height_map_tex;

		this.gaussian_shader_y.uniforms[ "v" ].value = this.ao_smoothing / w / 5;
		this.gaussian_shader_x.uniforms[ "h" ].value = this.ao_smoothing / h / 5;

		if(NMO_Main.normal_map_mode == "pictures")
			this.uniforms["flipY"].value = 1;
		else
			this.uniforms["flipY"].value = 0;


		this.renderer.setSize( w, h );
		this.composer.setSize( w, h );
		var renderTargetParameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBufer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( w, h, renderTargetParameters );
		this.composer.reset(this.renderTarget);
		this.composer.render( 1 / 60 );

		NMO_Main.setTexturePreview(this.ao_canvas, "ao_img", w, h);
		//console.log("Ambient Occ: " + (Date.now() - start));
	}


	this.initAOshader = function(){
		var start = Date.now();
		var heightmap;
		
		if(NMO_Main.normal_map_mode == "pictures")
			//heightmap = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.height_from_normal_img);
			heightmap = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.normal_to_height_canvas);
		else
			heightmap = Filters.filterImage(Filters.grayscale, NMO_FileDrop.height_image);
		

		var w = heightmap.width;
		var h = heightmap.height;
		
		this.ao_canvas.width = w;
		this.ao_canvas.height = h;
		this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: this.ao_canvas });
		this.renderer.setSize( w, h );
		//renderer_aomap.setClearColor( 0x000000, 0 ); // the default
		//camera_Normalview = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 10 );
		var camera = new THREE.OrthographicCamera(  1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0, 1);
		var scene = new THREE.Scene();

		// Shader + uniforms
		var shader = NMO_AmbientOcclusionShader;
		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
		this.height_map_tex = new THREE.Texture( heightmap );
		this.height_map_tex.wrapS 		= this.height_map_tex.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.height_map_tex.minFilter 	= this.height_map_tex.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.height_map_tex.anisotropy  = 2;
		this.height_map_tex.needsUpdate = true;

		this.uniforms["invert"].value = this.invert_ao;
		this.uniforms["range"].value = this.ao_range;
		this.uniforms["strength"].value = this.ao_strength;
		this.uniforms["mean"].value = this.ao_mean;
		this.uniforms["level"].value = this.ao_level;
		this.uniforms["tHeight"].value = this.height_map_tex;
		if(NMO_Main.normal_map_mode == "pictures")
			this.uniforms["flipY"].value = 1;
		else
			this.uniforms["flipY"].value = 0;
		
		var parameters = { 
			fragmentShader: shader.fragmentShader, 
			vertexShader: shader.vertexShader, 
			uniforms: this.uniforms
		};

		var material = new THREE.ShaderMaterial( parameters );
		//material.wrapAround = true;
		material.transparent = true;

		var render_mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1, 1, 1, 1), material );
		render_mesh.name = "mesh";		
		scene.add(render_mesh);
		
		
		var renderTargetParameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBufer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( w, h, renderTargetParameters );
		this.composer = new THREE.EffectComposer( this.renderer, this.renderTarget );
		//renderer_aomap.render( scene_aomap, camera_aomap, renderTarget );
		//renderer_aomap.render( scene_aomap, camera_aomap );
		//this.composer_aomap.setSize( w, h );

		this.gaussian_shader_y = new THREE.ShaderPass( THREE.VerticalBlurShader );
		this.gaussian_shader_x = new THREE.ShaderPass( THREE.HorizontalBlurShader );		 
		this.gaussian_shader_y.uniforms[ "v" ].value = this.ao_smoothing / w / 5;
		this.gaussian_shader_x.uniforms[ "h" ].value = this.ao_smoothing / h / 5;
		this.gaussian_shader_x.renderToScreen = true;

		var renderPass = new THREE.RenderPass( scene, camera );
		this.composer.addPass( renderPass );
		this.composer.addPass( this.gaussian_shader_y );	
		this.composer.addPass( this.gaussian_shader_x );
		this.composer.render( 1/60 );		
		
		NMO_Main.setTexturePreview( this.ao_canvas, "ao_img", w, h);

		//console.log("Ambient Occ: " + (Date.now() - start));
		
	};

		
	this.invertAO = function(){
		this.invert_ao = !this.invert_ao;
		
		if (NMO_Main.auto_update && Date.now() - this.timer > 50)
			this.createAmbientOcclusionTexture();
	};


	this.setAOSetting = function(element, v){	
		if (element == "blur_sharp")
			this.ao_smoothing = v;
		
		else if (element == "strength")
			this.ao_strength = v;
		
		else if (element == "mean")
			this.ao_mean  = v;

		else if (element == "range")
			this.ao_range = v;

		else if (element == "level")
			this.ao_level = v;
			
		if(this.timer == 0)
			this.timer = Date.now();
			
		//if (NMO_Main.auto_update && Date.now() - this.timer > 50){
			this.createAmbientOcclusionTexture();
		//	this.timer = 0;
		//}
	};
}