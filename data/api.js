/* global self */
const api = (new function () { // eslint-disable-line
  var _this = this;
  var queue = [];

  this.call = function (sender, method, params, onSuccess, onFailure) {
    for (var id = 0; id < queue.length; ++id) { if (!queue[id]) break; }
    queue[id] = ({sender: sender, api: {method: method, params: params}, onSuccess: onSuccess, onFailure: onFailure, sent: false});
    _this.startQueue();
  };

  this.startQueue = function () {
    for (var i = 0; i < queue.length; ++i) {
      if (queue[i] && !queue[i].sent) {
        if (queue[i].sender.onApiBeforeCall) { queue[i].sender.onApiBeforeCall(queue[i].api); }
        self.port.emit('api-call', {index: i, type: queue[i].sender.type, api: queue[i].api, onSuccess: 'api-call-success', onFailure: 'api-call-failure'});
        queue[i].sent = true;
      }
    }
  };

  this.onSuccess = function (call, reply) {
        // console.log('api-call-success '+JSON.stringify(call)+' / '+JSON.stringify(reply));
    if (queue[call.index].sender.onApiSuccess) { queue[call.index].sender.onApiSuccess(call, reply); }
    if (queue[call.index].onSuccess && queue[call.index].sender) { queue[call.index].onSuccess.call(queue[call.index].sender, reply); }

    delete queue[call.index];
  };
  self.port.on('api-call-success', function ({call, reply}) {
    _this.onSuccess(call, reply);
  });

  this.onFailure = function (call, reply) {
    console.error('api-call-failure ' + JSON.stringify(call) + ' / ' + JSON.stringify(reply));
    if (queue[call.index].sender.onApiFailure) { queue[call.index].sender.onApiFailure(call, reply); }
    if (queue[call.index].onFailure) { queue[call.index].onFailure.call(queue[call.index].sender, reply); }

    delete queue[call.index];
  };
  self.port.on('api-call-failure', function ({call, reply}) {
    _this.onFailure(call, reply);
  });
}());
