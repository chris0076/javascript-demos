var GRID;
var GRIDS;

var BLANK = 0;
var WIRE = 1;
var HEAD = 2;
var TAIL = 3;

$(document).ready(function () {
	function getGrid(point) {
		x = Math.floor(point.x/gridsize);
		y = Math.floor(point.y/gridsize);
		if ((y < 0 || y > gridy-1) || (x < 0 || x > gridx-1))
			return null;
		return {x: x,  y: y}
	}
	function getGridID(point) {
		return point.y*gridx + point.x;
	}

	function poweredNeighbors(x, y, grid) {
		var tally = 0;
		for (var i=-1; i <= 1; i++) {
			for (var j=-1; j <=1; j++) {
				if (i || j) {
					var id = getGridID({x:x+i,y:y+j});
					if (grid[id] == HEAD) tally++;
				}
			}
		}
		return tally;
	}

	function updateGrid(grid, gridold) {
		for (var i=0; i < gridx; i++) {
			for (var j=0; j < gridy; j++) {
				var id = getGridID({x:i, y:j});
				var val = gridold[id];
				var tally = poweredNeighbors(i, j, gridold);
				switch (val) {
					case WIRE:
						if (tally == 1 || tally == 2) {	
							grid[id] = HEAD;
						} else { 
							grid[id] = WIRE;
						}
						break;
					case HEAD: grid[id] = TAIL; break;
					case TAIL: grid[id] = WIRE; break;
				}
			}
		}
	}

	colors = ['#000000', '#FF8800', '#FFFFFF', '#0044FF'];
	function render(ctx, grid) {
		for (var i=0; i < gridx; i++) {
			for (var j=0; j < gridy; j++) {
				var val = grid[getGridID({x:i, y:j})];
				ctx.fillStyle = colors[val];
				ctx.fillRect(i*gridsize, j*gridsize, gridsize, gridsize);
			}
		}
	}

	function stepSimulation(ctx) {
    	GRID = GRIDS[step % 2];
    	updateGrid(GRIDS[(step+1) % 2], GRID);
    	step++;
    	GRID = GRIDS[step % 2];
    	render(ctx, GRID);
	}

	function toggleGrid(e) {
        var p = getPos(e, canvas);
        var pgrid = getGrid(p);
        if (pgrid) {
	        var id = getGridID(pgrid);
			GRIDS[0][id] = state;
			GRIDS[1][id] = state;
	        render(ctx, GRID);
        }
	}

    var canvas = document.getElementById("electronics");
    canvas.onselectstart = function () { return false; };
    canvas.oncontextmenu = function () {return false; };
    var ctx = canvas.getContext("2d");

    writeString(canvas, "Click");
    ctx.fillStyle = "#222222";

    var gridsizeelement = $("#gridsize");
    var gridsize = gridsize = parseInt(gridsizeelement.val());;
    var gridx = canvas.width/gridsize;
    var gridy = canvas.height/gridsize;

	GRIDS = [new Uint8Array(gridx*gridy), new Uint8Array(gridx*gridy)];
	GRID = GRIDS[0];
	var step = 0;
    gridsizeelement.change(function () { 
    	gridsize = parseInt(gridsizeelement.val()); 
	    gridx = canvas.width/gridsize;
	    gridy = canvas.height/gridsize;
	    GRIDS = [new Uint8Array(gridx*gridy), new Uint8Array(gridx*gridy)];
	    GRID = GRIDS[0];
	    step = 0;
	    render(ctx, GRID);
    });

	var dragging = false;
	var state = undefined;
	var running = false;
    $(canvas).mousedown(function (e) { 
    	dragging = true; 
    	switch (e.which) {
    		case 1: state = WIRE; break;
    		case 2: state = HEAD; break;
    		case 3: state = BLANK; break;
    		default: console.log(e);
    	}
    	toggleGrid(e);
    });
    $(document).mouseup(function (e) { dragging = false; state = undefined; });

    $(canvas).mousemove(function (e) {
    	if (dragging) {
	        toggleGrid(e);
    	}
    });

    $(canvas).keydown(function (e) {
        if (e.keyCode == 65) {
        	stepSimulation(ctx);
        }
        if (e.keyCode == 66) {
        	step++;
        	GRID = GRIDS[step % 2];
        	render(ctx, GRID);
        }
        if (e.keyCode == 67) {
        	running = !running;
        }
    });

    $(canvas).hover(function (e) {
        iid = setInterval(function() { if (running) stepSimulation(ctx);}, 100) },
        function() { (iid && clearInterval(iid)); }
    );


    var input = document.getElementById("electronics_input");
    var img = new Image();
    $(input).change(function () {
	    img.src = window.URL.createObjectURL(input.files[0]);
    });
    img.onload = function () {
	    ctx.drawImage(img, 0, 0);
	    pixels = ctx.getImageData(0,0,canvas.width, canvas.height).data;
	    for (var i=0; i < gridx; i++) {
	    	for (var j=0; j < gridy; j++) {
	    		var pos = (j * gridsize * gridsize * gridx) + (i * gridsize);
	    		var id = (j * gridx) + i;
	    		if (pixels[4*pos] == 255 && pixels[4*pos+1] == 136 && pixels[4*pos+2] == 0) {
		            GRID[id] = WIRE;
	    		} else if (pixels[4*pos] == 255 && pixels[4*pos+1] == 255 && pixels[4*pos+2] == 255) {
	    			GRIDS[0][id] = HEAD;
	    			GRIDS[1][id] = HEAD;
	    		} else {
	    			GRIDS[0][id] = BLANK;
	    			GRIDS[1][id] = BLANK;
	    		}
	    	}
	    }
	    render(ctx, GRID);
    }
});
