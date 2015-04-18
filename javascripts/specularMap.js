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

FallOffEnum = {
    NO : 0,
    LINEAR : 1,
    SQUARE : 2
}

var specular_mean = 255;
var specular_range = 255;
var specular_canvas = document.createElement("canvas");
var specular_falloff = FallOffEnum.LINEAR;

 var setSpecularSetting = function(element, v){
	if (element == "spec_mean")
		specular_mean = v * 255;
	
	else if (element == "spec_range")
		specular_range = v * 255;

	else if (element == "spec_falloff"){
		if (v == "linear")
			specular_falloff = FallOffEnum.LINEAR;
		else if (v == "square")
			specular_falloff = FallOffEnum.SQUARE;
		else if (v == "no")
			specular_falloff = FallOffEnum.NO;
	}
		
	if (auto_update && Date.now() - timer > 150){
		createSpecularTexture();
		timer = Date.now();
	}
}


function createSpecularTexture(){
	var st = new Date().getTime();
	
	var img_data = Filters.filterImage(Filters.grayscale, height_image);
	var specular_map = Filters.createImageData(img_data.width, img_data.height);

	

	// invert colors if needed
	var v = 0;
	for (var i=0; i<img_data.data.length; i += 4){
		v = (img_data.data[i] + img_data.data[i+1] + img_data.data[i+2]) * 0.333333; // average
		v = v < 1.0 || v > 255.0 ? 0 : v; // clamp

		var per_dist_to_mean = (specular_range - Math.abs(v - specular_mean)) / specular_range;

		if(specular_falloff == FallOffEnum.NO)
			v = per_dist_to_mean > 0 ? 1 : 0;
		else if(specular_falloff == FallOffEnum.LINEAR)
			v = per_dist_to_mean > 0 ? per_dist_to_mean : 0;
		else if(specular_falloff == FallOffEnum.SQUARE)
			v = per_dist_to_mean > 0 ? Math.sqrt(per_dist_to_mean,2) : 0;

		v = v*255;
		specular_map.data[i]   = v;
		specular_map.data[i+1] = v;
		specular_map.data[i+2] = v;
		//specular_map.data[i+3] = 255;
		specular_map.data[i+3] = img_data.data[i+3];
	}


	// write out texture
	var ctx_specular = specular_canvas.getContext("2d");
	specular_canvas.width = img_data.width;
	specular_canvas.height = img_data.height;
	ctx_specular.clearRect(0, 0, img_data.width, img_data.height);
	ctx_specular.putImageData(specular_map, 0, 0, 0, 0, img_data.width, img_data.height);
	
	setTexturePreview(specular_canvas, "specular_img", img_data.width, img_data.height);
	//console.log("Specular: " + (new Date().getTime() - st));
}