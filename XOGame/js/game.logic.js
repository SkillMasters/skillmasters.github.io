// GAME MANAGER
GameManager.prototype.Init = function(width, height) {
	let table = $('<table>').attr({id:'field', rules:'all'}).appendTo($('.game'));
	this.field = new Field(this, table, width, height);
	this.field.Clear();

	// $('<>')

	this.StartGame();
}

GameManager.prototype.StartGame = function() {
	this.freeze = false;
	this.result = GameResult.NONE;
	this.turn = getRandomInt(0, this.players.length);
	this.players[this.turn].DoTurn();
}

GameManager.prototype.StopGame = function() {
	this.freeze = true;
	this.result = GameResult.NONE;
	this.turn = -1;
	this.field = null;
	$('table').remove();
}

GameManager.prototype.SetMode = function(width, height, inrow) {
	if(width <= 1 || width > 64) width = 3;
	if(height <= 1 || height > 64) height = 3;
	if(inrow <= 1 || inrow > 64) inrow = 3;
	this.MAXINROW = inrow;
	this.StopGame();
	this.Init(width, height);
}

GameManager.prototype.Restart = function() {
	this.field.Clear();
	this.StartGame();
}

GameManager.prototype.ShowGameResult = function() {
	if(this.result == GameResult.NONE) return;

	let result = this.result;
	this.result = GameResult.NONE;
	let that = this;
	let res = $('<div>').attr('id', 'result').click(function() {
				$('#result').remove();
				that.Restart();
			});

	switch(result) {
		case GameResult.DRAW:
			res.append($('<img>').attr('src', 'img/cross.svg'));
			res.append($('<img>').attr('src', 'img/circle.svg'));
			res.append($('<h2>DRAW!</h2>').addClass('style1'));
		break;

		case GameResult.CROSS:
			res.append($('<img>').attr('src', 'img/cross.svg'));
			res.append($('<h2>WIN!</h2>').addClass('style2'));
		break;

		case GameResult.CIRCLE:
			res.append($('<img>').attr('src', 'img/circle.svg'));
			res.append($('<h2>WIN!</h2>').addClass('style3'));
		break;
	}
	res.appendTo($('.game'));
	res.fadeIn('slow');
}

GameManager.prototype.GameOver = function(result) {
	this.freeze = true;
	this.result = result[0];
	switch(this.result) {
		case GameResult.DRAW:
			$('#field').fadeOut('slow', this.ShowGameResult.bind(this));
		break;

		case GameResult.CROSS:
			for(el of result[1]) {
				el.cell.children('img.cross').center(this, $('#field'));
			}
		break;

		case GameResult.CIRCLE:
			for(el of result[1]) {
				el.cell.children('img.circle').center(this, $('#field'));
			}
		break;
	}
}

GameManager.prototype.Pause = function() {
	this.freeze = !this.freeze;
}

GameManager.prototype.AddPlayer = function(marker, mode) {
	this.players.push(new Player(this, marker, mode));
}

GameManager.prototype.GetCurrentTurn = function() {
	return new Turn(this);
}

