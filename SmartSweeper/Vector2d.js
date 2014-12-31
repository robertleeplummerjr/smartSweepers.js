(function(SmartSweeper) {
	"use strict";

	function Vector2d (x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	Vector2d.prototype = {
		add: function (rhs) {
			this.x += rhs.x;
			this.y += rhs.y;
			return this;
		},
		sub: function (rhs) {
			this.x -= rhs.x;
			this.y -= rhs.y;
			return this;
		},
		mul: function (rhs) {
			this.x *= rhs.x;
			this.y *= rhs.y;
			return this;
		},
		div: function (rhs) {
			this.x /= rhs.x;
			this.y /= rhs.y;
			return this;
		}
	};

	SmartSweeper.Vector2d = Vector2d;

	SmartSweeper.Vector2dAdd = function(lhs, rhs) {
		return new SmartSweeper.Vector2d(lhs.x + rhs.x, lhs.y + rhs.y);
	};

	SmartSweeper.Vector2dSub = function(lhs, rhs) {
		return new SmartSweeper.Vector2d(lhs.x - rhs.x, lhs.y - rhs.y);
	};

	SmartSweeper.Vector2dMul = function(lhs, rhs) {
		return new SmartSweeper.Vector2d(lhs.x * rhs.x, lhs.y * rhs.y);
	};

	SmartSweeper.Vector2dDiv = function(lhs, rhs) {
		return new SmartSweeper.Vector2d(lhs.x / rhs.x, lhs.y / rhs.y);
	};

	// Use Pythagorean to find hypotenuse
	SmartSweeper.Vector2dLength = function(vector2d) {
		return Math.sqrt(vector2d.x * vector2d.x + vector2d.y * vector2d.y);
	};

	// Calculate dot product
	SmartSweeper.Vector2dDot = function(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	};

	// Find sign of vector. If positive, the v2 is clockwise of v1.
	// Anticlockwise if negative
	SmartSweeper.Vector2dSign = function(v1, v2) {
		if (v1.y * v2.x > v1.x * v2.y) {
			return 1;
		} else {
			return -1;
		}
	};

	SmartSweeper.Vector2dNormalize = function(v) {
		var vLength = SmartSweeper.Vector2dLength(v);
		v.x = v.x / vLength;
		v.y = v.y / vLength;
		return v;
	};
})(SmartSweeper);