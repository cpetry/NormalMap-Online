//Shape From Shading Using Linear Approximation
//Ping-Sing Tsai and Mubarak Shah
//Department of Computer Science
//University of Central Florida
//Orlando, FL 32816

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function SFSTsaiShah(d){
  // algorithm
  var i,j,I,iter;  
  var Ps,Qs,p,q,pq,PQs,fZ,dfZ,Eij,Wn=0.0001*0.0001,Y,K;
  var Zn = createArray(width, height);
  var Zn1 = createArray(width, height);
  var Si1 = createArray(width, height);
  var Si = createArray(width, height);

  for(i=0;i<height;i++)  
      for(j=0;j<width;j++){  
        Zn1[i][j] = 0.0;  
        Si1[i][j] = 0.01; 
      }
 
  iter = 400; // number of iteration
  Ps = 40; // lightsource direction 
  Qs = 20;  // lightsource direction
  min_v = 100;
  max_v = -1;
  for(var I=1;I<=iter;I++){ 
    pos=0;
      for(var i=0;i<height;i++)  
        for(var j=0;j<width;j++){     // calculate -f(Zij) & df(Zij) 
          if(j-1 < 0 || i-1 < 0) // take care boundary 
              p = q = 0.0;  
          else {  
                p = Zn1[i][j] - Zn1[i][(j-1)];  
                q = Zn1[i][j] - Zn1[i-1][j]; 
              }
          pq = 1.0 + p*p + q*q;  
          PQs = 1.0 + Ps*Ps + Qs*Qs;  
          Eij = src[pos]/255.0;  
          fZ = -1.0*(Eij - Math.max(0.0,(1+p*Ps+q*Qs)/(Math.sqrt(pq)*Math.sqrt(PQs))));  
          dfZ = -1.0*((Ps+Qs)/(Math.sqrt(pq)*Math.sqrt(PQs))-(p+q)*(1.0+p*Ps+q*Qs)/(Math.sqrt(pq*pq*pq)*Math.sqrt(PQs))) ;  
          Y = fZ + dfZ*Zn1[i][j];  
          K = Si1[i][j]*dfZ/(Wn+dfZ*Si1[i][j]*dfZ);  
          Si[i][j] = (1.0 - K*dfZ)*Si1[i][j];   
          Zn[i][j] = Zn1[i][j] + K*(Y-dfZ*Zn1[i][j]);
          pos+=4;
        }

      pos=0;
      for(var i=0;i<height;i++)  
        for(var j=0;j<width;j++){ 
          //console.log(Zn[i][j]);
          max_v = Math.max(Zn[i][j], max_v);
          min_v = Math.min(Zn[i][j], min_v);
          Zn1[i][j] = Zn[i][j];  
          Si1[i][j] = Si[i][j];
          pos+=4;
      }  
  }


  pos=0;
  for(var i=0;i<height;i++)  
    for(var j=0;j<width;j++){ 
      //console.log(Zn[i][j]);
      var v = (Zn[i][j] + min_v) / (max_v - min_v) * 255;
      d[pos] = v;
      d[pos+1] = v;
      d[pos+2] = v;
      d[pos+3] = 255;
      pos+=4;
    }  
}

function reconstruct_depth()
{
	console.log("reconstruct depth!");
	srcData = Filters.getPixels(height_image);
	var src = srcData.data;
	var width = srcData.width;
	var height = srcData.height;
	var imgData = Filters.createImageData(srcData.width, srcData.height);
	var d = imgData.data;

	// switch to YcbCr
	var grayscale = Filters.filterImage(Filters.grayscale, height_image, false);
	
	//var img_data = Filters.newsobelfilter(grayscale, 1, 1, "sobel");
	
	var img_data = bertholdhorn(grayscale, width, height, grayscale);
	//pentland(width, d, width, height);
	//console.log(d);


	var dstData = Filters.createImageData(height_image.width, height_image.height);
			
	for (var i=0; i<dstData.data.length; i++){	
		dstData.data[i] = img_data.data[i];
	}

	// write out texture
	var canvas = document.createElement("canvas");
	var context = canvas.getContext('2d');
	canvas.width = srcData.width;
	canvas.height = srcData.height;
	context.clearRect(0, 0, srcData.width, srcData.height);
	context.putImageData(dstData, 0, 0, 0, 0, srcData.width, srcData.height);
	
	height_image.src = canvas.toDataURL();
}  



//  This is Bischel and Pentland's algorithm 




