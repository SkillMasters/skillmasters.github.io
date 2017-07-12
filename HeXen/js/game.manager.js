/*
 Game Manager
 */

function GameManager() {
	/* BAD CODER */
	BaseModel.prototype.gm = this;

	this.render = null;
	this.mouse = null;
	this.event = null;
	this.animator = null;
	this.grid = null;

	this.freeze = true;
	this.gameState = GameState.PAUSE;
	this.result = GameResult.NONE;
	this.score = 0;
	this.currentLevel = 0;

	this.objects = [];
	this.players = [];
	this.GUIElements = [];

	that = this;
	$(document).ready(function () {
		that.Init()
	});
}

GameManager.prototype.Init = function () {
	this.event = new EventSystem();
	this.render = new Render(this);
	this.grid = new Grid(this, 64, 64, 11, 40);
	this.mouse = new Mouse(this);
	this.animator = new Animator();
	this.StartGame();
};

GameManager.prototype.StartGame = function () {
	this.freeze = false;
	this.gameState = GameState.TURN;
	this.NextLevel();
	this.grid.Draw();
	
	requestAnimationFrame(this.RenderEvent.bind(this));
};

GameManager.prototype.StopGame = function () {
	this.freeze = true;
};

GameManager.prototype.Restart = function () {
	this.StopGame();
	this.grid.Clear();
	this.StartGame();
};

GameManager.prototype.Pause = function () {
	this.freeze = true;
};

GameManager.prototype.AddScore = function (score) {
	this.score += score;
};

GameManager.prototype.NextLevel = function () {
	this.grid.LoadLevel(GameLevels[this.currentLevel]);
	this.currentLevel++;
};

GameManager.prototype.CreateObject = function (object, cell, args) {
	let obj = cell.AddObject(function () {
		return new object(cell, ...args)
	});
	if (obj !== undefined)
		this.objects.push(obj);
};

GameManager.prototype.ClearObjects = function () {
	this.objects = [];
	this.players = [];
};

GameManager.prototype.RenderEvent = function () {
	let delta = this.render.deltaTime();

	this.animator.ProcessMotions(delta);

	this.render.Clear();
	for (let i = 0; i < this.objects.length; ++i) {
		this.objects[i].Draw();
	}

	// this.render.ClearBack();
	// this.grid.Draw();

	requestAnimationFrame(this.RenderEvent.bind(this));
};

GameManager.prototype.ResizeEvent = function () {
	this.render.ResizeCanvas();
	this.grid.Draw();
}

GameManager.prototype.MouseEvent = function (event) {
	if (this.grid.bounds.isInArea(this.mouse.posX, this.mouse.posY))
		this.grid.Select(this.mouse.posX, this.mouse.posY);
	else
		this.SelectGUI(event);
};

GameManager.prototype.SelectGUI = function (event) {
	//otototototototototototototo
};

GameManager.prototype.AddPlayer = function (player) {
	this.players.push(player);
};


GameManager.prototype.GridClicked = function (pos) {
	let player, cell = this.grid.map[pos.y][pos.x];
	switch(this.gameState) {
		case GameState.TURN:
			for(let i = 0; i < this.players.length; ++i) {
				player = this.grid.PixelToHex(this.players[i].cell.center.x, this.players[i].cell.center.y);//this.players[i].cell.gridPosition;

				if(cell.isNearbyXY(player, pos)) {
					this.players[i].MoveTo(cell);
					break;
				}
			}
			break;
	}
};

GameManager.prototype.GameOver = dummyFunc;
GameManager.prototype.ShowGameResult = dummyFunc;
GameManager.prototype.SetMode = dummyFunc;
GameManager.prototype.CheckObjects = dummyFunc;