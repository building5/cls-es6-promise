// Copyright (c) 2015. David M. Lee, II
'use strict';

var shimmer = require('shimmer');

var Promise = require('es6-promise').Promise;

module.exports = function(ns) {
  shimmer.wrap(Promise.prototype, 'then', function(then) {
    return function(onSuccess, onRejection) {

      if (typeof onSuccess === 'function') {
        onSuccess = ns.bind(onSuccess);
      }

      if (typeof onRejection === 'function') {
        onRejection = ns.bind(onRejection);
      }

      return then.call(this, onSuccess, onRejection);
    };
  });
};
