;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('IOPort', function (Adaptor, Util) {
	return function(_name,color){
		this.color = color;
		var power = null;
		this.name = _name;

		this.setAdaptor = function(_adaptor) {
			this.adaptor = _adaptor;
		};
		this.getAdaptor = function() {
			if (!this.adaptor)
				throw new Error("Adaptor not yet set");
			return this.adaptor;
		}

		this.reset = function() {
			power = null;
		}
		this.getPower = function() {
			return power
		};
		this.setPower = function(_power) {
			power = _power;
		};
		this.getName = function() {
			return this.name;
		};
		this.getColor = function() {
			return color;
		};
	};
},['Adaptor','Util']);