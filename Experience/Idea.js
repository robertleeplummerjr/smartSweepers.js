(function(Experience) {
  "use strict";

  /**
   *
   * @param {number[]} weights
   * @param {number} [fitness]
   * @constructor
   */
  Experience.Idea = function(weights, fitness) {
    this.weights = weights;
    this.fitness = fitness || 0;
  };
})(Experience);