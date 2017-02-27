//DancingDog.js - initial version by AMD/2014


//GENERAL FUNCTIONS

function create(proto) { // Create object and applies init(...) to it
	function F() {}
	F.prototype = proto;
	var obj = new F();
	if(arguments.length > 1)
		obj.init.apply(obj, Array.prototype.slice.apply(arguments).slice(1));
	return obj;
}

function extend(proto, added) { // Creates new prototype that extends existing prototype
	function F() {}
	F.prototype = proto;
	var proto1 = new F();
	for(prop in added)
		proto1[prop] = added[prop];
	return proto1;
}

function rand(n) {
	return Math.floor(Math.random() * n);
}

function distance(x1, y1, x2, y2) {
	var distx = Math.abs(x1 - x2);
	var disty = Math.abs(y1 - y2);
	return Math.ceil(Math.sqrt(distx*distx + disty*disty));
}

function mesg(m) {
	return alert(m);
}


//GLOBAL CONSTANTS AND VARIABLES

const WORLD_WIDTH = 31;
const WORLD_HEIGHT = 18;

const MIN_SPEED = 0;
const MAX_SPEED = 10;
const DEFL_SPEED = 4;

const ACTOR_PIXELS = 32;

const N_IMAGES = 5;
const DOG_IMAGE_NAME = "http://ctp.di.fct.unl.pt/~amd/misc/dog.jpg";
const CRAB_IMAGE_NAME = "http://ctp.di.fct.unl.pt/~amd/misc/crab.jpg";
const BLOCK_IMAGE_NAME = "http://ctp.di.fct.unl.pt/~amd/misc/block.jpg";
const BOWL_IMAGE_NAME = "http://ctp.di.fct.unl.pt/~amd/misc/bowl.jpg";
const EMPTY_IMAGE_NAME = "http://ctp.di.fct.unl.pt/~amd/misc/empty.jpg";

const N_BOWLS = 120;
const N_CRABS = 5;

//added new variables
var ctx, loaded, time, empty, world, dog, crabs, paused, victories, defeats;

var audioControl = true;
var audioMusic = new Audio("https://dl.dropboxusercontent.com/u/14807083/UT%20W0.mp3");


//ACTORS

var PreActor = {
	image: null
}

var Actor = extend(PreActor, {
	x: 0, y: 0,
	init: function(x, y) {
		this.x = x;
		this.y = y;
		this.show();
	},
	show: function() {
		world[this.x][this.y] = this;
		ctx.drawImage(this.image, this.x * ACTOR_PIXELS, this.y * ACTOR_PIXELS);
	},
	hide: function() {
		world[this.x][this.y] = empty;
		ctx.drawImage(empty.image, this.x * ACTOR_PIXELS, this.y * ACTOR_PIXELS);
	}
});

var Empty = extend(PreActor, {
});

