;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('AdaptorConduit', function (Adaptor,Input,Output) {

	var _construct = function() {
		this.type = 'AdaptorConduit';
		this.name = 'Conduit';
		this.getCategory = function() {
			return 'flow';
		};
		this.description =
			'Takes power from the red input and pushes it out the green output.';

		Adaptor.call(this);
		var me = this;
		this.settings = {};

		var setupAdaptor = function() {
			me.addIO(new Input('Input','#ff0000'),3);
			me.addIO(new Output('Output','#00ff00'),0);
		};

		setupAdaptor();

		this.execute = function(bot) {
			this.setOutputPower('Output',this.getInputPower('Input'));
		};
	};

	var proto = _construct.prototype = Object.create(Adaptor.prototype);

	return _construct;
},['Adaptor','Input','Output']);