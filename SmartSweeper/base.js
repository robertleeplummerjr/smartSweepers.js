var SmartSweeper = (function() {
	"use strict";

	//params
	var Params = {
			pi: Math.PI,
			halfPi: Math.PI/2,
			twoPi: Math.PI * 2,
			windowWidth: 400,
			windowHeight: 400,
			framesPerSecond: 0,
			numInputs: 0,
			numHidden: 0,
			neuronsPerHiddenLayer: 0,
			numOutputs: 0,
			activationResponse: 0,
			bias: 0,
			maxTurnRate: 0,
			maxSpeed: 0,
			sweeperScale: 0,
			numSweepers: 0,
			numMines: 0,
			numTicks: 0,
			mineScale: 0,
			crossoverRate: 0,
			mutationRate: 0,
			maxPerturbation: 0,
			numElite: 0,
			numCopiesElite: 0
		},

		UserParams = {
			framesPerSecond: 60,
			numInputs: 4,
			numHidden: 1 ,
			neuronsPerHiddenLayer: 6,
			numOutputs: 2,
			activationResponse: 1,
			bias: -1,
			maxTurnRate: 0.3,
			maxSpeed: 2,
			sweeperScale: 5,
			numMines: 40,
			numSweepers: 30,
			numTicks: 2000,
			mineScale: 2,
			crossoverRate: 0.7,
			mutationRate: 0.1,
			maxPerturbation: 0.3,
			numElite: 4,
			numCopiesElite: 1
		};

	for (var key in UserParams) if (UserParams.hasOwnProperty(key)) {
		if (Params[key] !== undefined) {
			Params[key] = UserParams[key];
		}
	}

	function SmartSweeper() {
		this.brain = new Brain.NeuralNet(Params);
		this.position = new SmartSweeper.Vector2d(Math.random() * Params.windowWidth, Math.random() * Params.windowHeight);
		this.direction = new SmartSweeper.Vector2d();
		this.rotation = Math.random() * Params.twoPi;
		this.speed;
		this.lTrack = 0.16;
		this.rTrack = 0.16;
		this.fitness = 0;
		this.scale = Params.sweeperScale;
		this.iClosestMine = 0;
	}

	// Update SmartSweeper position using neural network
	SmartSweeper.prototype = {
		update: function (mines) {
			var inputs = [];
			this.closestMine = this.getClosestMine(mines);
			SmartSweeper.Vector2dNormalize(this.closestMine);

			inputs.push(this.closestMine.x);
			inputs.push(this.closestMine.y);
			inputs.push(this.direction.x);
			inputs.push(this.direction.y);

			var output = this.brain.update(inputs);

			// If num outputs are not correct, exit
			if (output.length < Params.numOutputs) {
				return false;
			}

			this.lTrack = output[0];
			this.rTrack = output[1];

			// Clamp the rot force between -0.3 and 0.3
			var rotForce = this.lTrack - this.rTrack;
			var min = -1 * Params.maxTurnRate;
			var max = Params.maxTurnRate;
			if (rotForce < min) {
				rotForce = min;
			}

			if (rotForce > max) {
				rotForce = max;
			}

			// Rotate sweeper
			this.rotation += rotForce;

			this.speed = (this.lTrack + this.rTrack);

			this.direction.x = -1 * Math.sin(this.rotation);
			this.direction.y = Math.cos(this.rotation);

			this.position.x += this.speed * this.direction.x;
			this.position.y += this.speed * this.direction.y;

			// Make sure position is not out of the window
			if (this.position.x > Params.windowWidth) {
				this.position.x = 0;
			}

			if (this.position.x < 0) {
				this.position.x = Params.windowWidth;
			}

			if (this.position.y > Params.windowHeight) {
				this.position.y = 0;
			}

			if (this.position.y < 0) {
				this.position.y = Params.windowHeight;
			}

			return true;
		},

		// Where does vector Spoints come from?
		worldTransform: function (sweeperVerts) {
			var mat = new SmartSweeper.Matrix2d();
			mat.scale(this.scale, this.scale);
			mat.rotate(this.rotation);
			mat.translate(this.position.x, this.position.y);
			mat.transformPoints(sweeperVerts);
		},


		getClosestMine: function (mines) {
			var closestMineDist = 99999;
			var closestMine = SmartSweeper.Vector2d(0, 0);
			for (var i = 0; i < mines.length; i++) {
				var distToMine = SmartSweeper.Vector2dLength(SmartSweeper.Vector2dSub(mines[i], this.position));
				if (distToMine < closestMineDist) {
					closestMineDist = distToMine;
					closestMine = SmartSweeper.Vector2dSub(this.position, mines[i]);
					this.iClosestMine = i;
				}
			}
			return closestMine;
		},

		// Check for closeset mine. Return -1 if none are close enough
		// What is the 5 for? Also what is size?
		checkForMine: function (mines, size) {
			var distToMine = SmartSweeper.Vector2dSub(this.position, mines[this.iClosestMine]);
			if (SmartSweeper.Vector2dLength(distToMine) < (size + 5)) {
				return this.iClosestMine;
			}
			return -1;
		},

		reset: function () {
			this.position = new SmartSweeper.Vector2d(Math.random() * Params.windowWidth, Math.random() * Params.windowHeight);
			this.fitness = 0;
			this.rotation = Math.random() * Params.twoPi;
		},

		position: function () {
			return this.position;
		},

		incrementFitness: function () {
			this.fitness++;
		},

		getFitness: function () {
			return this.fitness;
		},

		putWeights: function (weights) {
			this.brain.putWeights(weights);
		},

		getNumWeights: function () {
			return this.brain.getNumWeights();
		}
	};

	SmartSweeper.Params = Params;
	SmartSweeper.UserParams = UserParams;

	//source

	return SmartSweeper;
})();