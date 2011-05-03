// Copyright (C) 2011 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

rabu.schedule.Estimates = function(configJson) {
	var rs = rabu.schedule;
	var config = configJson;

    function iterations() {
        if (!config.iterations || config.iterations.length === 0) {
            return [{}];
        }
        else {
            return config.iterations;
        }
    }

	this.name = function() {
		return config.name;
	};

	this.updated = function() {
		return new Date(config.updated);
	};

	this.tenPercentMultiplier = function() {
		return config.riskMultipliers[0];
	};

	this.fiftyPercentMultiplier = function() {
		return config.riskMultipliers[1];
	};

	this.ninetyPercentMultiplier = function() {
		return config.riskMultipliers[2];
	};

	this.currentIteration = function() {
		return new rs.Iteration(iterations()[0]);
	};
	
	this.firstIteration = function() {
		var list = iterations();
		return new rs.Iteration(list[list.length - 1]);
	};
	
	this.iteration = function(offsetFromOldest) {
		var iterationData = iterations();
		var index = iterationData.length - (offsetFromOldest + 1);
		return new rs.Iteration(iterationData[index]);
	};
	
    this.iterationCount = function() {
		return config.iterations.length;
	};

	this.currentIterationStarted = function() {
		return this.currentIteration().startDate();
	};

	this.iterationLength = function() {
		return this.currentIteration().length();
	};

	this.velocity = function() {
		return this.currentIteration().velocity();
	};

	this.totalEstimate = function() {
		return this.currentIteration().totalEstimate();
	};

	this.includedFeatures = function() {
		return this.currentIteration().includedFeatures();
	};

	this.excludedFeatures = function() {
		return this.currentIteration().excludedFeatures();
	};
};


rabu.schedule.Iteration = function(iteration, effortToDate) {
    var self = this;
	
	this.startDate = function() {
		return new Date(iteration.started);
	};
	
	this.length = function() {
		return iteration.length;
	};
	
	this.velocity = function() {
		return iteration.velocity;
	};
	
	this.effortRemaining = function() {
		var adder = function(sum, feature) {
			return sum + feature.estimate();
		};
		return this.includedFeatures().reduce(adder, 0);
	};
	
	this.totalEffort = function() {
		return effortToDate + self.effortRemaining();
	};
	
	function featuresFromList(featureList) {
		if (!featureList) { return []; }
		return featureList.map(function(element) {
			return new rabu.schedule.Feature(element);
		});
	}

	this.includedFeatures = function() {
		return featuresFromList(iteration.included);
	};
	
	this.excludedFeatures = function() {
		return featuresFromList(iteration.excluded);
	};
};


rabu.schedule.Feature = function(featureJson) {
	var feature = featureJson;

	this.name = function() {
		return feature[0];
	};

	this.estimate = function() {
		return feature[1];
	};

	this.isDone = function() {
		return this.estimate() === 0;
	};

	this.equals = function(that) {
		return (this.name() === that.name()) && (this.estimate() === that.estimate());
	};

	this.toString = function() {
		return "['" + this.name() + "', " + this.estimate() + "]";
	};
};