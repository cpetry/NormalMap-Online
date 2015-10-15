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

	this.timer = 0;
	this.specular_mean = 255;
	this.specular_range = 255;
	this.specular_strength = 1;
	this.specular_canvas = document.createElement("canvas");
	this.specular_falloff = this.FallOffEnum.LINEAR;

	this.setSpecularSetting = function(element, v){
		if (element == "spec_strength")
			this.specular_strength = v;

		if (element == "spec_mean")
			this.specular_mean = v * 255;
		
		else if (element == "spec_range")
			this.specular_range = v * 255;

		else if (element == "spec_falloff"){
			if (v == "linear")
				this.specular_falloff = this.FallOffEnum.LINEAR;
			else if (v == "square")
				this.specular_falloff = this.FallOffEnum.SQUARE;
			else if (v == "no")
				this.specular_falloff = this.FallOffEnum.NO;
		}
			
		if (NMO_Main.auto_update && Date.now() - this.timer > 150){
			this.createSpecularTexture();
			this.timer = Date.now();
		}
	};


	this.createSpecularTexture = function(){

		var img_data;
		// if normal from picture is selected
		if(NMO_Main.normal_map_mode == "pictures"){
			var picture_sum = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_above);
			var add_left    = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_left);
			var add_right   = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_right);
			var add_below   = Filters.filterImage(Filters.grayscale, NMO_FileDrop.picture_below);
			
			for (var i=0; i<picture_sum.data.length; i += 4){
				var v = picture_sum.data[i] + add_left.data[i] + add_right.data[i] + add_below.data[i];
				picture_sum.data[i] = picture_sum.data[i+1] = picture_sum.data[i+2] = v * 0.25;
			}
			img_data = picture_sum;
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
	};
}