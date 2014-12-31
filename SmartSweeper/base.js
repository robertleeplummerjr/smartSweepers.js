var SmartSweeper = (function() {
	"use strict";




	function SmartSweeper(params) {
		this.params = params;
		this.brain = new Brain.NeuralNet(params);
		this.position = new SmartSweeper.Vector2d(Math.random() * params.windowWidth, Math.random() * params.windowHeight);
		this.direction = new SmartSweeper.Vector2d();
		this.rotation = Math.random() * params.twoPi;
		this.speed;
		this.lTrack = 0.16;
		this.rTrack = 0.16;
		this.fitness = 0;
		this.scale = params.sweeperScale;
		this.iClosestMine = 0;
	}

	// Update SmartSweeper position using neural network
	SmartSweeper.prototype = {
		update: function (mines) {
			var inputs = [];
			this.closestMine = this.getClosestMine(mines);
			this.closestMine = SmartSweeper.Vector2dNormalize(this.closestMine);

			inputs.push(this.closestMine.x);
			inputs.push(this.closestMine.y);
			inputs.push(this.direction.x);
			inputs.push(this.direction.y);

			var output = this.brain.update(inputs);

			// If num outputs are not correct, exit
			if (output.length < this.params.numOutputs) {
				return false;
			}

			this.lTrack = output[0];
			this.rTrack = output[1];

			// Clamp the rot force between -0.3 and 0.3
			var rotForce = this.lTrack - this.rTrack;
			var min = -1 * this.params.maxTurnRate;
			var max = this.params.maxTurnRate;
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
			if (this.position.x > this.params.windowWidth) {
				this.position.x = 0;
			}

			if (this.position.x < 0) {
				this.position.x = this.params.windowWidth;
			}

			if (this.position.y > this.params.windowHeight) {
				this.position.y = 0;
			}

			if (this.position.y < 0) {
				this.position.y = this.params.windowHeight;
			}

			return true;
		},

		// Where does vector Spoints come from?
		worldTransform: function (sweeperVerts) {
			var mat = new SmartSweeper.Matrix2d();
			mat = mat.scale(this.scale, this.scale);
			mat = mat.rotate(this.rotation);
			mat = mat.translate(this.position.x, this.position.y);
			return mat.transformPoints(sweeperVerts);
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
			this.position = new SmartSweeper.Vector2d(Math.random() * this.params.windowWidth, Math.random() * this.params.windowHeight);
			this.fitness = 0;
			this.rotation = Math.random() * this.params.twoPi;
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

	//source

	return SmartSweeper;
})();