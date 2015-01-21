/*

/*  This is Bischel and Pentland's algorithm  */

#include <stdio.h>
#include <math.h>
#include "../util/ImageTools.h"

#define  ARRAY_SIZE   		256
#define  MAX_LONGENSITY		255
#define  UNDEF			-9999.0
#define  SCALE			50.0
#define  SIGMA		        0.4
#define  MASK_SIZE	   	6

#include "../util/UCFReadPic.c"
#include "../util/UCFWritePic.c"

#define max(n1, n2) ( ((n1) > (n2)) ? (n1) : (n2) )
#define min(n1, n2) ( ((n1) < (n2)) ? (n1) : (n2) )

double dz[ARRAY_SIZE][ARRAY_SIZE][8];                  /* eight directions */
double Pic[ARRAY_SIZE][ARRAY_SIZE];
double Height[ARRAY_SIZE][ARRAY_SIZE];
double Height1[ARRAY_SIZE][ARRAY_SIZE];
double SC2=2.0,Center=170.0,Xang,Yang,Zang;
PIC img;

double C[2][2]  = { 0.0001, 0.0000,
                    0.0000, 0.0001  };

double PI;
int IMG_SIZE;


/* Basic routines for shape from shading */
/* Author:  Martin Bichsel               */

void DirectionalSlope(dz, Pic, nCol, nRow, vI)
    double dz[ARRAY_SIZE][ARRAY_SIZE][8];
    double Pic[ARRAY_SIZE][ARRAY_SIZE];
    long nCol, nRow;
    double *vI;
{
/* dz[0..nRow-1][0..nCol-1][0..7]: change of surface height step in       */
/*                                 direction i*45 degrees, i in [0..7],   */
/*                                 assuming a Lambertian reflectance law  */
/*                                                                        */
/* Pic[0..nRow-1][0..nCol-1]:      Rotated, normalized brightness         */
/*                                                                        */
/* vI[0..2]:                       Normalized illumination vector,        */
/*                                 polonging towards light source         */

    long i, j, iDir;
    double sq05=sqrt(0.5), e3, i1[8], i2[8], sina, Det, temp, nom, eps=1.0e-6;

    for (iDir = 0;  iDir < 8;  iDir++)
    {
	i1[iDir] = -cos((double)iDir * PI / 4.0) * vI[0]
		    - sin((double)iDir * PI / 4.0) * vI[1];
	i2[iDir] =  sin((double)iDir * PI / 4.0) * vI[0]
		    - cos((double)iDir * PI / 4.0) * vI[1];
    }

    for (j = 0;  j < nRow; j++)
    {
	for (i = 0;  i < nCol;  i++)
	{
	    for (iDir = 0;  iDir < 8;  iDir++)
	    {
		temp = Pic[j][i] * Pic[j][i] - i2[iDir] * i2[iDir];
		Det = (1.0 - Pic[j][i] * Pic[j][i]) * temp;
		dz[j][i][iDir] = -1.0e10; /* default */
		if (Det >= 0.0)
		{
		    nom = temp - i1[iDir] * i1[iDir] + 1.0e-10;
		    if ( (nom > 0.0) || (i1[iDir] < eps) )
		    {
			dz[j][i][iDir] = (-i1[iDir] * vI[2] - sqrt(Det)) / nom;
		    }
		}
		if ((iDir % 2) == 1)
		{
		    dz[j][i][iDir] *= sq05; /* diagnal move */
		}
	    }
	}
    }
} /* end of DirectionalSlope */


 
  static  long diS[8][2] = {{1},{1,0},{0},{0,-1},{-1},{-1, 0},{ 0},{ 0,1}};
  static  long djS[8][2] = {{0},{0,1},{1},{1, 0},{ 0},{ 0,-1},{-1},{-1,0}};
  



