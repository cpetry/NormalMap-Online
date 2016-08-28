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


NMO_DisplacementMap = new function(){

	this.displacement_bias = 0;
	this.smoothing = 0;
	this.timer = 0;
	this.current_disp_scale = 0;
	this.contrast = -0.5;
	this.invert_displacement = false;
	this.displacement_canvas = document.createElement("canvas");

	this.renderer;
	this.uniforms;
	this.height_map_tex;
	this.gaussian_shader_y, this.gaussian_shader_x;

	this.createDisplacementMap = function(){
		this.createGPUbasedDisplacementTexture();
			
		var displace_map = Filters.filterImage(Filters.grayscale, document.getElementById("displace_img"));

		// GET BIAS FOR DISPLACMENT
		// calc average value at the border of height tex
		var top_left = 0;
		var top_right = (displace_map.width-1)*4;
		var bottom_left = ((displace_map.width-1) * (displace_map.height-1)*4) - (displace_map.width-1)*4;
		var bottom_right = (displace_map.width-1) * (displace_map.height-1) * 4;
		this.displacement_bias = (displace_map.data[top_left] + displace_map.data[top_right] + displace_map.data[bottom_left] + displace_map.data[bottom_right]) / 4.0 / 255.0;
				
		// write out texture
		/**/

		//console.log("Displacement: " + (Date.now() - start));
		start = Date.now();

		//NMO_Main.setTexturePreview(this.displacement_canvas, "displace_img", img_data.width, img_data.height);
		this.updateDisplacementBias();
		/*//console.log("w:" + img_data.width + ", h:" + img_data.height);
		if (NMO_RenderView.render_model.material.uniforms[ "enableDisplacement" ].value == true){
			NMO_RenderView.render_model.geometry.computeTangents();
		}*/
		//console.log("Updating displacement: " + (Date.now() - start));
		
		//NMO_RenderView.displacement_map.needsUpdate = true;
	};

	this.createCPUbasedDisplacementTexture = function(){

		var start = Date.now();

		var img_data;
		// if normal from picture is selected
		if(NMO_Main.normal_map_mode == "pictures")
			img_data = NMO_RenderNormalview.height_from_normal_img;
		// Normal from height is selected
		else
			img_data = Filters.filterImage(Filters.grayscale, NMO_FileDrop.height_image);


		//var img_data = Filters.filterImage(Filters.grayscale, normal_to_height_canvas);
		var displace_map = Filters.createImageData(img_data.width, img_data.height);
		
		// invert colors if needed
		var v = 0;
		for (var i=0; i<img_data.data.length; i += 4){
			v = (img_data.data[i] + img_data.data[i+1] + img_data.data[i+2]) * 0.333333;
			v = v < 1.0 || v > 255.0 ? 0 : v;
			if (this.invert_displacement)
				v = 255.0 - v;
			displace_map.data[i]   = v;
			displace_map.data[i+1] = v;
			displace_map.data[i+2] = v;
			//displace_map.data[i+3] = img_data.data[i+3];
			displace_map.data[i+3] = 255;
		}
		
		// add contrast value
		displace_map = this.contrastImage(displace_map, this.contrast * 255);

		if (this.smoothing > 0)
			NMO_Gaussian.gaussiansharpen(displace_map, img_data.width, img_data.height, Math.abs(this.smoothing));
		else if (this.smoothing < 0)
			NMO_Gaussian.gaussianblur(displace_map, img_data.width, img_data.height, Math.abs(this.smoothing));

		var ctx_displace = this.displacement_canvas.getContext("2d");
		this.displacement_canvas.width = img_data.width;
		this.displacement_canvas.height = img_data.height;
		ctx_displace.clearRect(0, 0, img_data.width, img_data.height);
		ctx_displace.putImageData(displace_map, 0, 0, 0, 0, img_data.width, img_data.height);
	}


	this.createGPUbasedDisplacementTexture = function(){
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

		this.uniforms["invert"].value = this.invert_displacement;
		this.uniforms["contrast"].value = this.contrast;
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

		NMO_Main.setTexturePreview(this.displacement_canvas, "displace_img", w, h);
		//console.log("Displacement: " + (Date.now() - start));
	}

	this.initDisplacementshader = function(){
		var start = Date.now();
		var heightmap;
		
		if(NMO_Main.normal_map_mode == "pictures")
			//heightmap = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.height_from_normal_img);
			heightmap = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.normal_to_height_canvas);
		else
			heightmap = Filters.filterImage(Filters.grayscale, NMO_FileDrop.height_image);
		

		var w = heightmap.width;
		var h = heightmap.height;
		
		this.displacement_canvas.width = w;
		this.displacement_canvas.height = h;
		this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: this.displacement_canvas });
		this.renderer.setSize( w, h );
		//renderer_aomap.setClearColor( 0x000000, 0 ); // the default
		//camera_Normalview = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 10 );
		var camera = new THREE.OrthographicCamera(  1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0, 1);
		var scene = new THREE.Scene();

		// Shader + uniforms
		var shader = NMO_DisplacementShader;
		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
		this.height_map_tex = new THREE.Texture( heightmap );
		this.height_map_tex.wrapS 		= this.height_map_tex.wrapT = THREE.ClampToEdgeWrapping; //RepeatWrapping, ClampToEdgeWrapping
		this.height_map_tex.minFilter 	= this.height_map_tex.magFilter = THREE.NearestFilter; //LinearFilter , NearestFilter
		this.height_map_tex.anisotropy  = 2;
		this.height_map_tex.needsUpdate = true;

		this.uniforms["invert"].value = this.invert_displacement;
		this.uniforms["contrast"].value = this.contrast;
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
		this.composer = new THREE.EffectComposer( this.renderer, renderTarget );
		//renderer_aomap.render( scene_aomap, camera_aomap, renderTarget );
		//renderer_aomap.render( scene_aomap, camera_aomap );
		//this.composer_aomap.setSize( w, h );

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
		
		//console.log("Displacement: " + (Date.now() - start));

		NMO_Main.setTexturePreview( this.displacement_canvas, "displace_img", w, h);	
		
	};
		
	this.invertDisplacement = function(){
		this.invert_displacement = !this.invert_displacement;
		
		if (NMO_Main.auto_update && Date.now() - this.timer > 50)
			this.createDisplacementMap();
	};
	
	this.setDisplacementSetting = function(element, v){	
		if (element == "blur_sharp")
			this.smoothing = v;
		
		else if (element == "strength")
			this.current_disp_scale = v;
		
		else if (element == "contrast")
			this.contrast = v;
			
		if(this.timer == 0)
			this.timer = Date.now();
			
		if (NMO_Main.auto_update && Date.now() - this.timer > 50){
			this.createDisplacementMap();
			this.timer = 0;
		}
	};

	this.setDisplaceStrength = function(v){
		if(this.timer == 0)
			this.timer = Date.now();
			
		if (NMO_Main.auto_update && Date.now() - this.timer > 50){
			this.setDisplacementScale(-v);
			
			this.timer = 0;
		}
	};

	this.setDisplacementContrast = function(){
		if(this.timer == 0)
			this.timer = Date.now();
			
		if (NMO_Main.auto_update && Date.now() - this.timer > 50){
			this.createDisplacementMap();
			this.timer = 0;
		}
	};

	this.setDisplacementScale = function(scale){
		this.current_disp_scale = -scale;
		this.updateDisplacementBias();
	};

	this.updateDisplacementBias = function(){
		NMO_RenderView.setDisplacementOptions(this.current_disp_scale, this.displacement_bias);
		//console.log("updateDisplacementBias()");
	};

	this.contrastImage = function(imageData, contrast) {

	    var data = imageData.data;
	    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

	    for(var i=0;i<data.length;i+=4)
	    {
			greyval = factor * (data[i] - 128) + 128;
	        data[i] = greyval;
	        data[i+1] = greyval;
	        data[i+2] = greyval;
	    }
	    return imageData;
	};
}