
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

	return {
		layers: [],
		ballIntervalObj: null,
		mouseInCanvas: false,
		init: function(){
			this.layers.add( "score", {
				el: $("#c_score")[0],
				ctx: $("#c_score")[0].getContext("2d"),
				lives: 5,
				height: 20,
				fillStyle: "#0f0"
			});
			this.layers.add( "bricks", {
				el: $("#c_bricks")[0],
				ctx: $("#c_bricks")[0].getContext("2d"),
				rows: 5,
				cols: 5,
				height: 30,
				fillStyle: "#88f"
			});
			this.layers.add( "paddle", {
				el: $("#c_paddle")[0],
				ctx: $("#c_paddle")[0].getContext("2d"),
				width: 100,
				height: 10,
				fillStyle: "#777"
			});
			this.layers.add( "ball", {
				el: $("#c_ball")[0],
				ctx: $("#c_ball")[0].getContext("2d"),
				radius: 6,
				speed: {x: 1, y: -1},
				fillStyle: "#aaa"
			});
			
			_cWidth  = $("#c_bricks").width();
			_cHeight = $("#c_bricks").height();
			
			_score   = this.layers["score"];
			_bricks  = this.layers["bricks"];
			_paddle  = this.layers["paddle"];
			_ball 	 = this.layers["ball"];
			
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
			var y = _cHeight - _score.height;
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
			var w = _bricks.width = Math.floor(_cWidth / _bricks.cols);
			var h = _bricks.height = ( _bricks.height * _bricks.rows > Math.floor(_cHeight / 2) ) ? 
							Math.floor(_cHeight / (2 * _bricks.rows)) : 
							_bricks.height;
			_bricks.tilemap = new Array(_bricks.rows);
			for ( var x = 0; x < _bricks.rows; x++ ){
				_bricks.tilemap[x] = new Array(_bricks.cols);
				for ( var y = 0; y < _bricks.cols; y++ ){
					_bricks.tilemap[x][y] = 1;
				}
			}
			this.drawBricks();
		},
		drawBricks: function(tilemap){
			tilemap = tilemap || _bricks.tilemap;
			
			this.clear(_bricks.ctx);
			_bricks.ctx.beginPath();
			_bricks.ctx.fillStyle = _bricks.fillStyle;
			for ( var x = 0; x < tilemap.length; x++ ){
				for ( var y = 0; y < tilemap[x].length; y++ ){
					if ( tilemap[x][y] == 1 ){
						_bricks.ctx.rect( y * _bricks.width, x * _bricks.height, _bricks.width - 1, _bricks.height - 1);
					}
				}
			}
			_bricks.ctx.closePath();
			_bricks.ctx.fill();
		},
		initPaddle: function(){
			var w = _paddle.width;
			var h = _paddle.height;
			var y = (_cHeight - _score.height) - h;
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
			var y = _paddle.pos.y - (_ball.radius * 2) - 1;
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
			_ball.ctx.fillStyle = _ball.fillStyle;
			
			_ball.ctx.beginPath();
				_ball.ctx.arc(x, y, r, 0, Math.PI*2, true);
			_ball.ctx.closePath();
			
			this.clear(_ball.ctx);
			_ball.ctx.fill();
		},
		moveBall: function(){
			if ( _ball.pos.x <= 0 || _ball.pos.x + _ball.width >= _cWidth ){ _ball.speed.x = -_ball.speed.x; }
			if ( _ball.pos.y <= 0 ){ _ball.speed.y = -_ball.speed.y; }
			if ( _ball.pos.y + _ball.height >= _paddle.pos.y){
				if ( _ball.pos.x + _ball.radius > _paddle.pos.x && _ball.pos.x + _ball.radius < _paddle.pos.x + _paddle.width ){
					_ball.speed.y = -_ball.speed.y;
				} else if ( _ball.pos.y + _ball.height >= _score.pos.y){
					this.die();
				}
			}
			
			var ballRow = Math.floor( _ball.pos.y / _bricks.height );
			var ballCol = Math.floor( _ball.pos.x / _bricks.width );
			if ( ballRow < _bricks.rows && ballCol < _bricks.cols && _bricks.tilemap[ballRow][ballCol] == 1 ){
				_bricks.tilemap[ballRow][ballCol] = 0;
				_bricks.ctx.clearRect( ballCol * _bricks.width, ballRow * _bricks.height, _bricks.width - 1, _bricks.height - 1);
				_ball.speed.y = -_ball.speed.y;
			}
			
			_ball.pos.x += _ball.speed.x;
			_ball.pos.y += _ball.speed.y;
			
			this.drawBall();
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
	breakout.init();
};

	