double GetHeight(Height, iIter, dz, nCol, nRow)
    double Height[ARRAY_SIZE][ARRAY_SIZE];
    long iIter; 
    double dz[ARRAY_SIZE][ARRAY_SIZE][8];
    long nCol, nRow;
{
/* Height[-1..nRow][-1..nCol]:  Local surface height in image coordinates.*/
/*                              The initial Height has to be a large      */
/*                              negative value, except for a list of      */
/*                              singular polongs where a fixed height is  */
/*                              given.                                    */
/*                                                                        */
/* iIter:                       Iteration counter                         */
/*                                                                        */
/* dz[0..nRow][0..nCol][0..7]:  Change of surface height for a unit step  */
/*                              in direction i*45 degress, i in [0..7]    */
/*                                                                        */
/* NOTE:  At each iteration only 4 multiplications (factor 0.5) per pixel.*/

    long i, j, i2, j2, iStep, *di, *dj;
   
    double z, h, DisplTot=0.0, eps=1.0e-5;

    for (j2 = 0;  j2 < nRow;  j2++)
    {
	if ( ((iIter % 4) == 0) || ((iIter % 4) == 1) )
	{
	    j = j2;
	}
	else
	{
	    j = nRow - 1 - j2; /* change vertical direction of pass */
	}
	for (i2 = 0;  i2 < nCol;  i2++)
	{
	    if ( ((iIter % 2) == 1) )
	    {
		i = i2;
	    }
	    else
	    {
		i = nCol - 1 - i2; /* change horizontal direction of pass */
	    }
	    for (iStep = 0;  iStep < 8;  iStep += 2)
	    {
		dj = &djS[iStep][0];
		di = &diS[iStep][0]; /* hv-neighbors */
		z = Height[j+dj[0]][i+di[0]] + dz[j][i][iStep];
		if (z > Height[j][i] + eps)
		{
		    DisplTot += z - Height[j][i];
		    Height[j][i] = z;
		}
		dj = &djS[iStep+1][0];
		di = &diS[iStep+1][0]; /* diagnal neighbors */
		z = 0.5 * ( Height[j+dj[0]][i+di[0]]
			    + Height[j+dj[1]][i+di[1]]
			  ) + dz[j][i][iStep+1]; /* longerpolate z in diagnal */
		if (z > Height[j][i] + eps)
		{
		    DisplTot += z - Height[j][i];
		    Height[j][i] = z;
		}
	    }
	}
    }
    return(DisplTot); /* return total displacement */
} /* end of GetHeight */



main()
{
    int k, i, j;
    FILE *fp, *outfile;
    long iIter;
    double E, len, vI[3];
    double K, K0, K1, W, Y, dfp, dfq, dfZx, dfZy, f, Zx, Zy;
    PIC pic1;
    int dx, dy, dz, flg;
    double Si1_sum, Si_sum;
    double max_height, min_height;
    FILE *in_fp;
    char in_file[10];

    PI = 4.0 * atan(1.0);

    printf("Image size = ");
    scanf("%d", &IMG_SIZE);

    printf("Number of iterations for Pentland's algorithm:");
    scanf("%d", &iIter);

    printf("Input the light source direction:\n");
    printf("Sx =");
    scanf("%lf", &vI[0]);
    printf("Sy =");
    scanf("%lf", &vI[1]);
    printf("Sz =");
    scanf("%lf", &vI[2]);

    len = sqrt(SQR(vI[0]) + SQR(vI[1]) + SQR(vI[2]));
    vI[0] /= len;
    vI[1] /= len;
    vI[2] /= len;
    pentland(iIter, vI);
}   /* end of main */



