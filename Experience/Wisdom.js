(function(Experience) {
  "use strict";

  /**
   *
   * @param {number} ideaCount
   * @param {number} mutationRate
   * @param {number} crossoverRate
   * @param {number} weightCount
   * @param {number} maxPerturbation
   * @param {number} numElite
   * @param {number} numCopiesElite
   * @constructor
   */
  function Wisdom(ideaCount, mutationRate, crossoverRate, weightCount, maxPerturbation, numElite, numCopiesElite) {
    /**
     * @type Experience.Idea[]
     */
    this.ideaCount = ideaCount;
    this.weightCount = weightCount;
    this.mutationRate = mutationRate;
    this.maxPerturbation = maxPerturbation;
    this.numElite = numElite;
    this.numCopiesElite = numCopiesElite;
    this.crossoverRate = crossoverRate;
    this.totalFitness = 0;
    this.bestFitness = 0;
    this.avgFitness = 0;
    this.lowestFitness = Wisdom.defaults.worstFitness;
    this.bestIdea = 0;

    var i,
        j,
        weights,
        ideas = this.ideas = [];

    // Also set fitnesses to 0
    for (i = 0; i < ideaCount; i++) {
      weights = [];
      for (j = 0; j < weightCount; j++) {
        weights.push(Math.random() - Math.random());
      }
      ideas.push(new Experience.Idea(weights));
    }
  }

  Wisdom.prototype = {
    /**
     *
     * @param {Experience.Idea} existing1
     * @param {Experience.Idea} existing2
     * @param {Experience.Idea} new1
     * @param {Experience.Idea} new2
     * @returns {Wisdom}
     */
    experiment: function(existing1, existing2, new1, new2) {
      var i,
          crossoverPoint;

      if (Math.random() > this.crossoverRate) {
        for (i = 0; i < existing1.weights.length; i++) {
          new1.weights[i] = existing1.weights[i];
          new2.weights[i] = existing2.weights[i];
        }
        new1.fitness = existing1.fitness;
        new2.fitness = existing2.fitness;
      } else {
        // Pick a crossover point.
        crossoverPoint = Math.floor((Math.random() * (this.weightCount - 1)));

        // Swap weights
        for (i = 0; i < crossoverPoint; i++) {
          new1.weights[i] = existing1.weights[i];
          new2.weights[i] = existing2.weights[i];
        }

        for (i = crossoverPoint; i < existing1.weights.length; i++) {
          new1.weights[i] = existing1.weights[i];
          new2.weights[i] = existing2.weights[i];
        }
      }

      new1.fitness = existing1.fitness;
      new2.fitness = existing2.fitness;

      return this;
    },

    /**
     *
     * @param {Experience.Idea} idea
     * @returns {Wisdom}
     */
    hypothesize: function(idea) {
      var i = 0,
          max = idea.weights.length;

      for (; i < max; i++) {
        if (Math.random() < this.mutationRate) {
          idea.weights[i] += (Math.random() - Math.random()) * this.maxPerturbation;
        }
      }
      return this;
    },

    // Maybe switch this out with Tournament selection?
    selectIdea: function() {
      // total fitness of all ideas
      var slice = Math.random() * this.totalFitness,
          idea = null,
          currentFitness = 0,
          i = 0;

      // Keep adding fitness until it is above the slice,
      // then we stop and take the current idea
      for (; i < this.ideaCount; i++) {
        currentFitness += this.ideas[i].fitness;
        if (currentFitness >= slice) {
          idea = this.ideas[i];
          break;
        }
      }
      return idea;
    },

    /**
     *
     * @param {number} [bestCount]
     * @param {number} [copiesCount]
     * @returns {Array}
     */
    getBestIdeas: function(bestCount, copiesCount) {
      bestCount = bestCount || this.numElite;
      copiesCount = copiesCount || this.numCopiesElite;

      var ideas = [],
          i;
      while (bestCount--) {
        for (i = 0; i < copiesCount; i++) {
          ideas.push(this.ideas[(this.ideaCount - 1) - bestCount]);
        }
      }
      return ideas;
    },

    /**
     *
     * @returns {Wisdom}
     */
    calculateBestWorstAvTot: function() {
      this.totalFitness = 0;
      var bestFitness = 0,
          lowestFitness = this.lowestFitness,
          i;

      for (i = 0; i < this.ideaCount; i++) {
        if (this.ideas[i].fitness > bestFitness) {
          bestFitness = this.ideas[i].fitness;
          this.bestFitness = bestFitness;
          this.bestIdea = this.ideas[i];
        }

        if (this.ideas[i].fitness < lowestFitness) {
          lowestFitness = this.ideas[i].fitness;
          this.lowestFitness = lowestFitness;
        }
        this.totalFitness += this.ideas[i].fitness;
      }

      this.avgFitness = this.totalFitness / this.ideaCount;
      return this;
    },
    reset: function() {
      this.totalFitness = 0;
      this.bestFitness = 0;
      this.lowestFitness = Wisdom.defaults.worstFitness;
      this.avgFitness = 0;
      return this;
    },
    epoch: function(oldIdeas) {
      this.ideas = oldIdeas;
      this.reset();

      // Sort best to worst fitness?
      this.ideas.sort(function(a, b) {
        if (a.fitness > b.fitness) {
          return 1;
        } else if (a.fitness < b.fitness) {
          return -1;
        } else {
          return 0;
        }
      });

      // Calculate fitness values
      this.calculateBestWorstAvTot();
      var bestIdeas = this.getBestIdeas(),
          existing1,
          existing2,
          new1,
          new2;

      while (bestIdeas.length < this.ideaCount) {
        existing1 = this.selectIdea();
        existing2 = this.selectIdea();
        new1 = new Experience.Idea([this.weightCount]);
        new2 = new Experience.Idea([this.weightCount]);
        this
            .experiment(existing1, existing2, new1, new2)
            .hypothesize(new1)
            .hypothesize(new2);

        bestIdeas.push(new1);
        bestIdeas.push(new2);
      }

      return this.ideas = bestIdeas;
    },
    getIdeas: function() {
      return this.ideas;
    },
    getAvgFitness: function() {
      return this.avgFitness;
    },
    getBestFitness: function() {
      return this.bestFitness;
    },
    getBestIdea: function() {
      return this.bestIdea;
    }
  };

  Wisdom.defaults = {
    worstFitness: 9999999
  };

  Experience.Wisdom = Wisdom;
})(Experience);