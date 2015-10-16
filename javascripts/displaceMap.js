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
	this.blur_sharp = 0;
	this.timer = 0;
	this.current_disp_scale = 0;
	this.contrast = -0.5;
	this.invert_displacement = false;
	this.displacement_canvas = document.createElement("canvas");

	this.createDisplacementMap = function(){
		var start = Date.now();
		//var st = new Date().getTime();

		var img_data;
		// if normal from picture is selected
		if(NMO_Main.normal_map_mode == "pictures"){
			/*var picture_sum = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_above);
			var add_left    = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_left);
			var add_right   = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_right);
			var add_below   = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_below);
			
			for (var i=0; i<picture_sum.data.length; i += 4){
				var v = picture_sum.data[i] + add_left.data[i] + add_right.data[i] + add_below.data[i];
				picture_sum.data[i] = picture_sum.data[i+1] = picture_sum.data[i+2] = v * 0.25;
			}
			img_data = picture_sum;*/

			/*var image = new Image();
			image.src = NMO_RenderNormalview.normal_to_height_canvas.toDataURL("image/png");
			//image.
			img_data = Filters.filterImage(Filters.grayscale, image);*/
			/*var width = NMO_RenderNormalview.normal_to_height_canvas.width;
			var height = NMO_RenderNormalview.normal_to_height_canvas.height;
			img_data = NMO_RenderNormalview.normal_to_height_canvas.getContext("2d").getImageData(0,0, width, height);*/
			//img_data = Filters.filterImage(Filters.grayscale, NMO_RenderNormalview.height_from_normal_img);
			img_data = NMO_RenderNormalview.height_from_normal_img;
			//img_data = NMO_RenderNormalview.height_from_normal_img_data;
		}
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

		if (this.blur_sharp > 0)
			NMO_Gaussian.gaussiansharpen(displace_map, img_data.width, img_data.height, Math.abs(this.blur_sharp));
		else if (this.blur_sharp < 0)
			NMO_Gaussian.gaussianblur(displace_map, img_data.width, img_data.height, Math.abs(this.blur_sharp));		
		
		// GET BIAS FOR DISPLACMENT
		// calc average value at the border of height tex
		var top_left = 0;
		var top_right = (displace_map.width-1)*4;
		var bottom_left = ((displace_map.width-1) * (displace_map.height-1)*4) - (displace_map.width-1)*4;
		var bottom_right = (displace_map.width-1) * (displace_map.height-1) * 4;
		this.displacement_bias = (displace_map.data[top_left] + displace_map.data[top_right] + displace_map.data[bottom_left] + displace_map.data[bottom_right]) / 4.0 / 255.0;
		
		
		
		// write out texture
		var ctx_displace = this.displacement_canvas.getContext("2d");
		this.displacement_canvas.width = img_data.width;
		this.displacement_canvas.height = img_data.height;
		ctx_displace.clearRect(0, 0, img_data.width, img_data.height);
		ctx_displace.putImageData(displace_map, 0, 0, 0, 0, img_data.width, img_data.height);

		console.log("Displacement: " + (Date.now() - start));
		start = Date.now();

		NMO_Main.setTexturePreview(this.displacement_canvas, "displace_img", img_data.width, img_data.height);
		this.updateDisplacementBias();
		//console.log("w:" + img_data.width + ", h:" + img_data.height);
		if (NMO_RenderView.render_model.material.uniforms[ "enableDisplacement" ].value == true){
			NMO_RenderView.render_model.geometry.computeTangents();
		}
		console.log("Updating displacement: " + (Date.now() - start));
		
		//NMO_RenderView.displacement_map.needsUpdate = true;
	};


		
	this.invertDisplacement = function(){
		this.invert_displacement = !this.invert_displacement;
		
		if (NMO_Main.auto_update && Date.now() - this.timer > 50)
			this.createDisplacementMap();
	};
	
	this.setDisplacementSetting = function(element, v){	
		if (element == "blur_sharp")
			this.blur_sharp = v;
		
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
		NMO_RenderView.render_model.material.uniforms[ "uDisplacementScale" ].value = this.current_disp_scale * 5;
		NMO_RenderView.render_model.material.uniforms[ "uDisplacementBias" ].value = this.current_disp_scale * 5 * - this.displacement_bias;
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