pentland(iIter, vI)
    long iIter;
    double vI[3];
{
    double len, x, y, x1, y1, phi, E, DisplTot, H, min_tmp, max_tmp, vI2[3];
    double old_disp;
    FILE *in_fp, *out_fp;
    char in_file[80];
    long i, j, k, i1, j1;
    double max_E;

printf("Source is (%lf, %lf, %lf)\n", vI[0], vI[1], vI[2]);

    /* get the image, normalize it and rotate it */
    printf("Input image file:");
    scanf("%s", in_file);
    
    if ( (in_fp = fopen(in_file, "r")) == NULL) {
	fprintf(stderr, "Can't open image file.\n");
	exit(1);
    }

    img = UCFReadPic(in_fp); 
    fclose(in_fp); 

    max_tmp = -1.0e10;
    min_tmp = 1.0e10;
    for (i = 0; i < IMG_SIZE; i++) {
        for (j = 0; j < IMG_SIZE; j++) {
	    Pic[i][j] = 0.0;
            if ((double)img.image[i*img.maxX + j] > max_tmp)
                max_tmp = (double)img.image[i*img.maxX + j];
	    if ((double)img.image[i*img.maxX + j] < min_tmp)
		min_tmp = (double)img.image[i*img.maxX + j];
        }
    }   
/**********************************************
  Rotate();
**********************************************/
    if ( (vI[0]*vI[0]+vI[1]*vI[1]) == 0.0) {
	phi = 0.0;
    }
    else {
	phi = acos(vI[0]/sqrt(vI[0]*vI[0]+vI[1]*vI[1]));
    }
    if (vI[1] < 0.0) phi = 2.0 * PI - phi;

printf("max_tmp = %10.8lf, min_tmp = %10.8lf\n", max_tmp, min_tmp);
    max_E = -9e99;
    for (i = 0; i < IMG_SIZE; i++) { 
        for (j = 0; j < IMG_SIZE; j++) { 

            /* rotate and make x aligns with (cos(phi), sin(phi)) */
            x = j - IMG_SIZE/2.0;
            y = IMG_SIZE/2.0 - i;

	    /* rotate x-axis phi degree */
            x1 = x * cos(phi) - y * sin(phi);
            y1 = x * sin(phi) + y * cos(phi);
            i1 = (int)(IMG_SIZE/2.0 - y1 + 0.5);
            j1 = (int)(IMG_SIZE/2.0 + x1 + 0.5);
	    if ( (i1 < 0.0) || (i1 >= IMG_SIZE) ||
	         (j1 < 0.0) || (j1 >= IMG_SIZE) )
	    {
		continue;
	    }
            E = (double)img.image[i1*img.maxX + j1];
            E = (E - min_tmp) / (max_tmp - min_tmp);
            Pic[i][j] = E;
	    if (E > max_E) max_E = E;
        }   /* for j */
    }   /* for i */
    printf("max_E = %10.8lf\n", max_E);

    vI2[0] = cos(phi) * vI[0] + sin(phi) * vI[1];
    vI2[1] = cos(phi) * vI[1] - sin(phi) * vI[0];
    vI2[2] = vI[2];

    len = sqrt(vI2[0]*vI2[0] + vI2[1]*vI2[1] + vI2[2]*vI2[2]);
    vI2[0] /= len; 
    vI2[1] /= len; 
    vI2[2] /= len; 

 
    k = 0;
    for (i = 0; i < IMG_SIZE; i++) { 
        for (j = 0; j < IMG_SIZE; j++) { 
            if (fabs((double) Pic[i][j] - 1.0) < 0.01 ) {
                Height[i][j] = 55.0;
		k = 1;
            }
            else
	    {
                Height[i][j] = -1.0e10;
	    }  
	}
    }   
    if (k == 0)
    {
	printf("No singular points found?\n");
	Height[IMG_SIZE/2][IMG_SIZE/2] = 55.0;
    }
  
    DirectionalSlope(dz, Pic, (long)IMG_SIZE, (long)IMG_SIZE, vI2);

    old_disp = 9.0e9;
    for(k=0;  k<=iIter; k++) {
        DisplTot = GetHeight(Height, k, dz, (long)IMG_SIZE, (long)IMG_SIZE);
	printf("%3d)  Total Displacement = %lf\n",k,DisplTot);
	if ( (fabs(old_disp - DisplTot) < 1.0) && (old_disp > DisplTot) ) break;
	old_disp = DisplTot;
    }
    

    phi = -phi;
    for (i = 0; i < IMG_SIZE; i++) { 
        for (j = 0; j < IMG_SIZE; j++) { 
	    Height1[i][j] = 0.0;
	}
    }
    for (i = 0; i < IMG_SIZE; i++) { 
        for (j = 0; j < IMG_SIZE; j++) { 
            /* rotate and make x aligns with (cos(phi), sin(phi)) */
            x = j - IMG_SIZE/2.0;
            y = IMG_SIZE/2.0 - i;

	    /* rotate x-axis phi degree */
            x1 = x * cos(phi) - y * sin(phi);
            y1 = x * sin(phi) + y * cos(phi);
            i1 = (int)(IMG_SIZE/2.0 - y1 + 0.5);
            j1 = (int)(IMG_SIZE/2.0 + x1 + 0.5);
	    if ( (i1 < 0) || (i1 >= IMG_SIZE) ||
	         (j1 < 0) || (j1 >= IMG_SIZE) )
	    {
		continue;
	    }
            Height1[i][j] = ( (Height[i1][j1] < 0.0) ? 0.0 : Height[i1][j1] );
        }   /* for j */
    }   /* for i */
 
    if ((out_fp = fopen("depth.out","w")) == NULL) {
        printf("Unable to open output depth file.\n");
        exit(1);
    }

    for (i = 0; i < IMG_SIZE; i++) { 
        for (j = 0; j < IMG_SIZE; j++) { 
            fprintf(out_fp, "%lf\n", Height1[i][j]);
        }  
    }    

    fclose(out_fp);

    sprintf(in_file, "depth.img");
    create_image(in_file, Height1);
}   /* end of pentland */


