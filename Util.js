;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Util', function () {

	var weight = function(num, exp){
	    var rev = exp < 0;
	    exp = exp===undefined ? 1 : Math.abs(exp)+1;
	    var res = Math.pow(num, exp);
	    return rev ? 1 - res : res;
	}

	return {
		randomWeighted:function(num, exp) {
		    return Math.floor( (typeof exp=='undefined'?Math.random():weight(Math.random(), exp)) * num );
		},
		random:function(num) {
			return this.randomWeighted(num);
		},
		hasParam:function(obj) {
			for (var i in obj)
				if (obj.hasOwnProperty(i)) {
					return true;
				}
			return false;
		},
		isFunction:function(obj) {
			return !!(obj && obj.constructor && obj.call && obj.apply);
		},
		objDistance:function(obj1,obj2) {
			return Math.sqrt(Math.pow(obj2.x-obj1.x,2) + Math.pow(obj2.y-obj1.y,2));
		}
	};
},[]);