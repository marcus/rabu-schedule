// Copyright (C) 2011 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

(function() {
	var rs = rabu.schedule;
	var Test = new TestCase("FeaturesDom");
	var config;
	var iteration;
	var featuresDom;
	var ul;
	var li;
	var divider;
	var mouseDownElement;
	var mockApplicationModel;

	function MockApplicationModel() {}
	MockApplicationModel.prototype = new rs.Object();
	MockApplicationModel.prototype.moveFeature = function() {
		this.moveFeatureCalledWith = Array.prototype.slice.call(arguments);
	};

	function populate() {
		mockApplicationModel = new MockApplicationModel();

		iteration = new rs.Iteration(config);
		featuresDom = new rs.FeaturesDom(mockApplicationModel);
		featuresDom.populate(iteration);
		ul = $("ul");
		li = $("li");
		divider = $(".rabu-divider");
	}

	function assertLiPositions(message, positions) {
		var joiner = "";
		var actualPositions = "[";
		li.each(function(index, element) {
			actualPositions += joiner + $(element).offset().top;
			joiner = ", ";
		});
		actualPositions += "]";

		joiner = "";
		var expectedPositions = "[";
		positions.forEach(function(element, index) {
			expectedPositions += joiner + element;
			joiner = ", ";
		});
		expectedPositions += "]";

		assertEquals(message, expectedPositions, actualPositions);
	}

	function mouseDown(jQueryElement) {
		mouseDownElement = jQueryElement;

		var downEvent = new jQuery.Event();
		downEvent.pageX = 0;
		downEvent.pageY = jQueryElement.offset().top;
		downEvent.which = 1;
		downEvent.type = "mousedown";
		jQueryElement.trigger(downEvent);
	}

	function mouseMove(jQueryElement, moveToY) {
		var moveEvent = new jQuery.Event();
		moveEvent.pageX = 0;
		moveEvent.pageY = moveToY;
		moveEvent.type = "mousemove";
		jQueryElement.trigger(moveEvent);
	}

	function mouseUp(jQueryElement) {
		mouseDownElement = undefined;

		var upEvent = new jQuery.Event();
		upEvent.pageX = 0;
		upEvent.pageY = 0;
		upEvent.which = 1;
		upEvent.type = "mouseup";
		jQueryElement.trigger(upEvent);
	}

	function drag(element, moveToY) {
		var adjustmentToMimicRealWorldBehavior = parseInt($(element).css("margin-top"), 10);

		var jQueryElement = $(element);
		if (!mouseDownElement) { mouseDown(jQueryElement); }
		mouseMove(jQueryElement, moveToY + adjustmentToMimicRealWorldBehavior);
	}

	function drop(element) {
		mouseUp($(element));
	}

	function dragAndDrop(element, moveToY) {
		drag(element, moveToY);
		drop(element);
	}

	function assertDrag(message, element, newPosition, expectedResult) {
		drag(element, newPosition);
		assertLiPositions(message, expectedResult);
	}

	Test.prototype.setUp = function() {
		/*:DOC +=   <style type='text/css'>
						li { height: 20px }
						ul { margin: 0; }
						body { margin: 0; }
						.rabu-divider { height: 50px; }
					</style>  */
		/*:DOC +=   <ul class="rabu-features"></ul> */
		/*:DOC +=   <div class="rabu-divider"></div> */
		config = {
			
			riskMultipliers: [1, 2, 4],
			included: [
				["completed", 0],
				["feature A", 70],
				["feature B", 30]
			],
			excluded: [
				["excluded 1", 20]
			]
		};
		populate();

		assertEquals("assumption: li height", 20, li.first().outerHeight(true));
		assertEquals("assumption: ul top", 0, ul.offset().top);
		assertEquals("assumption: first li top", 0, li.first().offset().top);
		assertEquals("assumption: divider height", 50, divider.outerHeight(true));
	};

	Test.prototype.tearDown = function() {
		if (mouseDownElement) { mouseUp(mouseDownElement); }
	};

	Test.prototype.test_populate_createsFeatureList = function() {
		assertEquals("li #0 text", "completed", $(li[0]).text());
		assertEquals("li #1 text", "feature A", $(li[1]).text());
		assertEquals("li #2 text", "feature B", $(li[2]).text());
		assertEquals("li #3 text", "excluded 1", $(li[3]).text());
	};

	Test.prototype.test_populate_isIdempotent = function() {
		featuresDom.populate(iteration);
		featuresDom.populate(iteration);
		assertEquals("# of items", 4, li.length);
	};

	Test.prototype.test_populate_marksItemsDone = function() {
		assertTrue("li #0 done", $(li[0]).hasClass("rabu-done"));
		assertFalse("li #1 done", $(li[1]).hasClass("rabu-done"));
		assertFalse("li #2 done", $(li[2]).hasClass("rabu-done"));
		assertFalse("li #3 done", $(li[3]).hasClass("rabu-done"));
	};

	Test.prototype.test_populate_marksItemsIncludedAndExcluded = function() {
		assertTrue("li #0 included", $(li[0]).hasClass("rabu-included"));
		assertTrue("li #1 included", $(li[1]).hasClass("rabu-included"));
		assertTrue("li #2 included", $(li[2]).hasClass("rabu-included"));
		assertFalse("li #3 included", $(li[3]).hasClass("rabu-included"));

		assertFalse("li #0 excluded", $(li[0]).hasClass("rabu-excluded"));
		assertFalse("li #1 excluded", $(li[1]).hasClass("rabu-excluded"));
		assertFalse("li #2 excluded", $(li[2]).hasClass("rabu-excluded"));
		assertTrue("li #3 excluded", $(li[3]).hasClass("rabu-excluded"));
	};

	Test.prototype.test_populate_positionsItemsAndDivider = function() {
		config.excluded[1] = ["excluded 2", 30];
		populate();

		assertLiPositions("excluded features should be positioned below divider", [0, 20, 40, 110, 130]);
		assertEquals("divider should be centered in gap", 60, divider.offset().top);
	};

	Test.prototype.test_populate_positioningAccommodatesUlMarginsBorderAndPadding = function() {
		ul.css("margin-top", "16px");
		ul.css("border", "solid red 4px");
		ul.css("padding-top", "5px");
		populate();
		assertLiPositions("features should be positioned below margins and padding", [25, 45, 65, 135]);

		ul.css("margin-top", "-3px");
		ul.css("border", "0px");
		ul.css("padding-top", "0px");
		populate();
		assertLiPositions("negative ul margin", [-3, 17, 37, 107]);
	};

	Test.prototype.test_populate_positioningAccommodatesLiMarginsAndPadding = function() {
		/*:DOC +=   <style type='text/css'>
						li {
							margin-top: 1px;
							border-top: solid red 2px;
							padding-top: 4px;
							height: 8px;
							padding-bottom: 16px;
							border-bottom: solid blue 32px;
							margin-bottom: 64px;
						}
					</style>  */
		populate();
		assertLiPositions("li margins and padding", [0, 127, 254, 431]);

		/*:DOC +=   <style type='text/css'>
						li {
							margin-top: -4px;
							border-top: solid red 0px;
							padding-top: 0px;
							height: 8px;
							padding-bottom: 0px;
							border-bottom: solid blue 0px;
							margin-bottom: 0px;
						}
					</style>  */
		populate();
		assertLiPositions("negative li margins", [-4, 0, 4, 58]);
	};

	Test.prototype.test_populate_positionsDividerAtBottomOfListWhenNoExcludedFeatures = function() {
		config.excluded = undefined;
		populate();

		assertLiPositions("li positions", [0, 20, 40]);
		assertEquals("divider position", 60, divider.offset().top);
	};

	Test.prototype.test_populate_positionsDividerAtTopOfListWhenNoIncludedFeatures = function() {
		config.included = undefined;
		config.excluded[1] = ["excluded 2", 30];
		populate();

		assertLiPositions("li positions", [50, 70]);
		assertEquals("divider position", 0, divider.offset().top);
	};

	Test.prototype.test_populate_resizesListToAccomodateDivider = function() {
		assertEquals("height of list should accomodate divider", 130, ul.outerHeight(true));
		ul.css("padding-bottom", "20px");
		ul.css("margin-bottom", "16px");
		populate();
		assertEquals("divider should accomodate existing padding and margins", 166, ul.outerHeight(true));
	};

	function option(key) { return $(li).draggable("option", key); }

	Test.prototype.test_populate_makesFeaturesDraggable = function() {
		assertTrue("should be draggable", $(li).hasClass("ui-draggable"));
		assertEquals("constrained vertically", "y", option("axis"));
		assertEquals("top", 0, option("containment")[1]);
		assertEquals("bottom", 130, option("containment")[3]);
//		assertEquals("scroll speed", 10, option("scrollSpeed"));    // off due to bug; see comment in makeDraggable() in production code
	};

	Test.prototype.test_populate_constrainsDraggableAreaToTopAndBottomOfList = function() {
		ul.css("margin-top", "5px");
		ul.css("margin-bottom", "10px");
		populate();
		assertEquals("top", 5, option("containment")[1]);
		assertEquals("bottom", 185, option("containment")[3]);
	};

	Test.prototype.test_dragging_idempotency = function() {
		assertDrag("should be idempotent (1)", li[0], 20, [20, 0, 40, 110]);
		assertDrag("should be idempotent (2)", li[0], 21, [21, 0, 40, 110]);
	};

	Test.prototype.test_draggingDown_movesElementWhenBottomIsAtCenterOfNextElement = function() {
		/*:DOC +=   <style type='text/css'>
						.rabu-done { height: 32px }
					</style>  */
		config.included = [
			["single A", 1],
			["double B", 0],
			["single C", 1],
			["single D", 1]
		];
		config.excluded = undefined;
		populate();
		assertLiPositions("starting values", [0, 20, 52, 72]);
		assertDrag("li 0 -> li 1 (before halfway point)", li[0], 15, [15, 20, 52, 72]);
		assertDrag("li 0 -> li 1 (after halfway point)", li[0], 16, [16, 0, 52, 72]);
		assertDrag("li 0 -> li 2 (before halfway point)", li[0], 41, [41, 0, 52, 72]);
		assertDrag("li 0 -> li 2 (after halfway point)", li[0], 42, [42, 0, 32, 72]);
		assertDrag("li 0 -> li 3 (before halfway point)", li[0], 61, [61, 0, 32, 72]);
		assertDrag("li 0 -> li 3 (after halfway point)", li[0], 62, [62, 0, 32, 52]);
	};

	Test.prototype.test_draggingUp_movesElementWhenTopIsAtCenterOfPreviousElement = function() {
		/*:DOC +=   <style type='text/css'>
						.rabu-done { height: 32px }
					</style>  */
		config.included = [
			["single A", 1],
			["single B", 1],
			["single C", 1],
			["double D", 0],
			["double E", 0]
		];
		config.excluded = undefined;
		populate();
		assertLiPositions("starting values", [0, 20, 40, 60, 92]);
		assertDrag("li 4 -> li 3 (before halfway point)", li[4], 77, [0, 20, 40, 60, 77]);
		assertDrag("li 4 -> li 3 (after halfway point)", li[4], 76, [0, 20, 40, 92, 76]);
		assertDrag("li 4 -> li 2 (before halfway point)", li[4], 51, [0, 20, 40, 92, 51]);
		assertDrag("li 4 -> li 2 (after halfway point)", li[4], 50, [0, 20, 72, 92, 50]);
		assertDrag("li 4 -> li 1 (before halfway point)", li[4], 31, [0, 20, 72, 92, 31]);
		assertDrag("li 4 -> li 1 (after halfway point)", li[4], 30, [0, 52, 72, 92, 30]);
		assertDrag("li 4 -> li 0 (before halfway point)", li[4], 11, [0, 52, 72, 92, 11]);
		assertDrag("li 4 -> li 0 (after halfway point)", li[4], 10, [32, 52, 72, 92, 10]);
	};

	Test.prototype.test_draggingDown_movesDividerWhenBottomIsAtCenterOfDivider = function() {
		assertDrag("li 2 -> divider (before halfway point)", li[2], 64, [0, 20, 64, 110]);
		assertEquals("li 2 -> divider (divider position before move)", 60, divider.offset().top);
		assertDrag("li 2 -> divider (after halfway point)", li[2], 65, [0, 20, 65, 110]);
		assertEquals("li 2 -> divider (divider position after move)", 40, divider.offset().top);
		assertDrag("li 2 -> li 3 (before halfway point)", li[2], 99, [0, 20, 99, 110]);
		assertDrag("li 2 -> li 3 (after halfway point)", li[2], 100, [0, 20, 100, 90]);
	};

	Test.prototype.test_draggingUp_movesDividerWhenTopIsAtCenterOfDivider = function() {
		assertDrag("li 2 -> divider (before halfway point)" , li[3], 86, [0, 20, 40, 86]);
		assertEquals("li 2 -> divider (divider position before move)", 60, divider.offset().top);
		assertDrag("li 2 -> divider (after halfway point)", li[3], 85, [0, 20, 40, 85]);
		assertEquals("li 2 -> divider (divider position after move)", 80, divider.offset().top);
		assertDrag("li 3 -> li 2 (before halfway point)", li[3], 51, [0, 20, 40, 51]);
		assertDrag("li 3 -> li 2 (after halfway point)", li[3], 50, [0, 20, 60, 50]);
	};

	Test.prototype.test_dragging_disregardsMarginsBorderAndPaddingOfDraggedItem = function() {
		/*:DOC +=   <style type='text/css'>
			.rabu-divider {
				margin-top: 7px;
				border-top: solid red 8px;
				padding-top: 16px;
				height: 32px;
				padding-bottom: 64px;
				border-bottom: solid blue 128px;
				margin-bottom: 256px;
			}
		</style>  */
		populate();
		assertLiPositions("starting positions", [0, 20, 40, 571]);
		assertDrag("move divider up -> li 2 (before halfway point)", divider, 20, [0, 20, 40, 571]);
		assertDrag("move divider up -> li 2 (after halfway point)", divider, 19, [0, 20, 551, 571]);

		assertDrag("move divider down -> li 3 (before halfway point)", divider, 517, [0, 20, 40, 571]);
		assertDrag("move divider down -> li 3 (after halfway point)", divider, 518, [0, 20, 40, 60]);
	};

	Test.prototype.test_draggingDivider = function() {
		assertLiPositions("starting positions", [0, 20, 40, 110]);
		assertDrag("move divider up -> li 2 (before halfway point)", divider, 51, [0, 20, 40, 110]);
		assertDrag("move divider up -> li 2 (after halfway point)", divider, 50, [0, 20, 90, 110]);

		assertDrag("move divider down -> li 3 (before halfway point)", divider, 69, [0, 20, 40, 110]);
		assertDrag("move divider down -> li 3 (after halfway point)", divider, 70, [0, 20, 40, 60]);
	};

	Test.prototype.test_draggingDivider_disregardsMarginsOfDraggedItem_EXCEPT_whenMarginsAreNegative = function() {
		/*:DOC +=   <style type='text/css'>
			.rabu-divider {
				margin-top: -5px;
				height: 40px;
				margin-bottom: -7px;
			}
		</style>  */
		populate();
		assertLiPositions("starting positions", [0, 20, 40, 88]);
		assertDrag("move divider up -> li 2 (before halfway point)", divider, 51, [0, 20, 40, 88]);
		assertDrag("move divider up -> li 2 (after halfway point)", divider, 50, [0, 20, 68, 88]);

		assertDrag("move divider down -> li 3 (before halfway point)", divider, 69, [0, 20, 40, 88]);
		assertDrag("move divider down -> li 3 (after halfway point)", divider, 70, [0, 20, 40, 60]);
	};

	Test.prototype.test_draggingUp_disregardsMarginBorderAndPaddingOfListItems = function() {
		/*:DOC +=   <style type='text/css'>
			.rabu-divider {
				margin-top: 7px;
				border-top: solid red 8px;
				padding-top: 16px;
				height: 32px;
				padding-bottom: 64px;
				border-bottom: solid blue 128px;
				margin-bottom: 256px;
			}
		</style>  */
		populate();
		assertLiPositions("starting li positions", [0, 20, 40, 571]);
		assertEquals("starting divider position", 60, divider.offset().top);
		drag(li[3], 108);
		assertEquals("move li 3 up -> divider (before halfway point)", 60, divider.offset().top);
		assertLiPositions("move up (li's, before halfway point)", [0, 20, 40, 108]);
		drag(li[3], 107);
		assertEquals("move li 3 up -> divider (after halfway point)", 80, divider.offset().top);
		assertLiPositions("move up (li's, after halfway point)", [0, 20, 40, 107]);

	};

	Test.prototype.test_draggingDown_disregardsMarginBorderAndPaddingOfListItems = function() {
		/*:DOC +=   <style type='text/css'>
			.rabu-divider {
				margin-top: 7px;
				border-top: solid red 8px;
				padding-top: 16px;
				height: 32px;
				padding-bottom: 64px;
				border-bottom: solid blue 128px;
				margin-bottom: 256px;
			}
		</style>  */
		populate();
		assertLiPositions("starting li positions", [0, 20, 40, 571]);
		assertEquals("starting divider position", 60, divider.offset().top);
		drag(li[2], 86);
		assertEquals("move li 2 down -> divider (before halfway point)", 60, divider.offset().top);
		assertLiPositions("move down (li's, before halfway point)", [0, 20, 86, 571]);
		drag(li[2], 87);
		assertEquals("move li 2 down -> divider (after halfway point)", 40, divider.offset().top);
		assertLiPositions("move down (li's, after halfway point)", [0, 20, 87, 571]);
	};

	Test.prototype.test_draggingUp_disregardsMarginsOfListItems_whenMarginsAreNegative = function() {
		/*:DOC +=   <style type='text/css'>
			.rabu-divider {
				margin-top: -5px;
				height: 40px;
				margin-bottom: -7px;
			}
		</style>  */
		populate();
		assertLiPositions("starting positions", [0, 20, 40, 88]);
		assertEquals("starting divider position", 55, divider.offset().top);
		drag(li[3], 76);
		assertEquals("move li 3 up -> divider (before halfway point)", 55, divider.offset().top);
		assertLiPositions("move up (li's, before halfway point)", [0, 20, 40, 76]);
		drag(li[3], 75);
		assertEquals("move li 3 up -> divider (after halfway point)", 75, divider.offset().top);
		assertLiPositions("move up (li's, after halfway point)", [0, 20, 40, 75]);
	};

	Test.prototype.test_draggingDown_disregardsMarginsOfListItems_whenMarginsAreNegative = function() {
		/*:DOC +=   <style type='text/css'>
			.rabu-divider {
				margin-top: -5px;
				height: 40px;
				margin-bottom: -7px;
			}
		</style>  */
		populate();
		assertLiPositions("starting positions", [0, 20, 40, 88]);
		assertEquals("starting divider position", 55, divider.offset().top);
		drag(li[2], 54);
		assertEquals("move li 2 down -> divider (before halfway point)", 55, divider.offset().top);
		assertLiPositions("move down (li's, before halfway point)", [0, 20, 54, 88]);
		drag(li[2], 55);
		assertEquals("move li 2 down -> divider (after halfway point)", 35, divider.offset().top);
		assertLiPositions("move down (li's, after halfway point)", [0, 20, 55, 88]);
	};

	Test.prototype.test_draggingDown_beyondLegalBounds = function() {
		config.excluded = undefined;
		populate();
		assertDrag("down past legal bounds", li[0], 300, [160, 0, 20]);
	};

	Test.prototype.test_draggingUp_beyondLegalBounds = function() {
		config.excluded = undefined;
		populate();
		assertDrag("up past legal bounds", li[2], -100, [20, 40, 0]);
	};

	Test.prototype.test_dragging_changesIncludedExcludedStatus = function() {
		assertTrue("assumption: li 0 is included at start", $(li[0]).hasClass("rabu-included"));
		assertFalse("assumption: li 0 is not excluded at start", $(li[0]).hasClass("rabu-excluded"));
		dragAndDrop(li[0], 110);
		assertFalse("li 0 should not be included after dragging past divider", $(li[0]).hasClass("rabu-included"));
		assertTrue("li 0 should be excluded after dragging past divider", $(li[0]).hasClass("rabu-excluded"));
	};

	Test.prototype.test_dragging_modifiesUnderlyingModel = function() {
		drag(li[0], 110);
		assertEquals("should notify application model", [0, 4], mockApplicationModel.moveFeatureCalledWith);

		drag(li[0], 111);
		assertEquals("drag should be stable", [4, 4], mockApplicationModel.moveFeatureCalledWith);
	};

	Test.prototype.test_dropping_snapsItemsIntoPlace = function() {
		dragAndDrop(li[0], 15);
		assertLiPositions("should snap into place", [20, 0, 40, 110]);
	};

	Test.prototype.test_dropping_permanentlyChangesItemPosition = function() {
		dragAndDrop(li[0], 20);
		assertLiPositions("first item moved", [20, 0, 40, 110]);
		dragAndDrop(li[2], 110);
		assertLiPositions("third item moved", [20, 0, 110, 90]);
		dragAndDrop(li[0], 90);
		assertLiPositions("first item moved again", [90, 0, 110, 70]);
	};

	Test.prototype.test_droppingDivider_permanentlyChangesItemPositions = function() {
		dragAndDrop(divider, 20);
		assertLiPositions("divider -> li 1", [0, 70, 90, 110]);
		dragAndDrop(divider, 40);
		assertLiPositions("divider -> li 2", [0, 20, 90, 110]);
	};

	Test.prototype.test_draggingDivider_modifiesUnderlyingModel = function() {
		drag(divider, 40);
		assertEquals("should notify application model", [3, 2], mockApplicationModel.moveFeatureCalledWith);
	};
}());