#ifdef DO_NOT_COMPILE

/***************************************************************/
/*                                                             */
/*  Multiplies M1 by M2 (4 x 4 X 4 x 4) and puts result in R   */
/*                                                             */
/***************************************************************/

Matrix_Multiply(M1,M2,R)
double *M1,*M2,*R;

{
long x,y,z;
double f;

   for (z=0; z<16; z++) 
       R[z] =  0.0;

   for (z=0; z<4; z++)    /* next column */
   for (x=0; x<4; x++)   /* row    */
   for (y=0; y<4; y++)  /* column */
   {
      f = M1[y+z*4]*M2[y*4+x];
      if (f>0.0) R[x+z*4] =  R[x+z*4] + f;
      else  R[x+z*4] =  R[x+z*4] + f;

    }
    /* R[0]=1;R[5]=1;R[10]=1;
    */


}


/***************************************************************/
/*                                                             */
/*  Multiplies M1 by M2 (4 x 4 X 4 x 1) and puts result in R   */
/*                                                             */
/***************************************************************/

 Matrix_Multiply2(M1,M2,R)
double *M1,*M2,*R;

{
long x,y,z;
double f;
   for (z=0; z<4; z++)
   for (y=0; y<4; y++)
   {
      f = M1[y+z*4]*M2[y];
      if (f > 0.0 || 1) R[z] = R[z] + f;
   }
}

#endif




create_image(filename, matrix)
char *filename;
double matrix[ARRAY_SIZE][ARRAY_SIZE];
{
    int x, y;
    double max_val, min_val;
    FILE *outfile;
    PIC outpic;

    if ((outpic.image = (unsigned char *)malloc(IMG_SIZE*IMG_SIZE)) == NULL)
    {
	fprintf(stderr, "Malloc failed in create_image()\n");
	exit(1);
    }
    outpic.type = 0;
    outpic.maxX = outpic.maxY = IMG_SIZE;

    if ( (outfile = fopen(filename, "w")) == NULL)
    {
	fprintf(stderr, "Can't open '%s' in create_image()\n", filename);
	exit(1);
    }

    max_val = -1e99;
    min_val = 1e99;
    for (x = 0;  x < IMG_SIZE;  x++)
    {
	for (y = 0;  y < IMG_SIZE;  y++)
	{
	    max_val = max(max_val, matrix[x][y]);
	    min_val = min(min_val, matrix[x][y]);
	}
    }
fprintf(stderr, "image name:  %s\n", filename);
fprintf(stderr, "\tmax_val = %lg\n", max_val);
fprintf(stderr, "\tmin_val = %lg\n", min_val);
    for (x = 0;  x < IMG_SIZE;  x++)
    {
	for (y = 0;  y < IMG_SIZE;  y++)
	{
	    outpic.image[y+x*IMG_SIZE] =
	         (unsigned char) (((matrix[x][y]-min_val)/(max_val-min_val))*255.0 + 0.5);
	}
    }
    UCFWritePic(outpic, outfile);
    fclose(outfile);
}

*/