// Basic routines for shape from shading 
// Author:  Martin Bichsel               

function DirectionalSlope(surface_height, Pic, nCol, nRow, vI)
{
// dz[0..nRow-1][0..nCol-1][0..7]: change of surface height step in       
//                                 direction i*45 degrees, i in [0..7],   
//                                 assuming a Lambertian reflectance law  
//                                                                        
// Pic[0..nRow-1][0..nCol-1]:      Rotated, normalized brightness         
//                                                                        
// vI[0..2]:                       Normalized illumination vector,        
//                                 polonging towards light source         
  //var dz = createArray(ARRAY_SIZE, ARRAY_SIZE, 8); //[ARRAY_SIZE][ARRAY_SIZE][8];
  //var Pic = createArray(ARRAY_SIZE, ARRAY_SIZE, 8); //[ARRAY_SIZE][ARRAY_SIZE];
  //var nCol, nRow;
  //var vI; // Pointer?!

  var i, j;
  var sq05=Math.sqrt(0.5), e3, i1 = new Array(8), i2 = new Array(8), sina, Det, temp, nom;
  var eps =1.0e-6;//0.00247875217; //eps=1.0e-6 = 0.00247875217

  for (var iDir = 0;  iDir < 8;  iDir++){
    i1[iDir] = -Math.cos(iDir * Math.PI / 4.0) * vI[0] - Math.sin(iDir * Math.PI / 4.0) * vI[1];
    i2[iDir] =  Math.sin(iDir * Math.PI / 4.0) * vI[0] - Math.cos(iDir * Math.PI / 4.0) * vI[1];
  }

  for (var j = 0;  j < nRow; j++)
  {
    for (var i = 0;  i < nCol;  i++)
    {
      for (var iDir = 0;  iDir < 8;  iDir++)
      {
        temp = Pic[j][i] * Pic[j][i] - i2[iDir] * i2[iDir];
        Det = (1.0 - Pic[j][i] * Pic[j][i]) * temp;
        surface_height.dz[j][i][iDir] = -1.0e10;//-22026.4657948;//-1.0e10; // default 
        if (Det >= 0.0)
        {
          nom = temp - i1[iDir] * i1[iDir] + 1.0e-10;//0.00004539992;//
          if ( (nom > 0.0) || (i1[iDir] < eps) )
          {
            surface_height.dz[j][i][iDir] = (-i1[iDir] * vI[2] - Math.sqrt(Det)) / nom;
          }
        }
        if ((iDir.mod(2)) == 1)
        {
          surface_height.dz[j][i][iDir] *= sq05; // diagonal move 
        }
      }
    }
  }
} // end of DirectionalSlope 


//{{1},{1,0},{0},{0,-1},{-1},{-1, 0},{ 0},{ 0,1}}; 
var diS = new Array(new Array(1,1), new Array(1,0), new Array(0,0), new Array(0,-1), new Array(-1,0), new Array(-1,0), new Array( 0, 0),new Array( 0, 1));
//{{0},{0,1},{1},{1, 0},{ 0},{ 0,-1},{-1},{-1,0}};
var djS = new Array(new Array(0,0), new Array(0,1), new Array(1,0), new Array(1, 0), new Array( 0, 0), new Array(0,-1), new Array(-1,0),new Array(-1,0)); 



