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

var NMO_NormalMap = new function(){

	this.invert_red = false;
	this.invert_green = false;
	this.invert_source = false;
	this.height_offset = true;
	this.smoothing = 0;
	this.strength = 2.5;
	this.level = 7;
	this.normal_type = "sobel";
	this.normal_canvas = document.createElement("canvas");

	this.getNextPowerOf2 = function(nmb){
		i = 2;
		while(i < Math.pow(2,14)){
			i *= 2;
			if(i >= nmb)
				return i;
		}
	};

	this.createNormalMap = function(){
		NMO_RenderNormalview.renderNormalView();
		NMO_Main.setTexturePreview(this.normal_canvas, "normal_img", this.normal_canvas.width, this.normal_canvas.height);
	};


	this.invertRed = function(){
		this.invert_red = !this.invert_red;
		if (this.invert_red){
			NMO_RenderNormalview.normalmap_uniforms["invertR"].value = -1;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["invertR"].value = -1;
		}
		else{
			NMO_RenderNormalview.normalmap_uniforms["invertR"].value = 1;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["invertR"].value = 1;
		}
		
		NMO_NormalMap.createNormalMap();
	};

	this.invertGreen = function(){
		this.invert_green = !this.invert_green;
		if (this.invert_green){
			NMO_RenderNormalview.normalmap_uniforms["invertG"].value = -1;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["invertG"].value = -1;
		}
		else{
			NMO_RenderNormalview.normalmap_uniforms["invertG"].value = 1;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["invertG"].value = 1;
		}
		
		NMO_NormalMap.createNormalMap();
	};

	this.invertSource = function(){
		this.invert_source = !this.invert_source;
		if (!this.invert_source){
			NMO_RenderNormalview.normalmap_uniforms["invertH"].value = 1;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["invertH"].value = 1;
		}
		else{
			NMO_RenderNormalview.normalmap_uniforms["invertH"].value = -1;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["invertH"].value = -1;
		}

		NMO_NormalMap.createNormalMap();
	};

	this.heightOffset = function(){
		this.height_offset = !this.height_offset;
		if (this.height_offset){
			NMO_RenderNormalview.normalmap_uniforms["heightOffset"].value = 0;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["heightOffset"].value = 0;
		}
		else{
			NMO_RenderNormalview.normalmap_uniforms["heightOffset"].value = 1;
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["heightOffset"].value = 1;
		}
		
		NMO_NormalMap.createNormalMap();
	};

	this.setNormalSetting = function(element, v, initial){
		if (element == "blur_sharp"){
			smoothing = v;
			NMO_RenderNormalview.gaussian_shader_y.uniforms["v"].value = v / NMO_FileDrop.height_image.naturalWidth / 5;
			NMO_RenderNormalview.gaussian_shader_x.uniforms["h"].value = v / NMO_FileDrop.height_image.naturalHeight / 5;
			//NMO_RenderNormalview.gaussian_shader.uniforms["sigma"].value = v / NMO_FileDrop.height_image.naturalHeight / 5;
		}
		
		else if (element == "strength"){
			strength = v;
			NMO_RenderNormalview.normalmap_uniforms["dz"].value = 1.0 / v * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["dz"].value = 1.0 / v * (1.0 + Math.pow(2.0, document.getElementById('level_nmb').value));
		}
		
		else if (element == "level"){
			level = v;
			NMO_RenderNormalview.normalmap_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, v));
			NMO_RenderNormalview.normalmap_from_pictures_uniforms["dz"].value = 1.0 / document.getElementById('strength_nmb').value * (1.0 + Math.pow(2.0, v));
		}

		else if (element == "type"){
			normal_type = v;
			if (v == "sobel")
				NMO_RenderNormalview.normalmap_uniforms["type"].value = 0;
			else
				NMO_RenderNormalview.normalmap_uniforms["type"].value = 1;
		}

		if (typeof initial === 'undefined')
			NMO_NormalMap.createNormalMap();
	};
}