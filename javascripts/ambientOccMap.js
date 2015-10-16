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
	this.ao_smoothing = -10;
	this.ao_strength = 0.5;
	this.ao_range = 255;
	this.ao_mean = 255;
	this.ao_level = 7;
	this.invert_ao = false;
	this.timer = 0;

	this.createAmbientOcclusionTexture = function(){
		var start = Date.now();
		
		var grayscale;
		var height, width;
		// if normal from picture is selected
		if(NMO_Main.normal_map_mode == "pictures"){
			/*
			width = NMO_FileDrop.picture_above.width;
			height = NMO_FileDrop.picture_above.height;
			var picture_sum = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_above); // invert_source?!
			var add_left    = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_left);
			var add_right   = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_right);
			var add_below   = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_below);
			
			for (var i=0; i<picture_sum.data.length; i += 4){
				var v = picture_sum.data[i] + add_left.data[i] + add_right.data[i] + add_below.data[i];
				picture_sum.data[i] = picture_sum.data[i+1] = picture_sum.data[i+2] = v * 0.25;
			}
			grayscale = picture_sum;*/
			/*var image = new Image();
			image.src = NMO_RenderNormalview.normal_to_height_canvas.toDataURL("image/png");
			grayscale = Filters.filterImage(Filters.grayscale, image);*/
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
			var v = (grayscale.data[i] + grayscale.data[i+1] + grayscale.data[i+2]) * 0.333333; // average
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
		
		/*var sobelfiltered = Filters.sobelfilter(grayscale, this.ao_strength * 0.5, this.ao_level);
		
		var ao_map = Filters.createImageData(width, height);
		
		if (this.ao_smoothing > 0)
			NMO_Gaussian.gaussiansharpen(sobelfiltered, width, height, Math.abs(this.ao_smoothing));
		else if (this.ao_smoothing < 0)
			NMO_Gaussian.gaussianblur(sobelfiltered, width, height, Math.abs(this.ao_smoothing));
		
		var v = 0;
		for (var i=0; i<sobelfiltered.data.length && i<grayscale.data.length; i += 4){
			v = (sobelfiltered.data[i] + sobelfiltered.data[i+1]) * 0.5;
			v = v - grayscale.data[i] * this.ao_strength * 0.2;
			v = Math.max(0, Math.min(255, v));
			v = this.invert_ao ? 255-v : v;
			ao_map.data[i]   = v;
			ao_map.data[i+1] = v;
			ao_map.data[i+2] = v;
			//ao_map.data[i+3] = 255;
			ao_map.data[i+3] = grayscale.data[i+3];
		}*/
		
		
		
		// write out texture
		var ctx_ambient = this.ao_canvas.getContext("2d");
		this.ao_canvas.width = grayscale.width;
		this.ao_canvas.height = grayscale.height;
		ctx_ambient.clearRect(0, 0, grayscale.width, grayscale.height);
		ctx_ambient.putImageData(ao_map, 0, 0, 0, 0, grayscale.width, grayscale.height);
		
		console.log("Ambient Occ: " + (Date.now() - start));
		

		NMO_Main.setTexturePreview(this.ao_canvas, "ao_img", grayscale.width, grayscale.height);
		//console.log("AmbientOcc: " + (new Date().getTime() - st));
		//NMO_RenderView.ao_map.needsUpdate = true;
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
			this.ao_mean = v*255;

		else if (element == "range")
			this.ao_range = v*255;

		else if (element == "level")
			this.ao_level = v;
			
		if(this.timer == 0)
			this.timer = Date.now();
			
		if (NMO_Main.auto_update && Date.now() - this.timer > 50){
			this.createAmbientOcclusionTexture();
			this.timer = 0;
		}
	};
}