function GetHeight(Height_Obj, iIter, surface_height, nCol, nRow)
{
// Height[-1..nRow][-1..nCol]:  Local surface height in image coordinates.
//                              The initial Height has to be a large      
//                              negative value, except for a list of      
//                              singular polongs where a fixed height is  
//                              given.                                    
//                                                                        
// iIter:                       Iteration counter                         
//                                                                        
// dz[0..nRow][0..nCol][0..7]:  Change of surface height for a unit step  
//                              in direction i*45 degress, i in [0..7]    
//                                                                        
// NOTE:  At each iteration only 4 multiplications (factor 0.5) per pixel.
  //var Height = createArray(ARRAY_SIZE,ARRAY_SIZE);
  //var iIter; 
  //var dz = createArray(ARRAY_SIZE,ARRAY_SIZE,8);
  //var nCol, nRow;
  var i, j, i2, j2, iStep, di, dj;
  var z, h, DisplTot=0.0, eps=1.0e-5; //0.00673794699; // ;
  //console.log(Height);
  for (var j2 = 0;  j2 < nRow;  j2++)
  {
    if ( ((iIter.mod(4)) == 0) || ((iIter.mod(4)) == 1) )
    {
      j = j2;
    }
    else
    {
      j = nRow - 1 - j2; // change vertical direction of pass 
    }
    for (var i2 = 0;  i2 < nCol;  i2++)
    {
      if ( ((iIter.mod(2)) == 1) )
      {
        i = i2;
      }
      else
      {
        i = nCol - 1 - i2; // change horizontal direction of pass 
      }
      for (var iStep = 0;  iStep < 8;  iStep += 2)
      {
        dj = djS[iStep]; //[0]
        di = diS[iStep]; //[0] // hv-neighbors
        var dz_v = surface_height.dz[j][i][iStep];
        var dj_v = (j+dj[0]).mod(nCol); //j+dj[0]
        var di_v = (i+di[0]).mod(nCol); //i+di[0]
        //console.log(iStep);
        //console.log(dj[1]);
        //console.log(di[1]);

        var h = Height_Obj.Height[dj_v][di_v];
        var z = h + dz_v;
        if (z > Height_Obj.Height[j][i] + eps)
        {
          DisplTot += z - Height_Obj.Height[j][i];
          Height_Obj.Height[j][i] = z;
        }
        dj = djS[iStep+1];//[0];
        di = diS[iStep+1];//[0]; // diagnal neighbors
        var h1 = Height_Obj.Height[dj_v][di_v];
        var dx = (j+dj[1]).mod(nCol); //j + dj[1]
        var dy = (i+di[1]).mod(nCol); //i + di[1]
        //console.log(dx , dy);
        h2 = Height_Obj.Height[dx][dy];
        dz_v = surface_height.dz[j][i][iStep+1];
        z = 0.5 * ( h1 + h2 ) + dz_v; // longerpolate z in diagnal 
        if (z > Height_Obj.Height[j][i] + eps)
        {
          DisplTot += z - Height_Obj.Height[j][i];
          Height_Obj.Height[j][i] = z;
        }
      }
    }
  }
  return(DisplTot); // return total displacement
} // end of GetHeight 



