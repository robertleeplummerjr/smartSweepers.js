(function(SmartSweeper, Params, Gene) {

	var cloneSweeperVerts = function () {
		return [
			{x: -1, y: -1},
			{x: -1, y: 1},
			{x: -0.5, y: 1},
			{x: -0.5, y: -1},

			{x: 0.5, y: -1},
			{x: 1, y: -1},
			{x: 1, y: 1},
			{x: 0.5, y: 1},

			{x: -0.5, y: -0.5},
			{x: 0.5, y: -0.5},

			{x: -0.5, y: 0.5},
			{x: -0.25, y: 0.5},
			{x: -0.25, y: 1.75},
			{x: 0.25, y: 1.75},
			{x: 0.25, y: 0.5},
			{x: 0.5, y: 0.5}
		];
	};

	var cloneMineVerts = function () {
		return [
			{x: -1, y: -1},
			{x: -1, y: 1},
			{x: 1, y: 1},
			{x: 1, y: -1}
		];
	};

	var Controller = function () {
		this.population = 0;
		this.sweepers = [];
		this.mines = [];
		this.ga = null;
		this.numSweepers = Params.numSweepers;
		this.numMines = Params.numMines;
		this.numWeightsForNN = 0;

		// Keep Per generation
		this.avgFitness = [];

		// Keep Per generation
		this.bestFitness = [];

		// What to do with these?
		this.redPen;
		this.bluePen;
		this.greenPen;
		this.oldPen;

		// Cycles per generation? What does this mean?
		this.ticks = 0;

		// Current generation;
		this.generations = 0;

		// Dimension of window
		this.cxClient = Params.windowWidth;
		this.cyClient = Params.windowHeight;

		this.fastRender = true;

		for (var i = 0; i < this.numSweepers; ++i) {
			this.sweepers.push(new SmartSweeper());
		}

		this.numWeightsForNN = this.sweepers[0].getNumWeights();
		this.ga = new Gene.GA(
			this.numSweepers,
			Params.mutationRate,
			Params.crossoverRate,
			this.numWeightsForNN,
			Params.maxPerturbation,
			Params.numElite,
			Params.numCopiesElite
		);

		this.population = this.ga.getChromos();

		for (var i = 0; i < this.numSweepers; i++) {
			this.sweepers[i].putWeights(this.population[i].weights);
		}

		for (var i = 0; i < this.numMines; i++) {
			this.mines.push(new SmartSweeper.Vector2d(
				Math.random() * this.cxClient, Math.random() * this.cyClient));
		}
	};

	Controller.prototype = {
		plotStats: function (ctx) {
			var generationEl = document.createElement('td');
			generationEl.appendChild(document.createTextNode(this.generations));

			var bestFitnessEl = document.createElement('td');
			bestFitnessEl.appendChild(document.createTextNode(this.ga.getBestFitness()));

			var avgFitnessEl = document.createElement('td');
			avgFitnessEl.appendChild(document.createTextNode(this.ga.getAvgFitness().toFixed(2)));

			var rowEl = document.createElement('tr');
			rowEl.appendChild(generationEl);
			rowEl.appendChild(bestFitnessEl);
			rowEl.appendChild(avgFitnessEl);

			var tableEl = document.getElementById('stats-table');
			if (tableEl !== null) {
				tableEl.appendChild(rowEl);
			}
		},

		render: function (ctx) {
			ctx.clearRect(0, 0, Params.windowWidth, Params.windowHeight);
			ctx.beginPath();
			ctx.rect(0, 0, Params.windowWidth, Params.windowHeight);
			ctx.fillStyle = 'rgb(32, 36, 45)';
			ctx.fill();

			ctx.beginPath();
			for (var i = 0; i < this.numMines; i++) {
				var mineVerts = cloneMineVerts();
				this.worldTransform(mineVerts, this.mines[i]);
				ctx.moveTo(mineVerts[0].x, mineVerts[0].y);
				for (var g = 1; g < mineVerts.length; g++) {
					ctx.lineTo(mineVerts[g].x, mineVerts[g].y);
				}
				ctx.lineTo(mineVerts[0].x, mineVerts[0].y);
			}
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgb(140, 177, 120)';
			ctx.stroke();

			ctx.beginPath();
			for (var i = 0; i < this.numSweepers; i++) {
				var sweeperVerts = cloneSweeperVerts();
				this.sweepers[i].worldTransform(sweeperVerts);

				if (i == Params.numElite) {
					ctx.lineWidth = 1;
					ctx.strokeStyle = 'rgb(176, 64, 60)';
					ctx.stroke();
					ctx.beginPath();
				}

				// Draw left track of sweeper
				ctx.moveTo(sweeperVerts[0].x, sweeperVerts[0].y);
				for (var g = 1; g < 4; ++g) {
					ctx.lineTo(sweeperVerts[g].x, sweeperVerts[g].y);
				}
				ctx.lineTo(sweeperVerts[0].x, sweeperVerts[0].y);

				// Draw right track of sweeper
				ctx.moveTo(sweeperVerts[4].x, sweeperVerts[4].y);
				for (var g = 5; g < 8; ++g) {
					ctx.lineTo(sweeperVerts[g].x, sweeperVerts[g].y);
				}
				ctx.lineTo(sweeperVerts[4].x, sweeperVerts[4].y);

				// Draw rest of sweeper
				ctx.moveTo(sweeperVerts[8].x, sweeperVerts[8].y);
				ctx.lineTo(sweeperVerts[9].x, sweeperVerts[9].y);

				ctx.moveTo(sweeperVerts[10].x, sweeperVerts[10].y);

				for (var g = 11; g < 16; ++g) {
					ctx.lineTo(sweeperVerts[g].x, sweeperVerts[g].y);
				}
			}
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgb(123, 144, 164)';
			ctx.stroke();
		},

		// Sets up translation matrices for mines and applies the world transform
		// to each vertex in the vertex buffer passed to this method.
		worldTransform: function (vBuffer, vPos) {
			var mat = new SmartSweeper.Matrix2d();
			mat.scale(Params.mineScale, Params.mineScale);
			mat.translate(vPos.x, vPos.y);
			mat.transformPoints(vBuffer);
		},

		update: function () {
			if (this.ticks++ < Params.numTicks) {
				for (var i = 0; i < this.numSweepers; i++) {
					if (!this.sweepers[i].update(this.mines)) {
						console.log("Wrong amount of NN inputs!");
						return false;
					}
					var grabHit = this.sweepers[i].checkForMine(this.mines, Params.mineScale);
					if (grabHit >= 0) {
						this.sweepers[i].incrementFitness();
						this.mines[grabHit] = new SmartSweeper.Vector2d(
							Math.random() * this.cxClient, Math.random() * this.cyClient);
					}
					this.population[i].fitness = this.sweepers[i].getFitness();
				}
			} else {
				this.avgFitness.push(this.ga.getAvgFitness());
				this.bestFitness.push(this.ga.getBestFitness());
				++this.generations;
				this.ticks = 0;
				this.population = this.ga.epoch(this.population);
				for (var i = 0; i < this.numSweepers; i++) {
					this.sweepers[i].putWeights(this.population[i].weights);
					this.sweepers[i].reset();
				}
			}
			return true;
		},

		getFastRender: function () {
			return this.fastRender;
		},

		setFastRender: function (fastRender) {
			this.fastRender = fastRender;
		},

		// Pretty clever way to toggle!
		toggleFasterRender: function () {
			this.fastRender = !this.fastRender;
		}
	};

	SmartSweeper.Controller = Controller;
}(SmartSweeper, SmartSweeper.Params, Gene));