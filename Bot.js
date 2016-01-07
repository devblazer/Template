;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Bot', function (Adaptor, Circuit, Arena) {

	var _construct = function(template) {
//		if (!(circuit instanceof Circuit))
//			throw new Error("circuit must be an instance of Circuit");

		var adaptorStates = [];
		var adaptorStatesHash = [];
		this.arena = null;

		this.x = 0;
		this.y = 0;
		this.face = 0;

		this.step = function() {
			template.processAdaptors(this);
		}
		this.getTemplate = function () {
			return template;
		};

		this.setArena = function(arena) {
			if (!(arena instanceof Arena))
				throw new Error("arena must be an instance of Arena");
			this.arena = arena;
		};

		this.setState = function(adaptor,name,value) {
			if (!(adaptor instanceof Adaptor))
				throw new Error("adaptor must be an instance of Adaptor");

			var ind = adaptorStatesHash.indexOf(adaptor);
			if (ind==-1) {
				ind = adaptorStatesHash.length;
				adaptorStates[ind] = {};
				adaptorStatesHash.push(adaptor);
			}
			var state = adaptorStates[ind];

			state[name] = value;
		};
		this.getState = function(adaptor, name) {
			if (!(adaptor instanceof Adaptor))
				throw new Error("adaptor must be an instance of Adaptor");

			var ind = adaptorStatesHash.indexOf(adaptor);
			if (ind==-1)
				return null
			var state = adaptorStates[ind];

			return typeof state[name] == 'undefined' ? null : state[name];
		};


	};

	var proto = _construct.prototype;

	return _construct;
},['Adaptor','Circuit', 'Arena']);