function pentland(s, width, height)
{
	var IMG_SIZE = width;
    
	//printf("Number of iterations for Pentland's algorithm:");
	var iIter = 75; //8 paper
    
	//printf("Input the light source direction:\n");
	var vI = new Array(0.1,0.1,1);

	var len = Math.sqrt((vI[0] * vI[0]) + (vI[1] * vI[1]) + (vI[2] * vI[2]));
	vI[0] /= len;
	vI[1] /= len;
	vI[2] /= len;
  var ARRAY_SIZE       =IMG_SIZE;

  //var dz = createArray(ARRAY_SIZE, ARRAY_SIZE, 8);  //[ARRAY_SIZE][ARRAY_SIZE][8];                //eight directions
  var surface_height = { dz: createArray(ARRAY_SIZE, ARRAY_SIZE, 8) };  //[ARRAY_SIZE][ARRAY_SIZE][8];   
  var Pic = createArray(ARRAY_SIZE, ARRAY_SIZE); //[ARRAY_SIZE][ARRAY_SIZE];
  //var // [ARRAY_SIZE][ARRAY_SIZE]
  var Height_Obj = { Height: createArray(ARRAY_SIZE, ARRAY_SIZE) };
  var Height1 = createArray(ARRAY_SIZE, ARRAY_SIZE);

  //var iIter;
  //var vI[3];

  var len, x, y, x1, y1, phi, E, DisplTot, H, min_tmp, max_tmp;
  var vI2 = new Array(3);
  var old_disp;
  var i, j, k, i1, j1;
  var max_E;

  console.log("Source is ", vI[0], vI[1], vI[2]);

  // get the image, normalize it and rotate it 
  
  //img = UCFReadPic(in_fp); 

  var max_tmp = -1.0e10;//-22026.4657948; //
  var min_tmp = 1.0e10;// 22026.4657948; //
  //console.log(s);
  for (var i = 0; i < IMG_SIZE; i++) {
    for (var j = 0; j < IMG_SIZE; j++) {
      Pic[i][j] = 0.0;
      if (s[(i*width + j) * 4] > max_tmp)
        max_tmp = s[(i*width + j) * 4];
      if (s[(i*width + j) * 4] < min_tmp)
        min_tmp = s[(i*width + j) * 4];
    }
  }   
  //////////////////////////////////////////
  //Rotate();
  ///////////////////////////////////////////
  if ( (vI[0]*vI[0]+vI[1]*vI[1]) == 0.0) {
    phi = 0.0;
  }
  else {
    phi = Math.acos(vI[0]/Math.sqrt(vI[0]*vI[0]+vI[1]*vI[1]));
  }
  if (vI[1] < 0.0) 
    phi = 2.0 * Math.PI - phi;

  console.log("max_tmp = ", max_tmp, ", min_tmp = ", min_tmp);
  max_E = Number.MIN_VALUE;//-9e99;
  for (var i = 0; i < IMG_SIZE; i++) { 
    for (var j = 0; j < IMG_SIZE; j++) { 
      // rotate and make x aligns with (cos(phi), sin(phi))
      x = j - IMG_SIZE/2.0;
      y = IMG_SIZE/2.0 - i;

      // rotate x-axis phi degree
      x1 = x * Math.cos(phi) - y * Math.sin(phi);
      y1 = x * Math.sin(phi) + y * Math.cos(phi);
      i1 = parseInt(IMG_SIZE/2.0 - y1 + 0.5);
      j1 = parseInt(IMG_SIZE/2.0 + x1 + 0.5);
      if ( (i1 < 0.0) || (i1 >= IMG_SIZE) ||
           (j1 < 0.0) || (j1 >= IMG_SIZE) )
      {
        continue;
      }
      E = s[(i1*width + j1) * 4];
      E = (E - min_tmp) / (max_tmp - min_tmp);
      Pic[i][j] = E;
      if (E > max_E) 
        max_E = E;
    }   // for j 
  }   // for i
  console.log("max_E = ", max_E);

  vI2[0] = Math.cos(phi) * vI[0] + Math.sin(phi) * vI[1];
  vI2[1] = Math.cos(phi) * vI[1] - Math.sin(phi) * vI[0];
  vI2[2] = vI[2];

  len = Math.sqrt(vI2[0]*vI2[0] + vI2[1]*vI2[1] + vI2[2]*vI2[2]);
  vI2[0] /= len; 
  vI2[1] /= len; 
  vI2[2] /= len; 


  var k = 0;
  for (var i = 0; i < IMG_SIZE; i++) { 
    for (var j = 0; j < IMG_SIZE; j++) { 
      if (Math.abs(Pic[i][j] - 1.0) < 0.01 ) {
        Height_Obj.Height[i][j] = 200; // 55.0
        k = 1;
      }
      else
      {
        Height_Obj.Height[i][j] = -1.0e10;
      }  
    }
  }   
  if (k == 0)
  {
    console.log("No singular points found?");
    Height_Obj.Height[IMG_SIZE/2][IMG_SIZE/2] = 55; // 55.0
  }

  DirectionalSlope(surface_height, Pic, IMG_SIZE, IMG_SIZE, vI2);
  old_disp = 9.0e9;
  for(var k=0;  k<=iIter; k++) {
    DisplTot = GetHeight(Height_Obj, k, surface_height, IMG_SIZE, IMG_SIZE);
    console.log(k + "Total Displacement = " + DisplTot);
    if ( (Math.abs(old_disp - DisplTot) < 1.0) && (old_disp > DisplTot) ) 
      break;
    old_disp = DisplTot;
  }
  
  phi = -phi;
  for (var i = 0; i < IMG_SIZE; i++) { 
    for (var j = 0; j < IMG_SIZE; j++) { 
      Height1[i][j] = 0.0;
    }
  }
  max_depth = -100000000;
  min_depth = 1000000000;
  for (var i = 0; i < IMG_SIZE; i++) { 
    for (var j = 0; j < IMG_SIZE; j++) { 
      // rotate and make x aligns with (cos(phi), sin(phi)) 
      x = j - IMG_SIZE/2.0;
      y = IMG_SIZE/2.0 - i;

      // rotate x-axis phi degree 
      x1 = x * Math.cos(phi) - y * Math.sin(phi);
      y1 = x * Math.sin(phi) + y * Math.cos(phi);
      i1 = parseInt(IMG_SIZE/2.0 - y1 + 0.5);
      j1 = parseInt(IMG_SIZE/2.0 + x1 + 0.5);
      if ( (i1 < 0) || (i1 >= IMG_SIZE) ||
           (j1 < 0) || (j1 >= IMG_SIZE) )
      {
        continue;
      }

      Height1[i][j] = ( (Height_Obj.Height[i1][j1] < 0.0) ? 0.0 : Height_Obj.Height[i1][j1] );
	  //Height1[i][j] = Height_Obj.Height[i1][j1];
      max_depth = Math.max(max_depth, Height1[i][j]);
      min_depth = Math.min(min_depth, Height1[i][j]);
    }   // for j 
  }   // for i 

  //var imgData = Filters.createImageData(srcData.width, srcData.height);
  //d = imgData.data;
  //console.log(Height1);
  for (var i = 0; i < IMG_SIZE; i++) { 
    for (var j = 0; j < IMG_SIZE; j++) { 
      pos = (i*IMG_SIZE + j)*4;
      s[pos] = s[pos+1] = s[pos+2] = (Height1[i][j] - min_depth) / (max_depth - min_depth) * 255;//fprintf(out_fp, "%lf\n", Height1[i][j]);
      s[pos+3] = 255;      
      //console.log(Height1[i][j]);
    }
  }
  return s;
    //create_image(in_file, Height1);
}   // end of pentland