GameManager.prototype.CheckWinner = function() {
	let cur, count, winners = [];

	// ROWS
	for(let i = 0; i < this.field.height; ++i) {
		cur = -1;
		for(let j = 0; j < this.field.width; ++j) {
			if(this.field._map[i][j].state == cur) {
				winners.push(this.field._map[i][j]);
				count++;
			}
			else if(j + this.MAXINROW - 1 < this.field.width) {
				winners = [this.field._map[i][j]];
				cur = this.field._map[i][j].state;
				count = 1;
			}
			else break;
			if(cur != CellState.EMPTY && count >= this.MAXINROW)
				return [cur, winners];
		}
	}

	// COLS
	for(let j = 0; j < this.field.width; ++j) {
		cur = -1;
		for(let i = 0; i < this.field.height; ++i) {
			if(this.field._map[i][j].state == cur) {
				winners.push(this.field._map[i][j]);
				count++;
			}
			else if(i + this.MAXINROW - 1 < this.field.height) {
				winners = [this.field._map[i][j]];
				cur = this.field._map[i][j].state;
				count = 1;
			}
			else break;
			if(cur != CellState.EMPTY && count >= this.MAXINROW)
				return [cur, winners];
		}
	}

	// DIA1
	for(let i = 0; i < this.field.height; ++i) {
		if(i + this.MAXINROW > this.field.height) break;

		for(let j = 0; j < this.field.width; ++j) {
			if(j + this.MAXINROW > this.field.width) break;
			cur = this.field._map[i][j].state;
			if(cur == CellState.EMPTY) continue;

			winners = [this.field._map[i][j]];
			count = 1;
			if(cur != CellState.EMPTY) {
				for(let k = 1; k < this.MAXINROW; ++k) {
					if(this.field._map[i + k][j + k].state == cur) {
						winners.push(this.field._map[i + k][j + k]);
						count++;
					}
					else break;
				}
			}
			if(count >= this.MAXINROW)
				return [cur, winners];
		}
	}

	// DIA2
	for(let i = 0; i < this.field.height; ++i) {
		if(i + this.MAXINROW > this.field.height) break;

		for(let j = this.field.width - 1; j >= 0; --j) {
			if(j - this.MAXINROW < -1) break;

			cur = this.field._map[i][j].state;
			if(cur == CellState.EMPTY) continue;

			winners = [this.field._map[i][j]];
			count = 1;
			if(cur != CellState.EMPTY) {
				for(let k = 1; k < this.MAXINROW; ++k) {
					if(this.field._map[i + k][j - k].state == cur) {
						winners.push(this.field._map[i + k][j - k]);
						count++;
					}
					else break;
				}
			}
			if(count >= this.MAXINROW)
				return [cur, winners];
		}
	}

	// DRAW
	let free = this.field.height * this.field.width;
	for(let i = 0; i < this.field.height; ++i)
		for(let j = 0; j < this.field.width; ++j)
			if(this.field._map[i][j].state != CellState.EMPTY)
				free--;

	if(free <= 0)
		return [GameResult.DRAW, null];
	return [GameResult.NONE, null];
}

// PLAYER
Player.prototype.DoTurn = function() {
	switch(this.AI) {
		case ActorType.EASY:
			setTimeout(this.EASYTurn.bind(this, this._gm.field), 100 * getRandomInt(10, 20));
		break;
	}
}

Player.prototype.EASYTurn = function(field) {
	if(field.gm.freeze) return;

	let free = [];
	for(let i = 0; i < field.height; ++i) {
		for(let j = 0; j < field.width; ++j) {
			if(field._map[i][j].state == CellState.EMPTY)
				free.push(field._map[i][j]);
		}
	}
	free[getRandomInt(0, free.length)].Use();
}

Player.prototype.NORMALTurn = function(field) {
	if(field.gm.freeze) return;

	let free = [];
	for(let i = 0; i < field.height; ++i) {
		for(let j = 0; j < field.width; ++j) {
			if(field._map[i][j].state == CellState.EMPTY)
				free.push(field._map[i][j]);
		}
	}

	
	
	free[getRandomInt(0, free.length)].Use();
}

// TURN
Turn.prototype.Make = function() {
	let gameresult = this.gm.CheckWinner();
	if(gameresult[0] > GameResult.NONE) {
		this.gm.GameOver(gameresult);
	}
	else {
		this.gm.turn = (this.gm.turn + 1) % this.gm.players.length;
		this.gm.players[this.gm.turn].DoTurn();
	}
}

Turn.prototype.isPlayer = function() {
	return (this._player.AI === ActorType.PLAYER);
}

// FIELD
Field.prototype.Clear = function() {
	for(let i = 0; i < this.height; ++i)
		for(let j = 0; j < this.width; ++j)
			this._map[i][j].Clear();
	$('#field').fadeIn('fast');
}

Field.prototype.Draw = function() {
	for(cell of this._map)
		cell.Draw();
}

// CELLS
Cell.prototype.Draw = function() {
	switch(this.state) {
		case CellState.EMPTY:  this.cell.children('img').hide(); break;
		case CellState.CROSS:  this.cell.find('.cross').fadeIn(300); break;
		case CellState.CIRCLE: this.cell.find('.circle').fadeIn(300); break;
	}
}

Cell.prototype.Clear = function() {
	this.state = CellState.EMPTY;
	this.cell.find('img').removeAttr('style');
	this.cell.css('width', (this.width) + '%');
	this.Draw();
}

Cell.prototype.Use = function(event) {
	let AI_Turn = (event == undefined);

	if(this.state != CellState.EMPTY || this.field.gm.freeze) return;

	let turn = this.field.gm.GetCurrentTurn();
	if(turn.isPlayer() || AI_Turn) {
		this.state = turn.turnMark;
		this.Draw();
		turn.Make();
	}
}