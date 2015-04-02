//Johnathon Hoste, 4/1/2015, Lab 4
var canvas;
var gl;

var numVertices  = 24;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

//from -10 to +10
var vertices = [
		vec4(  0,  7,  2, 1.0 ),
		vec4( -7, -7,  2, 1.0 ),
		vec4(  7, -7,  2, 1.0 ),
		vec4(  0,  7, -2, 1.0 ),
		vec4( -7, -7, -2, 1.0 ),
		vec4(  7, -7, -2, 1.0 )
    ];
	
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
]; 

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
	vec2(0.5, 1)
];

var mvMatrix, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];
var delta = 1.5;

var thetaLoc;

var pos = true;
var flag = true;

//texture vars
var prismVerticesTextureCoordBuffer;
var prismTexture;
var prismImage;

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
	 texCoordsArray.push(vertices[0]);
     colorsArray.push(vertexColors[c]); 
     pointsArray.push(vertices[b]); 
	 texCoordsArray.push(vertices[1]);
     colorsArray.push(vertexColors[c]); 
     pointsArray.push(vertices[c]); 
	 texCoordsArray.push(vertices[2]);
     colorsArray.push(vertexColors[c]);    
     pointsArray.push(vertices[a]); 
     texCoordsArray.push(vertices[0]);	 
     colorsArray.push(vertexColors[c]); 
     pointsArray.push(vertices[c]); 
	 texCoordsArray.push(vertices[2]);
     colorsArray.push(vertexColors[c]); 
     pointsArray.push(vertices[d]); 
	 texCoordsArray.push(vertices[3]);
     colorsArray.push(vertexColors[c]);     
}

function tri(a,b,c){
	var indices = [a,b,c];
	var textind = [0,4,5];
	
	for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( vertices[indices[i]] );
		texCoordsArray.push( vertices[textind[i]] );
		colorsArray.push(vertexColors[b]); 
    } 
}

function colorPrism()
{
    quad( 0, 1, 4, 3 );
    quad( 2, 0, 3, 5 );
    quad( 1, 2, 5, 4 );
	tri( 0, 1, 2);
	tri( 5, 4, 3);
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.1, 0.3, 0.1, 1.0 ); 
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorPrism();


    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTextureCoord = gl.getAttribLocation( program, "vTextureCoord" );
    gl.vertexAttribPointer( vTextureCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTextureCoord );
	
    // Initialize a texture
    var image = document.getElementById("texImage");
    configureTexture( image );
	

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "pMatrix"),
       false, flatten(projection));
    
    render();
	
		//event listeners for keyboard 
	window.onkeydown = function(event) {
		var key = String.fromCharCode(event.keyCode);
		switch (key) {			
			case "&":
				axis = xAxis;
				pos = true;
				break;
			case "%":
				//move left
				axis = yAxis;
				pos = false;
				break;
			case "(":
				axis = xAxis;
				pos = false;
				break;
			case "'":
				//move right
				axis = yAxis;
				pos = true;
				break;
			case "P":
				// pause
				if(flag){
					flag = false;
				} else {
					flag = true;
				}
				break;
		}
	};
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

var render = function(){
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
	if(flag){
		if(pos){		
			theta[axis] += delta;
		} else {
			theta[axis] -= delta;
		}
	}
            
	mvMatrix = mat4(vec4(0.1,0,0,0),
					vec4(0,0.1,0,0),
					vec4(0,0,0.1,0),
					vec4(0,0,0,1));
    mvMatrix = mult(mvMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    mvMatrix = mult(mvMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    mvMatrix = mult(mvMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "mvMatrix"), false, flatten(mvMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
            
    requestAnimFrame(render);
}