var Dog = extend(Actor, {
	move: function(dx, dy) {
		this.hide();
		var over = false;
		if(this.x+dx != 0 && this.y+dy != 0 && this.x+dx != WORLD_WIDTH-1 && this.y+dy != WORLD_HEIGHT-1) {
			if(world[this.x+dx][this.y+dy] == empty) {
				this.x += dx;
				this.y += dy;
			}
			else {
				var mx = this.x + dx; //mx = x where the dog will move
				var my = this.y + dy; //my = y where the dog will move
				var bool = true;

				for(i in crabs) {
					if(crabs[i].x == mx && crabs[i].y == my) {
						bool = false;
						this.x = mx;
						this.y = my;
						over = true;
						gameOver();
					}
				}

				if(dx == 1) { //move right
					while(bool) {
						mx++;
						if(mx == WORLD_WIDTH-1)
							bool = false;
						else if(world[mx][my] == empty) {
							create(Bowl, mx, my);
							world[this.x+dx][this.y+dy].hide();
							this.x += dx;
							this.y += dy;
							bool = false;
						}
						for(i in crabs) {
							if(crabs[i].x == mx  && crabs[i].y == my)
								bool = false;
						}
					}
				}
				else if(dy == 1) { //move down
					while(bool) {
						my++;
						if(my == WORLD_HEIGHT-1)
							bool = false;
						else if(world[mx][my] == empty) {
							create(Bowl, mx, my);
							world[this.x+dx][this.y+dy].hide();
							this.x += dx;
							this.y += dy;
							bool = false;
						}
						for(i in crabs) {
							if(crabs[i].x == mx  && crabs[i].y == my)
								bool = false;
						}
					}
				}
				else if(dx == -1) { //move left
					while(bool) {
						mx--;
						if(mx == 0)
							bool = false;
						else if(world[mx][my] == empty) {
							create(Bowl, mx, my);
							world[this.x+dx][this.y+dy].hide();
							this.x += dx;
							this.y += dy;
							bool = false;
						}
						for(i in crabs) {
							if(crabs[i].x == mx  && crabs[i].y == my)
								bool = false;
						}
					}
				}
				else { //dy == -1 move up
					while(bool) {
						my--;
						if(my == 0)
							bool = false;
						else if(world[mx][my] == empty) {
							create(Bowl, mx, my);
							world[this.x+dx][this.y+dy].hide();
							this.x += dx;
							this.y += dy;
							bool = false;
						}
						for(i in crabs) {
							if(crabs[i].x == mx  && crabs[i].y == my)
								bool = false;
						}
					}
				}
			}
		}
		if(!over) {
			this.show();
		}
	}
});

//changed this
var Crab = extend(Actor, {
	mov: true,
	stuck: function() {
		return !this.mov;
	},
	animation: function() {
		this.hide();
		var over = false;
		//saves the explored/unexplored cells of the canvas
		var found = [];
		var w = 0;
		var h = 0;
		while(w < WORLD_WIDTH) {
			found[w] = [];
			while(h < WORLD_HEIGHT) {
				found[w][h] = false;
				h++;
			}
			h = 0;
			w++;
		}

		//saves the previous explored cell of the canvas
		var previous = [];
		w = 0;
		h = 0;
		while(w < WORLD_WIDTH) {
			previous[w] = [];
			while(h < WORLD_HEIGHT) {
				previous[w][h] = [w,h];
				h++;
			}
			h = 0;
			w++;
		}

		var queue = [];
		queue.push([this.x,this.y]); //root (position of the crab)
		found[this.x][this.y] = true;
		var pos;

		do {
			pos = queue.shift();

			if(world[pos[0]+1][pos[1]] == empty || (pos[0]+1 == dog.x && pos[1] == dog.y)) {
				if(found[pos[0]+1][pos[1]] == false) {
					queue.push([pos[0]+1,pos[1]]);
					found[pos[0]+1][pos[1]] = true;
					previous[pos[0]+1][pos[1]] = [pos[0],pos[1]];
				}
			}
			if(world[pos[0]-1][pos[1]] == empty || (pos[0]-1 == dog.x && pos[1] == dog.y)) {
				if(found[pos[0]-1][pos[1]] == false) {
					queue.push([pos[0]-1,pos[1]]);
					found[pos[0]-1][pos[1]] = true;
					previous[pos[0]-1][pos[1]] = [pos[0],pos[1]];
				}
			}
			if(world[pos[0]][pos[1]+1] == empty || (pos[0] == dog.x && pos[1]+1 == dog.y)) {
				if(found[pos[0]][pos[1]+1] == false) {
					queue.push([pos[0],pos[1]+1]);
					found[pos[0]][pos[1]+1] = true;
					previous[pos[0]][pos[1]+1] = [pos[0],pos[1]];
				}
			}
			if(world[pos[0]][pos[1]-1] == empty || (pos[0] == dog.x && pos[1]-1 == dog.y)) {
				if(found[pos[0]][pos[1]-1] == false) {
					queue.push([pos[0],pos[1]-1]);
					found[pos[0]][pos[1]-1] = true;
					previous[pos[0]][pos[1]-1] = [pos[0],pos[1]];
				}
			}
			if(world[pos[0]+1][pos[1]+1] == empty || (pos[0]+1 == dog.x && pos[1]+1 == dog.y)) {
				if(found[pos[0]+1][pos[1]+1] == false) {
					queue.push([pos[0]+1,pos[1]+1]);
					found[pos[0]+1][pos[1]+1] = true;
					previous[pos[0]+1][pos[1]+1] = [pos[0],pos[1]];
				}
			}
			if(world[pos[0]+1][pos[1]-1] == empty || (pos[0]+1 == dog.x && pos[1]-1 == dog.y)) {
				if(found[pos[0]+1][pos[1]-1] == false) {
					queue.push([pos[0]+1,pos[1]-1]);
					found[pos[0]+1][pos[1]-1] = true;
					previous[pos[0]+1][pos[1]-1] = [pos[0],pos[1]];
				}
			}
			if(world[pos[0]-1][pos[1]+1] == empty || (pos[0]-1 == dog.x && pos[1]+1 == dog.y)) {
				if(found[pos[0]-1][pos[1]+1] == false) {
					queue.push([pos[0]-1,pos[1]+1]);
					found[pos[0]-1][pos[1]+1] = true;
					previous[pos[0]-1][pos[1]+1] = [pos[0],pos[1]];
				}
			}
			if(world[pos[0]-1][pos[1]-1] == empty || (pos[0]-1 == dog.x && pos[1]-1 == dog.y)) {
				if(found[pos[0]-1][pos[1]-1] == false) {
					queue.push([pos[0]-1,pos[1]-1]);
					found[pos[0]-1][pos[1]-1] = true;
					previous[pos[0]-1][pos[1]-1] = [pos[0],pos[1]];
				}
			}
		} while(queue.length > 0 && (pos[0] != dog.x || pos[1] != dog.y));

		var i, path;
		i = 0;
		path = [];
		if(pos[0] == dog.x && pos[1] == dog.y) {
			path[i] = [pos[0],pos[1]];
			while(path[i][0] != this.x || path[i][1] != this.y) {
				path[i+1] = previous[path[i][0]][path[i][1]];
				i++;
			}
			i--;
			this.x = path[i][0];
			this.y = path[i][1];
		}

		if(this.x == dog.x && this.y == dog.y) {
			over = true;
			gameOver();
		}
		
		if(world[this.x+1][this.y] != empty && world[this.x-1][this.y] != empty && world[this.x][this.y+1] != empty && world[this.x][this.y-1] != empty && 
			world[this.x+1][this.y+1] != empty && world[this.x+1][this.y-1] != empty && world[this.x-1][this.y+1] != empty && world[this.x-1][this.y-1] != empty) {
				this.mov = false;
				checkCrabsStuck();
		}
		else
			this.mov = true;

		if(!over) {
			this.show();
		}
	}
});

