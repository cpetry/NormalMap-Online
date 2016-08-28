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

NMO_SpecularMap = new function(){

	this.FallOffEnum = {
	    NO : 0,
	    LINEAR : 1,
	    SQUARE : 2
	}

	//this.timer = 0;
	this.specular_mean = 0.8;
	this.specular_range = 1;
	this.specular_strength = 1;
	this.specular_invert = 0;
	this.specular_canvas = document.createElement("canvas");
	this.specular_falloff = this.FallOffEnum.SQUARE;
	this.smoothing = 0;

	this.renderer;
	this.uniforms;
	this.height_map_tex;
	this.gaussian_shader_y, this.gaussian_shader_x;

	this.setSpecularSetting = function(element, v){
		if (element == "spec_strength")
			this.specular_strength = v;

		if (element == "spec_mean")
			this.specular_mean = v;
		
		else if (element == "spec_range")
			this.specular_range = v;

		else if (element == "spec_falloff"){
			if (v == "linear")
				this.specular_falloff = this.FallOffEnum.LINEAR;
			else if (v == "square")
				this.specular_falloff = this.FallOffEnum.SQUARE;
			else if (v == "no")
				this.specular_falloff = this.FallOffEnum.NO;
		}
			
		//if (NMO_Main.auto_update && Date.now() - this.timer > 150){
			this.createSpecularTexture();
		//	this.timer = Date.now();
		//}
	};


	this.createSpecularTexture = function(){
		this.createGPUbasedSpecularTexture();		
	};

	this.createCPUbasedSpecularTexture = function(){
		var img_data;
		// if normal from picture is selected
		if(NMO_Main.normal_map_mode == "pictures"){

			img_data = NMO_RenderNormalview.height_from_normal_img;
		}
		// Normal from height is selected
		else
			img_data = Filters.filterImage(Filters.grayscale, NMO_FileDrop.height_image);

		var specular_map = Filters.createImageData(img_data.width, img_data.height);

		

		// invert colors if needed
		var v = 0;
		for (var i=0; i<img_data.data.length; i += 4){
			v = (img_data.data[i] + img_data.data[i+1] + img_data.data[i+2]) * 0.333333; // average
			v = v < 1.0 || v > 255.0 ? 0 : v; // clamp

			var per_dist_to_mean = (this.specular_range - Math.abs(v - this.specular_mean)) / this.specular_range;

			if(this.specular_falloff == this.FallOffEnum.NO)
				v = per_dist_to_mean > 0 ? 1 : 0;
			else if(this.specular_falloff == this.FallOffEnum.LINEAR)
				v = per_dist_to_mean > 0 ? per_dist_to_mean : 0;
			else if(this.specular_falloff == this.FallOffEnum.SQUARE)
				v = per_dist_to_mean > 0 ? Math.sqrt(per_dist_to_mean,2) : 0;

			v = v*255 * this.specular_strength;
			specular_map.data[i]   = v;
			specular_map.data[i+1] = v;
			specular_map.data[i+2] = v;
			//specular_map.data[i+3] = 255;
			specular_map.data[i+3] = img_data.data[i+3];
		}


		// write out texture
		var ctx_specular = this.specular_canvas.getContext("2d");
		this.specular_canvas.width = img_data.width;
		this.specular_canvas.height = img_data.height;
		ctx_specular.clearRect(0, 0, img_data.width, img_data.height);
		ctx_specular.putImageData(specular_map, 0, 0, 0, 0, img_data.width, img_data.height);
		
		NMO_Main.setTexturePreview(this.specular_canvas, "specular_img", img_data.width, img_data.height);
		//console.log("Specular: " + (new Date().getTime() - st));
		//NMO_RenderView.specular_map.needsUpdate = true;
	}

	this.createGPUbasedSpecularTexture = function(){

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

		this.uniforms["invert"].value = this.specular_invert;
		this.uniforms["range"].value = this.specular_range;
		this.uniforms["strength"].value = this.specular_strength;
		this.uniforms["mean"].value = this.specular_mean;
		this.uniforms["falloff"].value = this.specular_falloff;
		this.uniforms["tHeight"].value = this.height_map_tex;

		this.gaussian_shader_y.uniforms[ "v" ].value = this.smoothing / w / 5;
		this.gaussian_shader_x.uniforms[ "h" ].value = this.smoothing / h / 5;

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

		NMO_Main.setTexturePreview(this.specular_canvas, "specular_img", w, h);
		//console.log("Ambient Occ: " + (Date.now() - start));
	}


	this.initSpecularshader = function(){
		var start = Date.now();
		var heightmap;
		
		if(NMO_Main.normal_map_mode == "pictures")
			//heightmap = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.height_from_normal_img);
			heightmap = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.normal_to_height_canvas);
		else
			heightmap = Filters.filterImage(Filters.grayscale, NMO_FileDrop.height_image);
		

		var w = heightmap.width;
		var h = heightmap.height;
		
		this.specular_canvas.width = w;
		this.specular_canvas.height = h;
		this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: this.specular_canvas });
		this.renderer.setSize( w, h );
		//renderer_aomap.setClearColor( 0x000000, 0 ); // the default
		//camera_Normalview = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 10 );
		var camera = new THREE.OrthographicCamera(  1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0, 1);
		var scene = new THREE.Scene();

		// Shader + uniforms
		var shader = NMO_SpecularShader;
		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
		this.height_map_tex = new THREE.Texture( heightmap );
		this.height_map_tex.wrapS 		= this.height_map_tex.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.height_map_tex.minFilter 	= this.height_map_tex.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.height_map_tex.anisotropy  = 2;
		this.height_map_tex.needsUpdate = true;

		this.uniforms["invert"].value = this.specular_invert;
		this.uniforms["range"].value = this.specular_range;
		this.uniforms["strength"].value = this.specular_strength;
		this.uniforms["mean"].value = this.specular_mean;
		this.uniforms["falloff"].value = this.specular_falloff;
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
		//this.renderer.render( scene, camera, this.renderTarget );
		//this.renderer.render( scene, camera );
		this.composer.setSize( w, h );

		this.gaussian_shader_y = new THREE.ShaderPass( THREE.VerticalBlurShader );
		this.gaussian_shader_x = new THREE.ShaderPass( THREE.HorizontalBlurShader );		 
		this.gaussian_shader_y.uniforms[ "v" ].value = this.smoothing / w / 5;
		this.gaussian_shader_x.uniforms[ "h" ].value = this.smoothing / h / 5;
		this.gaussian_shader_x.renderToScreen = true;

		var renderPass = new THREE.RenderPass( scene, camera );
		this.composer.addPass( renderPass );
		this.composer.addPass( this.gaussian_shader_y );	
		this.composer.addPass( this.gaussian_shader_x );
		this.composer.render( 1/60 );
		
		NMO_Main.setTexturePreview(this.specular_canvas, "specular_img", w, h);

		//console.log("Specular: " + (Date.now() - start));
		
	};
}