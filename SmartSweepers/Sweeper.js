(function(SmartSweepers, Brain) {
	function clamp(arg, min, max) {
		if (arg < min) {
			arg = min;
		}

		if (arg > max) {
			arg = max;
		}

		return arg;
	}

	function Sweeper(params) {
		this.params = params;
		this.brain = new Brain.NeuralNet(params);
		this.position = new SmartSweepers.Vector2d(Math.random() * params.windowWidth, Math.random() * params.windowHeight);
		this.direction = new SmartSweepers.Vector2d();
		this.rotation = Math.random() * params.twoPi;
		this.speed = 0;
		this.lTrack = 0.16;
		this.rTrack = 0.16;
		this.fitness = 0;
		this.scale = params.sweeperScale;
		this.iClosestMine = 0;
	}

	// Update SmartSweeper position using neural network
	Sweeper.prototype = {
		/**
		 * First we take sensor readings and feed these into the sweepers brain. We receive two outputs from the brain.. lTrack & rTrack.
		 * So given a force for each track we calculate the resultant rotation
		 * and acceleration and apply to current velocity vector.
		 * @param {Object} mines sweepers 'look at' vector (x, y)
		 * @returns {boolean}
		 */
		update: function (mines) {
			//this will store all the inputs for the NN
			var inputs = [],

			//get vector to closest mine
				closestMineRaw = this.getClosestMine(mines),

			//normalise it
				closestMine = SmartSweepers.Vector2dNormalize(closestMineRaw);

			this.closestMine = closestMine;

			//add in vector to closest mine
			inputs.push(closestMine.x);
			inputs.push(closestMine.y);

			//add in sweepers look at vector
			inputs.push(this.direction.x);
			inputs.push(this.direction.y);

			//update the brain and get feedback
			var output = this.brain.update(inputs);

			//make sure there were no errors in calculating the
			//output
			if (output.length < this.params.numOutputs) {
				return false;
			}

			//assign the outputs to the sweepers left & right tracks
			this.lTrack = output[0];
			this.rTrack = output[1];

			//calculate steering forces
			var rotForce = this.lTrack - this.rTrack;

			//clamp rotation
			rotForce = clamp(rotForce, -this.params.maxTurnRate, this.params.maxTurnRate);

			// Rotate sweeper
			this.rotation += rotForce;

			this.speed = (this.lTrack + this.rTrack);

			//update Look At
			this.direction.x = -Math.sin(this.rotation);
			this.direction.y = Math.cos(this.rotation);

			//update position
			this.position.x += this.speed * this.direction.x;
			this.position.y += this.speed * this.direction.y;

			//wrap around window limits
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
			var mat = new SmartSweepers.Matrix2d();
			mat = mat.scale(this.scale, this.scale);
			mat = mat.rotate(this.rotation);
			mat = mat.translate(this.position.x, this.position.y);
			return mat.transformPoints(sweeperVerts);
		},


		getClosestMine: function (mines) {
			var closestMineDist = 99999;
			var closestMine = SmartSweepers.Vector2d(0, 0);
			for (var i = 0; i < mines.length; i++) {
				var distToMine = SmartSweepers.Vector2dLength(SmartSweepers.Vector2dSub(mines[i], this.position));
				if (distToMine < closestMineDist) {
					closestMineDist = distToMine;
					closestMine = SmartSweepers.Vector2dSub(this.position, mines[i]);
					this.iClosestMine = i;
				}
			}
			return closestMine;
		},

		// Check for closest mine. Return -1 if none are close enough
		// What is the 5 for? Also what is size?
		checkForMine: function (mines, size) {
			var distToMine = SmartSweepers.Vector2dSub(this.position, mines[this.iClosestMine]);
			if (SmartSweepers.Vector2dLength(distToMine) < (size + 5)) {
				return this.iClosestMine;
			}
			return -1;
		},

		reset: function () {
			this.position = new SmartSweepers.Vector2d(Math.random() * this.params.windowWidth, Math.random() * this.params.windowHeight);
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

	SmartSweepers.Sweeper = Sweeper;
})(SmartSweepers, Brain);