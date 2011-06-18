// Copyright (C) 2011 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

(function() {
	var Test = new TestCase("FeaturesDom");
	var config;
	var estimates;
	var featuresDom;
	var ul;
	var li;
	var divider;

	function populate() {
		featuresDom = new rabu.schedule.FeaturesDom($(".rabu-features"), estimates);
		featuresDom.populate();
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

	function dragElementTo(jQueryElement, position) {
		var cursorOffset = 8;

		var downEvent = new jQuery.Event();
		downEvent.pageX = 0;
		downEvent.pageY = jQueryElement.offset().top + cursorOffset;
		downEvent.which = 1;
		downEvent.type = "mousedown";
		jQueryElement.trigger(downEvent);

		var moveEvent = new jQuery.Event();
		moveEvent.pageX = 0;
		moveEvent.pageY = position + cursorOffset;
		moveEvent.type = "mousemove";
		jQueryElement.trigger(moveEvent);

//		jQueryElement.mouseup();
	}
	
	Test.prototype.setUp = function() {
		/*:DOC +=   <style type='text/css'>
						li { height: 20px }
						ul { margin: 0; }
						body { margin: 0; }
						.rabu-divider { margin-top: 34px; padding-top: 16px; }
					</style>  */
		/*:DOC +=   <ul class="rabu-features"></ul> */
		/*:DOC +=   <div class="rabu-divider"></div> */
		config = {
			included: [
				["completed", 0],
				["feature A", 70],
				["feature B", 30]
			],
			excluded: [
				["excluded 1", 20]
			]
		};
		estimates = new rabu.schedule.Estimates({iterations: [config]});
		populate();

		assertEquals("assumption: li height", 20, li.first().outerHeight(true));
		assertEquals("assumption: ul top", 0, ul.offset().top);
		assertEquals("assumption: first li top", 0, li.first().offset().top);
		assertEquals("assumption: divider height", 50, divider.outerHeight(true));
	};

	Test.prototype.test_populate_createsFeatureList = function() {
		assertEquals("li #0 text", "completed", $(li[0]).text());
		assertEquals("li #1 text", "feature A", $(li[1]).text());
		assertEquals("li #2 text", "feature B", $(li[2]).text());
		assertEquals("li #3 text", "excluded 1", $(li[3]).text());
	};

	Test.prototype.test_populate_isIdempotent = function() {
		populate();
		populate();
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

	Test.prototype.test_populate_positionsDivider = function() {
		config.excluded[1] = ["excluded 2", 30];
		populate();

		assertLiPositions("excluded features should be positioned below divider", [0, 20, 40, 110, 130]);
		assertEquals("divider should use absolute positioning", "absolute", divider.css("position"));
		assertEquals("divider should be centered in gap", 94, divider.offset().top);
	};

	Test.prototype.test_populate_positionsDividerAtBottomOfListWhenNoExcludedFeatures = function() {
		config.excluded = undefined;
		populate();

		assertLiPositions("li positions", [0, 20, 40]);
		assertEquals("divider position", 94, divider.offset().top);
	};

	Test.prototype.test_populate_positionsDividerAtTopOfListWhenNoIncludedFeatures = function() {
		config.included = undefined;
		config.excluded[1] = ["excluded 2", 30];
		populate();

		assertLiPositions("li positions", [50, 70]);
		assertEquals("divider position", 34, divider.offset().top);
	};

	Test.prototype.test_populate_resizesListToAccomodateDivider = function() {
		assertEquals("height of list should accomodate divider", 130, ul.outerHeight(true));
		ul.css("padding-bottom", "20px");
		ul.css("margin-bottom", "16px");
		populate();
		assertEquals("divider should accomodate existing padding and margins", 166, ul.outerHeight(true));
	};

	Test.prototype.test_populate_makesFeaturesDraggable = function() {
		function option(key) { return $(li).draggable("option", key); }
		assertTrue("should be draggable", $(li).hasClass("ui-draggable"));
		assertEquals("constrained vertically", "y", option("axis"));
		assertEquals("top", 0, option("containment")[1]);
		assertEquals("bottom", 80, option("containment")[3]);
		assertEquals("scroll speed", 10, option("scrollSpeed"));
		assertEquals("cursor should be centered on divider", 8, option("cursorAt").top);
	};

	Test.prototype.test_dragging_repositionsFeatureBeingDragged = function() {
//		dragElementTo($(li[0]), 50);
//		assertEquals("element position", 50, $(li[0]).offset().top);
	};

	function assertDrag(message, element, dragTo, expectedResult) {
		dragElementTo($(element), dragTo);
		assertLiPositions(message, expectedResult);
	}

	Test.prototype.test_dragging = function() {
		assertDrag("should not move before crossing halfway point", li[0], 10, [10, 20, 40, 110]);
		assertDrag("should move after crossing halfway point", li[0], 11, [11, 0, 40, 110]);
		assertDrag("should be idempotent", li[0], 12, [12, 0, 40, 110]);
	};

	Test.prototype.test_draggingUp_li0 = function() {
		assertDrag("li 0 -> li 0", li[0], 1, [1, 20, 40, 110]);
		assertDrag("li 0 -> li 1", li[0], 21, [21, 0, 40, 110]);
		assertDrag("li 0 -> li 2", li[0], 41, [41, 0, 20, 110]);
	};

	Test.prototype.test_draggingUp_li1 = function() {
		assertDrag("li 1 -> li 1", li[1], 21, [0, 21, 40, 110]);
		assertDrag("li 1 -> li 2", li[1], 41, [0, 41, 20, 110]);
	};

	Test.prototype.test_draggingUp_li2 = function() {
		assertDrag("li 2 -> li 2", li[2], 41, [0, 20, 41, 110]);
	};

	Test.prototype.test_draggingUp_toLastElement = function() {
		config.excluded = undefined;
		populate();
		assertDrag("up to last element", li[0], 41, [41, 0, 20]);
		assertDrag("up past legal bounds", li[0], 100, [60, 0, 20]);
	};

//	Test.prototype.test_draggingDown_li0 = function() {
//		assertDrag("li 0 -> li 0", li[0], 1, [1, 20, 40, 110]);
//	};
//
//	Test.prototype.test_draggingDown_li1 = function() {
//		assertDrag("li 1 -> li 1", li[1], 21, [0, 21, 40, 110]);
//		assertDrag("li 1 -> li 0", li[1], 1, [20, 1, 40, 110]);
//	};

	Test.prototype.test_dragging_repositionsDivider = function() {
		// TODO
	};

	Test.prototype.test_dragging_respectsVariableHeightListItems = function() {
		// TODO
	};
}());