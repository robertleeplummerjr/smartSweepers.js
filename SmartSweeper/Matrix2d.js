(function(SmartSweeper) {

	var Matrix2dData = function() {
		this._11 = 0; this._12 = 0; this._13 = 0;
		this._21 = 0; this._22 = 0; this._23 = 0;
		this._31 = 0; this._32 = 0; this._33 = 0;
	};

	var Matrix2d = function(data) {
		if  (data) {
			this.mat = data;
		} else {
			this.mat = new Matrix2dData();
			this.identity();
		}
	};

	Matrix2d.prototype = {
		identity: function() {
			this.mat._11 = 1; this.mat._12 = 0; this.mat._13 = 0;
			this.mat._21 = 0; this.mat._22 = 1; this.mat._23 = 0;
			this.mat._31 = 0; this.mat._32 = 0; this.mat._33 = 1;
		},
		// What is the purpose of translate.
		// Looks like creates an identity matrix but puts in the
		// x and y  at 31 and 32 respectively.
		translate: function(x, y) {
			var mat = new Matrix2dData();
			mat._11 = 1; mat._12 = 0; mat._13 = 0;
			mat._21 = 0; mat._22 = 1; mat._23 = 0;
			mat._31 = x; mat._32 = y; mat._33 = 1;
			this.mul(new Matrix2d(mat));
		},
		scale: function(xScale, yScale) {
			var mat = new Matrix2dData();
			mat._11 = xScale; mat._12 = 0; mat._13 = 0;
			mat._21 = 0; mat._22 = yScale; mat._23 = 0;
			mat._31 = 0; mat._32 = 0; mat._33 = 1;
			this.mul(new Matrix2d(mat));
		},
		rotate: function(rotation) {
			var mat = new Matrix2dData();
			var sin = Math.sin(rotation);
			var cos = Math.cos(rotation);
			mat._11 = cos; mat._12 = sin; mat._13 = 0;
			mat._21 = -1 * sin; mat._22 = cos; mat._23 = 0;
			mat._31 = 0; mat._32 = 0; mat._33 = 1;
			this.mul(new Matrix2d(mat));
		},
		mul: function(rhs) {
			var matTemp = new Matrix2dData();

			matTemp._11 = (this.mat._11 * rhs.mat._11) + (this.mat._12 * rhs.mat._21) + (this.mat._13 * rhs.mat._31);
			matTemp._12 = (this.mat._11 * rhs.mat._12) + (this.mat._12 * rhs.mat._22) + (this.mat._13 * rhs.mat._32);
			matTemp._13 = (this.mat._11 * rhs.mat._13) + (this.mat._12 * rhs.mat._23) + (this.mat._13 * rhs.mat._33);

			//second
			matTemp._21 = (this.mat._21 * rhs.mat._11) + (this.mat._22 * rhs.mat._21) + (this.mat._23 * rhs.mat._31);
			matTemp._22 = (this.mat._21 * rhs.mat._12) + (this.mat._22 * rhs.mat._22) + (this.mat._23 * rhs.mat._32);
			matTemp._23 = (this.mat._21 * rhs.mat._13) + (this.mat._22 * rhs.mat._23) + (this.mat._23 * rhs.mat._33);

			//third
			matTemp._31 = (this.mat._31 * rhs.mat._11) + (this.mat._32 * rhs.mat._21) + (this.mat._33 * rhs.mat._31);
			matTemp._32 = (this.mat._31 * rhs.mat._12) + (this.mat._32 * rhs.mat._22) + (this.mat._33 * rhs.mat._32);
			matTemp._33 = (this.mat._31 * rhs.mat._13) + (this.mat._32 * rhs.mat._23) + (this.mat._33 * rhs.mat._33);
			this.mat = matTemp;
		},

		// Not sure what this does yet
		// Spoint is a struct with x and y variables
		// So vPoints is a vector of spoints
		// Where are spoints used?
		// What does transform do again?
		transformPoints: function(vPoint) {
			for (var i=0; i < vPoint.length; ++i) {
				var tempX =(this.mat._11 * vPoint[i].x) + (this.mat._21 * vPoint[i].y) + (this.mat._31);
				var tempY = (this.mat._12 * vPoint[i].x) + (this.mat._22 * vPoint[i].y) + (this.mat._32);
				vPoint[i].x = tempX;
				vPoint[i].y = tempY;
			}
		}
	};

	SmartSweeper.Matrix2d = Matrix2d;
}(SmartSweeper));