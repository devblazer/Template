;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('AdaptorPowerCore', function (Adaptor,Input,Output) {

	var _construct = function() {
		this.type = 'AdaptorPowerCore';
		this.name = 'Power Core';
		this.getCategory = function() {
			return 'power';
		};
		this.description =
			'Generates a total power of:{power} and sends it out each output at a power of {powerPerOutput}.';

		Adaptor.call(this);
		var me = this;
		this.settings = {};

		var setupAdaptor = function() {
			me.addIO(new Output('Power1','#ff0000'),0);
			me.settings.power = 10;
			me.settings.outputs = 1;
			me.settings.powerPerOutput = (me.settings.power/me.settings.outputs).toFixed(2);
		};

		setupAdaptor();

		this.execute = function(bot) {
			this.setOutputPower('Power1',this.settings.power);
		};
	};

	var proto = _construct.prototype = Object.create(Adaptor.prototype);

	return _construct;
},['Adaptor','Input','Output']);