//ftp://publications.ai.mit.edu/ai-publications/pdf/AIM-1105.pdf
function bertholdhorn(src, srcWidth, srcHeight, edge){

	var ISIZE = srcWidth;
	  
	var row = new Array(3);   
	var A = createArray(3, 6);  
	    

	var argc;  	// 2 parameters
	var argv;	// [1] image file to read

	//var pic1,edge;
	var Mx = createArray(ISIZE, ISIZE),My = createArray(ISIZE, ISIZE),Mz = createArray(ISIZE, ISIZE),  
	      Nx = createArray(ISIZE, ISIZE),Ny = createArray(ISIZE, ISIZE),Nz = createArray(ISIZE, ISIZE),  
	      TZ = createArray(ISIZE, ISIZE);
	var d,lam,Sx,Sy,Sz,ss,Sxx,Syy,Szz,ns,mm,
	      deg,ENx,ENy,ENz,nx,ny,nz,ee,max,min,dd,at1;
	var I,J,K,i,j,k,E,X,flag=0,maxI;
	var R=52.0,err = 1;
	  
	X = 1;

	//pic1  = src;// photo
	  
	lam = 0.25;	
	console.log("Input lambda (0.25) = " + lam);
	  
	E = 1.0;	
	console.log("Input E (1.0) = " + E);  
	  
	maxI = 50;
	console.log("Max Iteration = " + maxI);  
		  
	Sx = 0.1; //?!
	console.log("Input Sx = " + Sx);  
	  
	Sy = 0.1; //?!
	console.log("Input Sy = " + Sy);  
	  
	Sz = 1; //?!
	console.log("Input Sz = " + Sz);  
	  
	dd = Math.sqrt(Sx*Sx+Sy*Sy+Sz*Sz);  
	Sx = Sx/dd;  
	Sy = Sy/dd;  
	Sz = Sz/dd;  
	  
	Sxx = Sx;  
	Syy = Sy;  
	Szz = Sz;  
	  
	// edge map?!
	//printf("Edge map = ");
	//edge = UCFReadPic(infile);  
	  
	/* use the true depth to initial normal of edge points */  
	//printf("True depth data file = ");  
	//for(j=0;j<ISIZE;j++)  
	// for(i=0;i<ISIZE;i++)  
	//   fscanf(infile,"%f",&TZ[i][j]);  
	  
	var pic2maxX = ISIZE;  
	var pic2maxY = ISIZE;  
	var pic2image = createArray(pic2maxX, pic2maxY);
	  
	/*   Initial N   */  
	  
    for (var i=0; i<ISIZE; i++)  
		for (var j=0; j<ISIZE; j++)  
		{  
			if(edge[(i+j*srcWidth) * 4] == 255) // if(edge[i+j*edge.maxX] == 255)  // edge file
	        {  
	           	d = (i-ISIZE/2)*(i-ISIZE/2) + (ISIZE/2-j)*(ISIZE/2-j) + TZ[i][j]*TZ[i][j];  
	           	Nx[i][j] = ((i-64.0)/Math.sqrt(d));    
	           	Ny[i][j] = ((64.0-j)/Math.sqrt(d));    
	           	Nz[i][j] = TZ[i][j]/Math.sqrt(d);    
	        }  
	        else  
	        {  
	           	if(src[(i+j*srcWidth) * 4] > 0)  
	           	{  
	            	Nx[i][j] = 0.0;    
	            	Ny[i][j] = 0.0;    
	            	Nz[i][j] = 1.0;    
	            }  
	           	else  
	           	{  
	            	Nx[i][j] = 0.0;    
	            	Ny[i][j] = 0.0;    
	            	Nz[i][j] = 0.0;    
	           	}  
	        };  
	    };  
	  
	  
	/*   Interative loop   */  
	if(Sx<=0.0001)  
		at1=Math.atan(Sy/0.000001);   
	else  
		at1=Math.atan(Sy/Sx);  
	
	console.log("Initial S = " + Sx+"," + Sy+"," + Sz + " A = " + (57.3*Math.acos(Sz/(Math.sqrt(Sx*Sx+Sy*Sy+Sz*Sz)))) + " B = "+ (57.3*at1));
	  
	K=1;
	while(K!=maxI && err > 0.04)  
	{
	  	for(var I=X;I<srcWidth-X;I++)  
	  	for(var J=X;J<srcHeight-X;J++)
	  	{  
	   		ns = (Nx[I][J]*Sx + Ny[I][J]*Sy + Nz[I][J]*Sz);  
	  
			  Mx[I][J] = (Nx[I][J+1]+Nx[I][J-1]+Nx[I+1][J]+Nx[I-1][J])/4.0 +  
	          ((E*E)/(4.0*lam))*((src[(I+J*srcWidth) * 4]/255.0 - Math.max(0,ns))*Sx);   
	   		My[I][J] = (Ny[I][J+1]+Ny[I][J-1]+Ny[I+1][J]+Ny[I-1][J])/4.0 +  
	          ((E*E)/(4.0*lam))*((src[(I+J*srcWidth) * 4]/255.0 - Math.max(0,ns))*Sy);  
	   		Mz[I][J] = (Nz[I][J+1]+Nz[I][J-1]+Nz[I+1][J]+Nz[I-1][J])/4.0 +  
	          ((E*E)/(4.0*lam))*((src[(I+J*srcWidth) * 4]/255.0 - Math.max(0,ns))*Sz);  
	  	}
	  
	 	for(var I=X;I<srcWidth-X;I++)  
	  	for(var J=X;J<srcHeight-X;J++)  
	  	{  
	  		if(src[(I+J*srcWidth) * 4] > 0 && edge[(I+J*srcWidth) * 4] != 255)   //&& edge.image[I+J*edge.maxX] != 255)
	  		{  
	   			mm=Math.sqrt(Mx[I][J]*Mx[I][J] + My[I][J]*My[I][J] + Mz[I][J]*Mz[I][J]);  
	   			if (mm == 0)  
	   			{  
	    			Nx[I][J] = 0;  
	    			Ny[I][J] = 0;  
	    			Nz[I][J] = 0;  
	   			}  
	   			else  
	   			{  
		    		Nx[I][J] = Mx[I][J]/mm;  
	    			Ny[I][J] = My[I][J]/mm;  
	    			Nz[I][J] = Mz[I][J]/mm;  
	   			}  
	  		}   
	  	};  
	  
		err = 0.0;  
		for(var i=0;i<pic2maxX;i++)  
	 	for(var j=0;j<pic2maxY;j++)  
	 	{  
	  		ee = (Sxx*Nx[i][j] + Syy*Ny[i][j] + Szz*Nz[i][j]);  
	  		pic2image[i+j*pic2maxY] = parseInt(Math.max(0,ee)*255);  
	  		err += Math.abs(src[(i+j*srcWidth) * 4]/255.0 - pic2image[i+j*pic2maxX]/255.0);  
	 	}
		err = err/(ISIZE*ISIZE);
	  
		console.log("K = " + (K++));
		  
		console.log("Intensity Error = " + err);
  	}  
	
	for (var i = 0; i < pic2maxX; i++) { 
    for (var j = 0; j < pic2maxY; j++) { 
      pos = (j*pic2maxX + i)*4;
      src[pos] = Nx[i][j];
      src[pos+1] = Ny[i][j];
      src[pos+2] = Nz[i][j];
      src[pos+3] = 255;      
      //console.log(Height1[i][j]);
    }
  }
  return pic2image;
  	/*
 	outfile = fopen("out2.img","w");  
 	UCFWritePic(pic2,outfile);  
 	fclose(outfile);  
  
 	outfile = fopen("normal2.out","w");  
 	for(i=0;i<pic2.maxX;i++)  
  	for(j=0;j<pic2.maxY;j++)  
   		fprintf(outfile,"%f %f %f \n",Nx[i][j],Ny[i][j],Nz[i][j]);  
 	fclose(outfile);*/
}