// Copyright (C) 2011 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

rabu.schedule.BurnupDom = function(element, estimates, projections) {
    var raphael = Raphael;     // prevent JSLint error resulting from calling Raphael without 'new'
    var self = this; 
	var xLabelElement = $(".rabu-xLabel");
	var yLabelElement = $(".rabu-yLabel");
	var xTickLabelElement = $(".rabu-xTickLabel");
	var yTickLabelElement = $(".rabu-yTickLabel");
    var paper, metrics, xLabel, yLabel;

	function hideInteriorElements() {
		element.children().hide();
	}
	
	function line(x1, y1, x2, y2) {
		return paper.path("M" + x1 + "," + y1 + " L" + x2 + "," + y2);
	}
	
	function copyOneTextElement(textElement, optionalText) {
		var text = optionalText || textElement.text();
		var result = paper.text(0, 0, text);
		result.attr({
            "font-family": textElement.css("font-family"),
            "font-size": textElement.css("font-size"),
            "font-weight": textElement.css("font-weight")
		});
		return result;
	}

    function copyTextElements() {
		self.xLabel = copyOneTextElement(xLabelElement);
		self.yLabel = copyOneTextElement(yLabelElement);
		self.xTickLabel = copyOneTextElement(xTickLabelElement).hide();
		self.yTickLabel = copyOneTextElement(yTickLabelElement).hide();
	}

    function axisLabels() {
		self.xLabel.translate(metrics.xLabelCenter, metrics.xLabelVerticalCenter);
		self.yLabel.translate(metrics.yLabelVerticalCenter, metrics.yLabelCenter);
		self.yLabel.rotate(270, true);
	}
	
	function axisLines() {
		self.xAxis = line(metrics.left - metrics.AXIS_OVERHANG, metrics.bottom, metrics.right, metrics.bottom);
		self.yAxis = line(metrics.left, metrics.top, metrics.left, metrics.bottom + metrics.AXIS_OVERHANG);
	}
	
	function xAxisTicks() {
		var i;
		
		self.xTicks = [];
		for (i = 0; i < metrics.xTickCount; i++) {
			var x = metrics.xTick(i);
			self.xTicks.push(line(x, metrics.bottom - (metrics.MAJOR_TICK_LENGTH / 2), x, metrics.bottom + (metrics.MAJOR_TICK_LENGTH / 2)));
		}
	}
	
	function xAxisTickLabels() {
		var i;

        self.xTicks = [];		
        self.xTickLabels = [];
        var previousLabelRightEdge = 0;
		for (i = 0; i < metrics.xTickCount; i++) {
            var x = metrics.xTick(i);
			var label = copyOneTextElement(xTickLabelElement, metrics.xTickLabel(i));
			label.translate(metrics.xTick(i), metrics.xTickLabelVerticalCenter); 

			var labelWidth = label.getBBox().width;
			if (metrics.shouldDrawXTickLabel(i, labelWidth, previousLabelRightEdge)) {
                self.xTicks.push(line(x, metrics.bottom - (metrics.MAJOR_TICK_LENGTH / 2), x, metrics.bottom + (metrics.MAJOR_TICK_LENGTH / 2)));
				self.xTickLabels.push(label);
				previousLabelRightEdge = x + (labelWidth / 2);
			}
			else {
				self.xTicks.push(line(x, metrics.bottom - (metrics.MINOR_TICK_LENGTH / 2), x, metrics.bottom + (metrics.MINOR_TICK_LENGTH / 2)));
				label.remove();
			}
		}
	}
	
	this.populate = function(optionalMetricsForTesting) {
		hideInteriorElements();
		if (paper) {
			paper.remove();
		}
        paper = raphael(element[0], element.width(), element.height());
		copyTextElements();
		if (optionalMetricsForTesting) {
			metrics = optionalMetricsForTesting;
		}
		else {
		    metrics = new rabu.schedule.BurnupChartMetrics({
	            paperWidth: paper.width, 
				paperHeight: paper.height,
	            xLabelHeight: self.xLabel.getBBox().height,
				yLabelHeight: self.yLabel.getBBox().height,
	            xTickLabelHeight: self.xTickLabel.getBBox().height,
				yTickLabelHeight: -10,
				startDate: estimates.firstIteration().startDate(),
				iterationLength: estimates.firstIteration().length(),
	            iterationCount: projections.maxIterations()
			});
		}

		axisLabels();
		axisLines();
//		xAxisTicks();
		xAxisTickLabels();
	};
	
	this.paper = function() {
		return paper;
	};
};


rabu.schedule.BurnupChartMetrics = function(data) {
    var self = this;
	this.MAJOR_TICK_LENGTH = 6;
	this.MINOR_TICK_LENGTH = 4;
	this.AXIS_OVERHANG = 10;
	this.LABEL_PADDING = 5;
    
    this.left = data.yLabelHeight + this.AXIS_OVERHANG;
    this.right = data.paperWidth;
    this.width = this.right - this.left;
    
    this.top = 0;
    this.bottom = data.paperHeight - (data.xLabelHeight + this.MAJOR_TICK_LENGTH + data.xTickLabelHeight);
    this.height = this.bottom - this.top;
    
    this.xLabelCenter = this.left + (this.width / 2);
    this.yLabelCenter = this.top + (this.height / 2);
    this.xLabelVerticalCenter = data.paperHeight - (data.xLabelHeight / 2);
    this.yLabelVerticalCenter = this.left - this.AXIS_OVERHANG - (data.yLabelHeight / 2);
	
	this.xTickLabelVerticalCenter = this.bottom + this.MAJOR_TICK_LENGTH + (data.xTickLabelHeight / 2);
	
	this.xTickCount = data.iterationCount;
	
	this.xTick = function(offset) {
		var tickDistance = self.width / (data.iterationCount - 1 + 0.5);
		return self.left + (offset * tickDistance);
	};
	
	this.shouldDrawXTickLabel = function(tickOffset, labelWidth, previousRightEdge) {
		var x = self.xTick(tickOffset) - (labelWidth / 2) - self.LABEL_PADDING;
		
		var tickZero = (tickOffset === 0);
		var overlapsLeftEdge = (x <= self.left);
		var overlapsRightEdge = (x + labelWidth + (self.LABEL_PADDING * 2) >= self.right);
		var overlapsPreviousLabel = (x <= previousRightEdge);
		
		return !tickZero && !overlapsLeftEdge && !overlapsRightEdge && !overlapsPreviousLabel;
	};
	
	this.xTickLabel = function(tickOffset) {
		var date = new Date(data.startDate);
		date.setDate(date.getDate() + (data.iterationLength * tickOffset));
		return date.toString('MMM d');
	};
};
