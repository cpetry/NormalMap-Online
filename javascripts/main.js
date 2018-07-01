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

//console.log("Warnings are disabled!");
//console.warn = function() {};

NMO_FileDrop.initHeightMap();
NMO_RenderView.initRenderer();

var NMO_Main = new function(){
	this.TextureEnum = {
	    NORMAL : 0,
	    DISPLACEMENT : 1,
	    AMBIENT : 2,
	    SPECULAR : 3
	}

	this.auto_update = true;
	this.current_texture = this.TextureEnum.NORMAL;
	this.normal_map_mode = "height";
	this.download_btn = document.getElementById('download');
	this.download_all_btn = document.getElementById('download_all');


	this.activate_height_tab = function(type){
		this.normal_map_mode = type;
		if (type == "height"){
			document.getElementById('tab_btn_heightmap').disabled = true;
			document.getElementById('tab_btn_pictures').disabled = false;
			$('#pictures_map').hide("slide", {direction: "right"}, 400, function() {
				NMO_RenderNormalview.reinitializeShader("height");
				NMO_RenderNormalview.renderNormalview_update("height");
				NMO_NormalMap.createNormalMap();
				NMO_Main.setTexturePreview(NMO_NormalMap.normal_canvas, "normal_img", NMO_NormalMap.normal_canvas.width, NMO_NormalMap.normal_canvas.height);
				NMO_DisplacementMap.createDisplacementMap();
				NMO_AmbientOccMap.createAmbientOcclusionTexture();
				NMO_SpecularMap.createSpecularTexture();
				$('#height_map').show("slide", {direction: "left"}, 400);
			});
		}
		else if (type == "pictures"){
			document.getElementById('tab_btn_pictures').disabled = true;
			document.getElementById('tab_btn_heightmap').disabled = false;
			$('#height_map').hide("slide", {direction: "left"}, 400, function() {
				NMO_RenderNormalview.reinitializeShader("pictures");
				NMO_RenderNormalview.renderNormalview_update("pictures");
				NMO_NormalMap.createNormalMap();
				NMO_Main.setTexturePreview(NMO_NormalMap.normal_canvas, "normal_img", NMO_NormalMap.normal_canvas.width, NMO_NormalMap.normal_canvas.height);
				NMO_RenderNormalview.renderNormalToHeight(); // when the last one was loaded
				NMO_DisplacementMap.createDisplacementMap();
				NMO_AmbientOccMap.createAmbientOcclusionTexture();
				NMO_SpecularMap.createSpecularTexture();
				$('#pictures_map').show("slide", {direction: "right"}, 400);
			});
		}
	}

	this.activate_texture = function(type){
		if (type == "normal"){
			document.getElementById('tab_btn_normal').disabled = true;
			document.getElementById('tab_btn_displace').disabled = false;
			document.getElementById('tab_btn_ao').disabled = false;
			document.getElementById('tab_btn_specular').disabled = false;
			//console.log("normal!");
			document.getElementById('normal_map').style.cssText = "";
			document.getElementById('normal_settings').style.cssText = "";
			
			document.getElementById('displacement_map').style.cssText = "display: none;";
			document.getElementById('displacement_settings').style.cssText = "display: none;";
			
			document.getElementById('ao_map').style.cssText = "display: none;";
			document.getElementById('ao_settings').style.cssText = "display: none;";

			document.getElementById('specular_map').style.cssText = "display: none;";
			document.getElementById('specular_settings').style.cssText = "display: none;";

			document.getElementById('file_name').placeholder = "NormalMap";
			this.current_texture = this.TextureEnum.NORMAL;
		}
		
		else if (type == "displace"){
			document.getElementById('tab_btn_normal').disabled = false;
			document.getElementById('tab_btn_displace').disabled = true;
			document.getElementById('tab_btn_ao').disabled = false;
			document.getElementById('tab_btn_specular').disabled = false;
			
			document.getElementById('normal_map').style.cssText = "display: none;";
			document.getElementById('normal_settings').style.cssText = "display: none;";
			
			document.getElementById('displacement_map').style.cssText = "";
			document.getElementById('displacement_settings').style.cssText = "";
			
			document.getElementById('ao_map').style.cssText = "display: none;";
			document.getElementById('ao_settings').style.cssText = "display: none;";

			document.getElementById('specular_map').style.cssText = "display: none;";
			document.getElementById('specular_settings').style.cssText = "display: none;";

			document.getElementById('file_name').placeholder = "DisplacementMap";
			this.current_texture = this.TextureEnum.DISPLACEMENT;
			//console.log("displace!");
		}
		else if (type == "ao"){
			document.getElementById('tab_btn_normal').disabled = false;
			document.getElementById('tab_btn_displace').disabled = false;
			document.getElementById('tab_btn_ao').disabled = true;
			document.getElementById('tab_btn_specular').disabled = false;
			
			document.getElementById('normal_map').style.cssText = "display: none;";
			document.getElementById('normal_settings').style.cssText = "display: none;";
			
			document.getElementById('displacement_map').style.cssText = "display: none;";
			document.getElementById('displacement_settings').style.cssText = "display: none;";
			
			document.getElementById('ao_map').style.cssText = "";
			document.getElementById('ao_settings').style.cssText = "";

			document.getElementById('specular_map').style.cssText = "display: none;";
			document.getElementById('specular_settings').style.cssText = "display: none;";

			document.getElementById('file_name').placeholder = "AmbientOcclusionMap";
			this.current_texture = this.TextureEnum.AMBIENT;
			//console.log("displace!");
		}
		else if (type == "specular"){
			document.getElementById('tab_btn_normal').disabled = false;
			document.getElementById('tab_btn_displace').disabled = false;
			document.getElementById('tab_btn_ao').disabled = false;
			document.getElementById('tab_btn_specular').disabled = true;
			
			document.getElementById('normal_map').style.cssText = "display: none;";
			document.getElementById('normal_settings').style.cssText = "display: none;";
			
			document.getElementById('displacement_map').style.cssText = "display: none;";
			document.getElementById('displacement_settings').style.cssText = "display: none;";

			document.getElementById('ao_map').style.cssText = "display: none;";
			document.getElementById('ao_settings').style.cssText = "display: none;";
			
			document.getElementById('specular_map').style.cssText = "";
			document.getElementById('specular_settings').style.cssText = "";

			document.getElementById('file_name').placeholder = "SpecularMap";
			this.current_texture = this.TextureEnum.SPECULAR;
			//console.log("displace!");
		}
	}


	this.setTexturePreview = function(canvas, img_id, width, height){
		var img = document.getElementById(img_id);

		//canvas.width = width;
		//canvas.height = height;

		//console.log(img_id + ": " + width);		

		img.getContext('2d').clearRect ( 0 , 0 , img.width, img.height );

			
		var ratio = width / height;
		var draw_width = ratio >= 1 ? NMO_FileDrop.container_height : (NMO_FileDrop.container_height * ratio );
		var draw_height = ratio >= 1 ? (NMO_FileDrop.container_height / ratio ) : NMO_FileDrop.container_height;
		
		var reduce_canvas = document.createElement('canvas');
		var helper_canvas = document.createElement('canvas');
		helper_canvas.width = width;
		helper_canvas.height = height;
		reduce_canvas.width = width;
		reduce_canvas.height = height;

		var current_width = width;
		var current_height = height;
		var reduce_context = reduce_canvas.getContext('2d');
		var helper_context = helper_canvas.getContext('2d');
		reduce_context.clearRect(0,0,reduce_context.width, reduce_context.height);
		reduce_context.drawImage(canvas, 0, 0, width, height);
		helper_context.clearRect(0,0,helper_canvas.width, helper_canvas.height);
		helper_context.drawImage(canvas, 0, 0, width, height);
		while(2*draw_width < current_width && 2*draw_height < current_height ){
			//console.log("redraw!");
			helper_context.clearRect(0, 0, helper_canvas.width, helper_canvas.height);
			helper_context.drawImage(reduce_canvas, 0, 0, reduce_canvas.width, reduce_canvas.height);
			reduce_context.clearRect(0, 0, reduce_canvas.width, reduce_canvas.height);
			reduce_context.drawImage(helper_canvas, 0, 0, reduce_canvas.width * 0.5, reduce_canvas.height * 0.5);
			current_width *= 0.5;
			current_height *= 0.5;
		}

		//console.log(draw_width + ", " + draw_height)
		img.height = draw_height;
		img.width = draw_width;
		img.getContext('2d').drawImage(reduce_canvas, 0, 0, current_width, current_height, 0,0, draw_width, draw_height);
		
		if (canvas == NMO_NormalMap.normal_canvas)
			NMO_RenderView.normal_map.needsUpdate = true;
		else if (canvas == NMO_DisplacementMap.displacement_canvas)
			NMO_RenderView.displacement_map.needsUpdate = true;
		else if (canvas == NMO_AmbientOccMap.ao_canvas)
			NMO_RenderView.ao_map.needsUpdate = true;
		else if (canvas == NMO_SpecularMap.specular_canvas)
			NMO_RenderView.specular_map.needsUpdate = true;
		
	}

	this.toggle_height_column = function(){

		if ($("#column_height").is(":visible") == true) {
			$("#column_btn_left_div").html("<<");
			$("#column_height").hide("slide", {direction: "right"}, 400);
				/*$(".column").each(function () {
	    		$(this).css("width", "438px");
				});
				$(".preview_img").each(function () {
		    		$(this).css("max-width", "400px");
		    		$(this).css("max-height", "400px");
				});
				$(".view").each(function () {
		    		$(this).css("max-width", "400px");
		    		$(this).css("max-height", "400px");
				});
				$(".helper").each(function () {
		    		$(this).css("max-width", "400px");
		    		$(this).css("max-height", "400px");
				});
				container_height = 400;
				updateCurrentTexture();
				renderer.setSize( 400, 400 );*/
		}
		else{
			$("#column_btn_left_div").html(">>");			
			$("#column_height").show("slide", {direction: "right"}, 400);
		}
	}

	this.toggle_preview_column = function(){

		if ($("#preview").is(":visible") == true) {
			$("#column_btn_right_div").html(">>");
			$("#preview").hide("slide", {direction: "left"}, 400);				
		}
		else{
			$("#column_btn_right_div").html("<<");
			$("#preview").show("slide", {direction: "left"}, 400);
		}
	}

	this.getImageType = function(){
		var select_file_type = document.getElementById('file_type');
		var file_type = select_file_type.options[select_file_type.selectedIndex].value;
		return file_type;
	};

	this.switchJPGQual = function(){
		if (this.getImageType() != 'jpg'){
			document.getElementById('file_jpg_qual').style.cssText = "display: none;";
			document.getElementById('total_transparency').style.cssText = "font-size:11px;";
		}
		else{
			document.getElementById('total_transparency').style.cssText = "display: none;";	
			document.getElementById('file_jpg_qual').style.cssText = "font-size:11px;";
		}
	};


	this.toggleAutoUpdate = function(){
		this.auto_update = !this.auto_update;
		
		if (this.auto_update)
			NMO_NormalMap.createNormalMap();
			NMO_DisplacementMap.createDisplacementMap();
			NMO_AmbientOccMap.createAmbientOcclusionTexture();
			NMO_SpecularMap.createSpecularTexture();
	};

	this.updateCurrentTexture = function(){
		if (this.current_texture == TextureEnum.NORMAL)
			NMO_NormalMap.createNormalMap();
		else if (this.current_texture == TextureEnum.DISPLACEMENT)
			NMO_DisplacementMap.createDisplacementMap();
		else if (this.current_texture == TextureEnum.AMBIENT)
			NMO_AmbientOccMap.createAmbientOcclusionTexture();
		else if (this.current_texture == TextureEnum.SPECULAR)
			NMO_SpecularMap.createSpecularTexture();
	};

	this.download_all_btn.addEventListener('click', function (e) {		
		NMO_Main.downloadImage("NormalMap");
		NMO_Main.downloadImage("DisplacementMap");
		NMO_Main.downloadImage("AmbientOcclusionMap");
		NMO_Main.downloadImage("SpecularMap");
	});
	
	this.download_btn.addEventListener('click', function (e) {		
		if (document.getElementById('normal_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("NormalMap");
		}
		else if (document.getElementById('displacement_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("DisplacementMap");
		}
		else if (document.getElementById('ao_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("AmbientOcclusionMap");
		}
		else if (document.getElementById('specular_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("SpecularMap");
		}		
	});
	
	
	this.downloadImage = function(type){
		console.log("Downloading image");
		var qual = 0.9;
		var file_name = "download";
		var canvas = document.createElement("canvas");
		
		var file_type = NMO_Main.getImageType();
		var image_type = "image/png";
		if (file_type == "jpg")
			image_type = "image/jpeg";

		if (type == "NormalMap"){
			canvas.width = NMO_NormalMap.normal_canvas.width;
			canvas.height = NMO_NormalMap.normal_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_NormalMap.normal_canvas,0,0);
			file_name="NormalMap";
		}
		else if (type == "DisplacementMap"){
			canvas.width = NMO_DisplacementMap.displacement_canvas.width;
			canvas.height = NMO_DisplacementMap.displacement_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_DisplacementMap.displacement_canvas,0,0);
			file_name="DisplacementMap";
		}
		else if (type == "AmbientOcclusionMap"){
			canvas.width = NMO_AmbientOccMap.ao_canvas.width;
			canvas.height = NMO_AmbientOccMap.ao_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_AmbientOccMap.ao_canvas,0,0);
			file_name="AmbientOcclusionMap";
		}
		else if (type == "SpecularMap"){
			canvas.width = NMO_SpecularMap.specular_canvas.width;
			canvas.height = NMO_SpecularMap.specular_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_SpecularMap.specular_canvas,0,0);
			file_name="SpecularMap";
		}
		
		if (document.getElementById('file_name').value != "")
			file_name = document.getElementById('file_name').value;
		
		
			
		var qual = $('#file_jpg_qual_nmb').val() / 100;
		if (file_type == "tiff"){
			CanvasToTIFF.toBlob(canvas, function(blob) {
   				saveAs(blob, file_name + ".tif");
		    });
		}
		else{
			canvas.toBlob(function(blob) {
	    		saveAs(blob, file_name + "." + file_type);
			}, image_type, qual);
		}
	}
}