var Block = extend(Actor, {
});

var Bowl = extend(Actor, {
});


//EVENT HANDLING

//changed this
function animationEvent() {
	if(!paused) {
		time++;
		for(i in crabs)
			crabs[i].animation();
	}
}

//changed this
function setSpeed(speed) {
	if(!paused) {
		if((speed < MIN_SPEED) || (MAX_SPEED < speed))
			speed = MIN_SPEED;
		window.setInterval(animationEvent, (MAX_SPEED + 1) * 100 - speed * 100);
	}
}

//changed this
function keyEvent(k) {
	// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
	if(!paused) {
		var code = k.keyCode;
		switch(code) {
			case 37: case 79: case 74: dog.move(-1, 0); break; //  LEFT, O, J
			case 38: case 81: case 73: dog.move(0, -1); break; //    UP, Q, I
			case 39: case 80: case 76: dog.move(1, 0);  break; // RIGHT, P, L
			case 40: case 65: case 75: dog.move(0, 1);  break; //  DOWN, A, K
//			default: dog.key(code); break;
		}
	}
}

//changed this
function setEvents() {
	if(!paused) {
		setSpeed(DEFL_SPEED);
		addEventListener("keydown", keyEvent, false);
	}
}

//added this
function gameOver() {
	mesg("Game Over");
	defeats++;
	restart();
}

//added this
function checkCrabsStuck(){
	var counter = 0;
	var i = 0;
	while(i < N_CRABS) {
		if(crabs[i++].stuck()) {
			counter++;
		}
	}
	if(counter == N_CRABS) {
		mesg("Victory!");
		victories++;
		restart();
	}
	return counter;
}

