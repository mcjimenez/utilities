'use strict';

const CONN_SIMULT = 101;


var fork = require('child_process').fork;
var children = [];
for (var i = 0; i < CONN_SIMULT; i++) {
  children.push(fork('./oneConnection'));
}
