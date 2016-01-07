;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Input', function (IOPort) {
	var _construct = function(name,color) {
		IOPort.call(this,name,color);
		this.adaptor = null;

		var connected = null;

		this.disconnect = function(isRemote) {
			if (connected && !isRemote)
				connected.disconnect(true);
			connected = null;
		};
		this.connectTo = function(adaptor,slot) {
			if (connected)
				throw new Error("Already connected");

			var remoteIO = adaptor.getOrientedIOBySlot(slot);
			if (!remoteIO)
				return {correctFit:true,connector:null};
			else if (!(remoteIO instanceof getOutputClass()))
				return {correctFit:false,connector:null};

			remoteIO.connectFrom(this);
			connected = remoteIO;
			return {correctFit:true,connector:connected};
		};
		this.connectFrom = function(output) {
			if (connected)
				throw new Error("Remote already connected");
			connected = output;
		};
		this.isConnected = function() {
			return !!connected;
		};
		this.getConnected = function() {
			return connected;
		};
	};

	var proto = _construct.prototype = Object.create(IOPort.prototype);

	window.getInputClass = function() {
		return _construct;
	};
	return _construct;
},['IOPort']);