;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('AdaptorSwitcher', function (Adaptor,Input,Output) {

	var _construct = function() {
		this.type = 'AdaptorSwitcher';
		this.name = 'Switcher';
		this.description =
			'Takes power from both inputs and pushes it out the currently selected output (power-1).<br />' +
			'When starting, the yellow output is selected (Output1).' +
			'Each time power > 1 is applied to the blue input, the adaptor switches over to the next output (once per cycle).<br />' +
			'When the adaptor switches from the last output: Output{switchedOutputs}, it will switch back to the first output again.<br />' +
			'When a cycle starts, the adaptor is first switched to the next output (if blue input powered) and then power flows out of it.';

		Adaptor.call(this);
		var me = this;
		this.settigns = {};

		var setupAdaptor = function() {
			me.addIO(new Input('Switch','#0000ff'),3);
			me.addIO(new Input('Power','#ff0000'),4);
			me.addIO(new Output('Output1','#ffff00'),5);
			me.addIO(new Output('Output2','#ff8800'),0);
			me.addIO(new Output('Output3','#ff0000'),1);
			me.addIO(new Output('Output4','#ff0088'),2);
			me.settings.switchedOutputs = 4;
		};

		setupAdaptor();

		this.setupState = function(bot) {
			bot.setState(this,'switchPosition',0);
		};

		this.execute = function(bot) {
			var switchPower = this.getInputPower('Switch');
			var switchPosition = bot.getState(this,'switchPosition');
			if (switchPower>1) {
				switchPosition++;
				if (switchPosition>=this.settings.switchedOutputs)
					switchPosition = 0;
				bot.setState(this,'switchPosition',switchPosition);
			}
			this.setOutputPower(
				'Output'+(switchPosition+1),
				Math.max(0,this.getInputPower('Power') + switchPower-1)
			);
		};
	};

	var proto = _construct.prototype = Object.create(Adaptor.prototype);

	return _construct;
},['Adaptor','Input','Output']);