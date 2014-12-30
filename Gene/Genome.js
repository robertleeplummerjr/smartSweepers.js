(function(Gene) {
	Gene.Genome = function(weights, fitness) {
		// An array of weights
		this.weights = weights;

		this.fitness = fitness;
	};
})(Gene);