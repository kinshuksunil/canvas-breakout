Array.prototype.add = function( name, val ){
	this.push( val );
	return this[name] = this[ this.length - 1 ];
}

var breakout = (function(){
	var _cWidth = 0;
	var _cHeight = 0;
	var _score = null;
	var _bricks = null;
	var _paddle = null;
	var _ball = null;
	var opt = {};
	
	function loadImage(img) {
		tmp = new Image(); tmp.src=img; return tmp;
	}
	
	function createLayers(){
		var container = $(opt.container);

		// Create a wrapper DIV
		var wrapper = $("<div>")
			.attr("class", "breakout")
			.css({ "width": opt.width + 2 + "px", "height": opt.height + 2 + "px", "overflow": "hidden" })
			.appendTo( container );
	
		// Creating Background layer
		opt.background.el = $("<canvas>")
			.attr("id", "boBackground")
			.attr("width", opt.width)
			.attr("height", opt.height)
			.appendTo( wrapper );
		opt.background.ctx = opt.background.el[0].getContext("2d");
		
		// Creating Score layer
		opt.score.el = $("<canvas>")
			.attr("id", "boScore")
			.attr("width", opt.width)
			.attr("height", opt.score.height)
			.css("top", opt.height - opt.score.height + "px")
			.appendTo( wrapper );
		opt.score.ctx = opt.score.el[0].getContext("2d");
		
		// Creating Bricks layer
		opt.bricks.el = $("<canvas>")
			.attr("id", "boBricks")
			.attr("width", opt.width)
			.attr("height", opt.height)
			.appendTo( wrapper );
		opt.bricks.ctx = opt.bricks.el[0].getContext("2d");
		
		// Creating Paddle layer
		opt.paddle.el = $("<canvas>")
			.attr("id", "boPaddle")
			.attr("width", opt.width)
			.attr("height", opt.paddle.height)
			.css("top", opt.height - opt.score.height - opt.paddle.height + "px")
			.appendTo( wrapper );
		opt.paddle.ctx = opt.paddle.el[0].getContext("2d");
		
		// Creating Ball layer
		opt.ball.el = $("<canvas>")
			.attr("id", "boBall")
			.attr("width", opt.width)
			.attr("height", opt.height - opt.score.height)
			.appendTo( wrapper );
		opt.ball.ctx = opt.ball.el[0].getContext("2d");
		
		// Calculate Brick width and height
		opt.bricks.width  = Math.floor(opt.width / opt.bricks.cols);
		opt.bricks.height = Math.floor(opt.bricks.width / 2);
		
		if ( opt.bricks.height * opt.bricks.rows > opt.height / 2 ){
			opt.bricks.height = Math.floor(opt.height / (2 * opt.bricks.rows) );
		}
		
		
		// Create convenience variables
		_cWidth 	= opt.width;
		_cHeight 	= opt.height;
		_score 		= opt.score;
		_bricks 	= opt.bricks;
		_paddle 	= opt.paddle;
		_ball 		= opt.ball;
		
	}

	return {
		ballIntervalObj: null,
		mouseInCanvas: false,
		init: function( options ){
			opt = $.extend({
				container: "#breakout",
				width: 400,
				height: 400,
				background: {},
				score: {
					lives: 5,
					height: 20,
					fillStyle: "#0f0"
				},
				bricks: {
					rows: 5,
					cols: 10,
					tilemap: [
						[ 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
						[ 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
						[ 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
						[ 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
						[ 2, 0, 1, 0, 2, 0, 1, 0, 2, 0]
					],
					tilestyle: [
						loadImage("images/oldbrick.png"),
						loadImage("images/brick.png"),
						"#00f"
					]
				},
				paddle: {
					width: 100,
					height: 10,
					fillStyle: "#777"
				},
				ball: {
					radius: 6,
					speed: {x: 1, y: -1},
					fillstyle: "images/ball.png"
				}
			}, options);
			
			createLayers();
			
			this.initScore();
			this.initBricks();
			this.initPaddle();
			this.initBall();
			this.bindEvents();
			
			var me = this;
			this.ballIntervalObj = setInterval( function(){
				me.moveBall.call(me)
			}, 1 );
		},
		clear: function(ctx){
			ctx.clearRect(0, 0, _cWidth, _cHeight);
		},
		initScore: function(){
			var x = 0;
			var y = 0;
			var w = _cWidth;
			var h = _score.height;

			_score.ctx.beginPath();
			_score.ctx.fillStyle = _score.fillStyle;
				_score.ctx.fillRect( x, y, w, h );
			_score.ctx.closePath();
			
			_score.pos = { x: x, y: y };
			_score.width = w;
			_score.height = h;
		},
		updateScore: function(){
		},
		initBricks: function(){
			var width  = _bricks.width  = Math.floor(opt.width / _bricks.cols);
			var height = _bricks.height = Math.floor(width / 2);
		
			tilemap = _bricks.tilemap;
			_bricks.tilecount = 0;
			
			this.clear(_bricks.ctx);
			_bricks.ctx.beginPath();
			for ( var x = 0; x < _bricks.rows; x++ ){
				if ( typeof(tilemap[x]) == "undefined" ) continue;
				for ( var y = 0; y < _bricks.cols; y++ ){
					if ( typeof(tilemap[x][y]) == "undefined" ) continue;
					if ( tilemap[x][y] >= 1 ){
						var fillstyle = _bricks.tilestyle[ tilemap[x][y] - 1 ];
						if ( /^#([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/.test(fillstyle) ){ // Its a color code
							_bricks.ctx.fillStyle = fillstyle;
							_bricks.ctx.fillRect( y * width, x * height, width - 1, height - 1);
						} else { // Its a file path. ASSUME. Have to put a regex for filenames.
							var _imgBrick = new Image();
							_imgBrick.src = fillstyle;
							//console.info(fillstyle);
							_bricks.ctx.drawImage(fillstyle, y * width, x * height, width - 1, height - 1); // drawing brick from image
						}
						_bricks.tilecount++;
					}
				}
			}
			_bricks.ctx.closePath();
		},
		initPaddle: function(){
			var w = _paddle.width;
			var h = _paddle.height;
			var y = 0;
			var x = (_cWidth - w)/2;
			_paddle.pos = { x: x, y: y };
			this.drawPaddle();
		},
		drawPaddle: function(){
			_paddle.ctx.fillStyle = _paddle.fillStyle;
			
			_paddle.ctx.beginPath();
				_paddle.ctx.rect(_paddle.pos.x, _paddle.pos.y, _paddle.width, _paddle.height);
			_paddle.ctx.closePath();
			
			this.clear(_paddle.ctx);
			_paddle.ctx.fill();
		},
		initBall: function(){
			var x = Math.floor(_cWidth / 2) - _ball.radius;
			var y = _ball.el.height() - _paddle.height - (_ball.radius * 2);
			var w = _ball.radius * 2;
			var h = w;
			_ball.pos = { x: x, y: y };
			_ball.width = w;
			_ball.height = h;
			this.drawBall();
		},
		drawBall: function(){
			var x = _ball.pos.x + _ball.radius;
			var y = _ball.pos.y + _ball.radius;
			var r = _ball.radius;
			var w = h = r * 2;
			var fillstyle = _ball.fillstyle;
			
			this.clear(_ball.ctx);
			_ball.ctx.beginPath();
				if ( /^#([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/.test(fillstyle) ){ // Its a color code
					_ball.ctx.fillStyle = fillstyle;
					_ball.ctx.arc(x, y, r, 0, Math.PI*2, true);
				} else { // Its a file path. ASSUME. Have to put a regex for filenames.
					var _imgBall = new Image();
					_imgBall.src = fillstyle;
					_ball.ctx.drawImage(_imgBall, x - r, y - r, w, h); // drawing brick from image
				}
			_ball.ctx.closePath();
			
			_ball.ctx.fill();
		},
		moveBall: function(){
			// Calculating the next frame coordinates according to current speed
			var x = _ball.pos.x + _ball.speed.x;
			var y = _ball.pos.y + _ball.speed.y;
			
			// Saving the current values for readability
			var r = _ball.radius;
			var w = _ball.width;
			var h = _ball.height;
			var speedX = _ball.speed.x;
			var speedY = _ball.speed.y;
			
			// Detecting possibility of collision with walls and paddle in the next frame, and updating the local speed variable
			if ( x <= 0 || x + w >= _cWidth ){
				speedX *= -1;
			} // Left, Right walls
			if ( y <= 0 ){ speedY *= -1; } // Top Wall
			if ( y + h >= _ball.el.height() - _paddle.height){ // Paddle
				if ( x + r > _paddle.pos.x && x + r < _paddle.pos.x + _paddle.width ){ // Ball falls on paddle
					speedX = 3*((x - (_paddle.pos.x + _paddle.width/2))/_paddle.width);
					speedY *= -1;
				} else if ( y + h >= _ball.el.height()){ // Ball falls on floor
					this.die();
				}
			}
			
			// Calculating the row,col for the next frame (TOP LEFT)
			var row_tl = Math.ceil( y / _bricks.height );
			var col_tl = Math.ceil( x / _bricks.width );
			
			// Calculating the row,col for the next frame (CENTER)
			var row_c = Math.ceil( (y + r) / _bricks.height );
			var col_c = Math.ceil( (x + r) / _bricks.width );
			
			// Calculating the row,col for the next frame (BOTTOM RIGHT)
			var row_br = Math.ceil( (y + h) / _bricks.height );
			var col_br = Math.ceil( (x + w) / _bricks.width );
			
			// Placeholder variables to capture the brick row
			var row = null;
			var col = null;
			
			// Detecting possibility of collision with bricks in the next frame
			if ( row_tl != row_c ){ // Detecting vertical collision
				row = row_tl;
			} else if ( row_br != row_c ){
				row = row_br;
			}
			if ( row && row-1 < _bricks.rows && col_c-1 < _bricks.cols && _bricks.tilemap[row-1][col_c-1] >= 1 ){
				row -= 1;
				col_c -= 1;
				speedY *= -1;
				_bricks.tilemap[row][col_c] = 0; // Updating tilemap
				_bricks.tilecount--;
				//console.log( _bricks.tilecount );
				_bricks.ctx.clearRect( col_c * _bricks.width, row * _bricks.height, _bricks.width - 1, _bricks.height - 1); // Removing the brick
			}
			
			if ( col_tl != col_c ){ // Detecting horizontal collision
				col = col_tl;
			} else if ( col_br != col_c ){
				col = col_br;
			}
			if ( col && row_c-1 < _bricks.rows && col-1 < _bricks.cols && _bricks.tilemap[row_c-1][col-1] >= 1 ){
				row_c -= 1;
				col -= 1;
				speedX *= -1;
				_bricks.tilemap[row_c][col] = 0; // Updating tilemap
				_bricks.tilecount--;
				//console.log( _bricks.tilecount );
				_bricks.ctx.clearRect( col * _bricks.width, row_c * _bricks.height, _bricks.width - 1, _bricks.height - 1); // Removing the brick
			}
			
			// Updating the current position with the current speed
			_ball.pos.x += speedX;
			_ball.pos.y += speedY;

			// Updating the global speed variable with the new value
			_ball.speed.x = speedX;
			_ball.speed.y = speedY;
			
			// Drawing next frame
			this.drawBall();
			
			if (!_bricks.tilecount) { this.levelUp(); }
		},
		bindEvents: function(){
			var me = this;
			$(_ball.el).bind("mousemove", function(evt){
				if ( evt.layerX >= Math.floor(_paddle.width/2) && evt.layerX <= _cWidth - Math.floor(_paddle.width/2) ){
					_paddle.pos.x = evt.layerX - Math.floor(_paddle.width/2);
				} else if ( evt.layerX < Math.floor(_paddle.width/2) ){
					_paddle.pos.x = 0;
				} else if ( evt.layerX > _cWidth - Math.floor(_paddle.width/2) ){
					_paddle.pos.x = _cWidth - _paddle.width;
				}
				me.drawPaddle();
			});
		},
		levelUp: function(){
			clearInterval( this.ballIntervalObj );
			$(_ball.el).unbind("mousemove");
			alert("You have reached next level!!!");
			return false;
		},
		die: function(){
			clearInterval( this.ballIntervalObj );
			$(_ball.el).unbind("mousemove");
			return false;
		},
		endGame: function(){
		}
	}
})();

window.onload = function(){
	breakout.init({
		container: "#breakout"
	});
};

	