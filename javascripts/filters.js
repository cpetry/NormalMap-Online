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
 
var Filters = new function()
{
	this.tmpCanvas = document.createElement('canvas');
	this.tmpCtx = this.tmpCanvas.getContext('2d');

	this.getPixels = function(img) {
		
		var c = this.getCanvas(img.width, img.height);
		var ctx = c.getContext('2d');
		ctx.drawImage(img, 0, 0,img.width, img.height);
		return ctx.getImageData(0, 0, c.width, c.height);
	};

	this.getCanvas = function(w,h) {
	  var c = document.createElement('canvas');
	  c.width = w;
	  c.height = h;
	  return c;
	};

	this.filterImage = function(filter, image, var_args) {
	  var args = [this.getPixels(image)];
	  for (var i=2; i<arguments.length; i++) {
		args.push(arguments[i]);
	  }
	  return filter.apply(null, args);
	};

	this.brightness = function(pixels, adjustment) {
	  var d = pixels.data;
	  for (var i=0; i<d.length; i+=4) {
		d[i] += adjustment;
		d[i+1] += adjustment;
		d[i+2] += adjustment;
	  }
	  return pixels;
	};

	
	this.createImageData = function(w,h) {
	  return this.tmpCtx.createImageData(w,h);
	};


	this.convoluteFloat32 = function(pixels, weights, opaque) {
	  var side = Math.round(Math.sqrt(weights.length));
	  var halfSide = Math.floor(side/2);

	  var src = pixels.data;
	  var sw = pixels.width;
	  var sh = pixels.height;

	  var w = sw;
	  var h = sh;
	  var output = {
		width: w, height: h, data: new Float32Array(w*h*4)
	  };
	  var dst = output.data;

	  var alphaFac = opaque ? 1 : 0;

	  var sy, sx, dstOff, r, g, b, a, scy, scx, srcOff, wt;
	  for (var y=0; y<h; y++) {
		for (var x=0; x<w; x++) {
		  sy = y;
		  sx = x;
		  dstOff = (y*w+x)*4;
		  r=0, g=0, b=0, a=0;
		  for (var cy=0; cy<side; cy++) {
			for (var cx=0; cx<side; cx++) {
			  scy = (sy + cy - halfSide);
			  scx = (sx + cx - halfSide);
			  if (scy > sh-1 || scy < 0 )
				scy = scy.mod(sh);
			  if (scx > sw-1 || scx < 0 )
				scx = scx.mod(sw);
			
			  srcOff = (scy*sw+scx)*4;
			  wt = weights[cy*side+cx];
			  r += src[srcOff] * wt;
			  g += src[srcOff+1] * wt;
			  b += src[srcOff+2] * wt;
			  a += src[srcOff+3] * wt;
			}
		  }
		  dst[dstOff] = r;
		  dst[dstOff+1] = g;
		  dst[dstOff+2] = b;
		  dst[dstOff+3] = a + alphaFac*(1.0-a);
		}
	  }
	  return output;
	};


	this.grayscale = function(pixels, invert) {
	  var d = pixels.data;
	  for (var i=0; i<d.length; i += 4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		// converting to Luminance Y (YCbCr)
		//var v = 0.299*r + 0.587*g + 0.114*b;
		v = invert ? (255.0 - v) : v;
		d[i] = d[i+1] = d[i+2] = v;
	  }
	  return pixels;
	};

	Number.prototype.mod = function(n) {
		return ((this % n) + n) % n;
	}

	this.newsobelfilter = function(pixels, strength, level, type){
		var src = pixels.data;

		var w = pixels.width;
		var h = pixels.height;
		var output = {
			width: w, height: h, data: new Float32Array(w*h*4)
		};
		
		var dst = output.data;
		    
		var max_size = w*h*4;
		
		var tl, l, bl, t, b, tr, r, br, dX,dY,dZ,l;
		// blue value of normal map
		strength = Math.max (strength, 0.0001);
		var dZ = 1.0 / strength * (1.0 + Math.pow(2.0, level)); // very costly operation!
		var dZ2 = dZ * dZ;
		
		var filter_type = 0;
		if (type == "sobel")
			filter_type = 0;
		else if (type == "scharr")
			filter_type = 1;

		var wm4 = w*4;
		//console.log(w + h);
		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var dstOff = (y*w+x)*4;

				// very costly operation!
				if (x == 0 || x == w-1 || y == 0 || y == h-1){
					/*tl = src[(dstOff - 4 - wm4).mod(max_size)];   // top left  
					l  = src[(dstOff - 4      ).mod(max_size)];   // left  
					bl = src[(dstOff - 4 + wm4).mod(max_size)];   // bottom left  
					t  = src[(dstOff - wm4    ).mod(max_size)];   // top  
					b  = src[(dstOff + wm4    ).mod(max_size)];   // bottom  
					tr = src[(dstOff + 4 - wm4).mod(max_size)];   // top right  
					r  = src[(dstOff + 4      ).mod(max_size)];   // right  
					br = src[(dstOff + 4 + wm4).mod(max_size)];   // bottom right  				
					console.log("before: tl: " + tl + ",l: " + l + ", bl: " + bl + ", t: " + t + ", b: " + b );*/
					tl = src[((x-1).mod(w) + ((y-1).mod(h)*w)) * 4];   // top left  
					l  = src[((x-1).mod(w) + ( y		  *w)) * 4];   // left  
					bl = src[((x-1).mod(w) + ((y+1).mod(h)*w)) * 4];   // bottom left  
					t  = src[(  x 		   + ((y-1).mod(h)*w)) * 4];   // top  
					b  = src[(  x 		   + ((y+1).mod(h)*w)) * 4];   // bottom  
					tr = src[((x+1).mod(w) + ((y-1).mod(h)*w)) * 4];   // top right  
					r  = src[((x+1).mod(w) + ( y		  *w)) * 4];   // right  
					br = src[((x+1).mod(w) + ((y+1).mod(h)*w)) * 4];   // bottom right 
					//console.log("after: tl: " + tl + ",l: " + l + ", bl: " + bl + ", t: " + t + ", b: " + b );
					
				}
				else{
					tl = src[(dstOff - 4 - wm4)];   // top left
					l  = src[(dstOff - 4      )];   // left
					bl = src[(dstOff - 4 + wm4)];   // bottom left
					t  = src[(dstOff - wm4    )];   // top
					b  = src[(dstOff + wm4    )];   // bottom
					tr = src[(dstOff + 4 - wm4)];   // top right
					r  = src[(dstOff + 4      )];   // right
					br = src[(dstOff + 4 + wm4)];   // bottom right
				}
				
				// sobel
				if (filter_type == 0){ // "sobel"
					dX = tl + l*2 + bl - tr - r*2 - br;//tl*1.0 + l*2.0 + bl*1.0 - tr*1.0 - r*2.0 - br*1.0;
					dY = tl + t*2 + tr - bl - b*2 - br;//tl*1.0 + t*2.0 + tr*1.0 - bl*1.0 - b*2.0 - br*1.0;
				}
				// scharr
				else if (filter_type == 1){  // "scharr"
					dX = tl*3.0 + l*10.0 + bl*3.0 - tr*3.0 - r*10.0 - br*3.0;
					dY = tl*3.0 + t*10.0 + tr*3.0 - bl*3.0 - b*10.0 - br*3.0;
				}

				l = Math.sqrt((dX * dX) + (dY * dY) + dZ2);
				
				dst[dstOff] = (dX/l * 0.5 + 0.5) * 255.0; 	// red
				dst[dstOff+1] = (dY/l * 0.5 + 0.5) * 255.0; 	// green
				dst[dstOff+2] = dZ/l * 255.0; 				// blue
				dst[dstOff+3] = src[dstOff+3];
			}
		}
		
		return output;
	}


	this.sobelfilter = function(pixels, strength, level){
		var src = pixels.data;

		var w = pixels.width;
		var h = pixels.height;
		var output = {
			width: w, height: h, data: new Float32Array(w*h*4)
		};
		
		var dst = output.data;
		    
		var max_size = w*h*4;
		
		var tl, l, bl, t, b, tr, r, br, dX,dY,dZ,l;
		// blue value of normal map
		var dZ = 1.0 / strength * (1.0 + Math.pow(2.0, level)); // very costly operation!
		var dZ2 = dZ * dZ;
		
		var wm4 = w*4;
		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var dstOff = (y*w+x)*4;

				// very costly operation!
				if (x == 0 || x == w-1 || y == 0 || y == h-1){
					
					tl = src[(dstOff - 4 - wm4).mod(max_size)];   // top left  
					l  = src[(dstOff - 4      ).mod(max_size)];   // left  
					bl = src[(dstOff - 4 + wm4).mod(max_size)];   // bottom left  
					t  = src[(dstOff - wm4    ).mod(max_size)];   // top  
					b  = src[(dstOff + wm4    ).mod(max_size)];   // bottom  
					tr = src[(dstOff + 4 - wm4).mod(max_size)];   // top right  
					r  = src[(dstOff + 4      ).mod(max_size)];   // right  
					br = src[(dstOff + 4 + wm4).mod(max_size)];   // bottom right  
				}
				else{
					tl = src[(dstOff - 4 - wm4)];   // top left
					l  = src[(dstOff - 4      )];   // left
					bl = src[(dstOff - 4 + wm4)];   // bottom left
					t  = src[(dstOff - wm4    )];   // top
					b  = src[(dstOff + wm4    )];   // bottom
					tr = src[(dstOff + 4 - wm4)];   // top right
					r  = src[(dstOff + 4      )];   // right
					br = src[(dstOff + 4 + wm4)];   // bottom right
				}
				
				// scharr
				dX = tl*3.0 + l*10.0 + bl*3.0 - tr*3.0 - r*10.0 - br*3.0;
				dY = tl*3.0 + t*10.0 + tr*3.0 - bl*3.0 - b*10.0 - br*3.0;
				dX = Math.abs(dX);
				dY = Math.abs(dY);
				l = Math.sqrt((dX * dX) + (dY * dY) + (dZ * dZ));
				//v = (dX + dY) / l;
				var div = l * 0.5;
				var v = ((dX/div) + (dY/div)) / 2.0;
				//v += 0.5;
				//var v = Math.abs(dX / 255) + Math.abs(dY / 255) ;
				dst[dstOff] = (1-v) * 255.0; 	// red
				dst[dstOff+1] = (1-v) * 255.0; 	// green
				dst[dstOff+2] = (1-v) * 255.0; 	// blue
				dst[dstOff+3] = 1.0;
			}
		}
		
		return output;
	};

}