//changed this
function restartGame() {
    var canvas = document.getElementById("canvas1");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time = 0;
	paused = false;
    createWorld();
}


//INITIALIZATIONS

function createEmptyWorld() {
	var w = new Array(WORLD_WIDTH);
	for(var x = 0; x < WORLD_WIDTH; x++) {
		var a = new Array(WORLD_HEIGHT);
		for(var y = 0; y < WORLD_HEIGHT; y++)
			a[y] = empty;
		w[x] = a;
	}
	return w;
}

//changed this
function createBlocks() {
	//blocks horizontal
	var i;
	for(i = 0; i < WORLD_WIDTH; i++) {
		create(Block, i, 0);
		create(Block, i, WORLD_HEIGHT-1);
	}
	//blocks vertical
	for(i = 0; i < WORLD_HEIGHT; i++) {
		create(Block, 0 , i);
		create(Block, WORLD_WIDTH-1, i);
	}
}

//changed this
function createDog() {
	x = 1 + rand(29);
	y = 1 + rand(16);
	dog = create(Dog, x, y);
}

//changed this
function createCrabs() {
	crabs = [];
	var j, x, y;
	j = 0;
	while(j < N_CRABS) {
		x = 1 + rand(29);
		y = 1 + rand(16);
		if(distance(dog.x, dog.y, x ,y) >= 5 && world[x][y] == empty) {
			crabs[j] = create(Crab, x, y);
			j++;
		}
	}
}

//changed this
function createBowls() {
	var j, x, y, bool;
	j = 0;
	while(j < N_BOWLS) {
		x = 1 + rand(29);
		y = 1 + rand(16);
		if(world[x][y] == empty) {
			create(Bowl, x, y);
		}
		else {
			bool = true;
			while(bool) {
				if(x > WORLD_WIDTH-2)
					x = 1;
				if(auxCreateBowls(x++, y))
					bool = false;
			}
		}
		j++;
	}
}

//added this
function auxCreateBowls(w, h) {
	var y = h;
	var bool = true;
	while(bool) {
		y++;
		if(y > WORLD_HEIGHT-2)
			y = 1;
		if(world[w][y] == empty) {
			create(Bowl, w, y);
			bool = false;
			return true;
		}
	}
	return false;
}

function createWorld() {
	world = createEmptyWorld();
	createBlocks();
	createDog();
	createCrabs();
	createBowls();
}

function loadImage(name) {
	var image = new Image();
	image.src = name;
	image.onload = function() {
		loaded++;
		if(loaded == N_IMAGES) { //wait for images loaded
			createWorld();
			setEvents();
		}
	};
	return image;
}

function loadImages() {
	loaded = 0;
	Dog.image = loadImage(DOG_IMAGE_NAME);
	Crab.image = loadImage(CRAB_IMAGE_NAME);
	Block.image = loadImage(BLOCK_IMAGE_NAME);
	Bowl.image = loadImage(BOWL_IMAGE_NAME);
	Empty.image = loadImage(EMPTY_IMAGE_NAME);
}

//changed this
function initializeAll() {
	ctx = document.getElementById("canvas1").getContext("2d");
	empty = create(Empty); //only one empty actor needed
	time = 0;
	victories = 0;
	defeats = 0;
	paused = false;
	loadImages();
}


//HTML and FORM

function onLoad() {
	initializeAll();
}
function restart() {
	restartGame();
}
function stats() {
	mesg("Tempo decorrido: " + time + " segundos.\n" + 
	"Numero de caranguejos bloqueados: " + checkCrabsStuck() + ".\n" + 
	"Numero de vitorias: " + victories + ".\n" + 
	"Numero de derrotas: " + defeats + ".");
}
function play() {
	paused = false;
}
function pause() {
	paused = true;
}
function resetStats() {
	victories = 0;
	defeats = 0;
}

function playAudio() {
	if(audioControl) {
		audioMusic.load();
		audioMusic.play();
		audioControl = false;
	}
	else {
	audioMusic.pause();
	audioControl = true;
	}
}
