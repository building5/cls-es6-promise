// Copyright (c) 2015. David M. Lee, II
'use strict';

var chai = require('chai');
var cls = require('continuation-local-storage');
var Promise = require('es6-promise').Promise;
var expect = chai.expect;
var assert = chai.assert;
var ns = cls.createNamespace('test');

// chai config
chai.use(require('dirty-chai'));
chai.config.includeStack = true;

function Deferred() {
  var _this = this;
  this.promise = new Promise(function(resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
}

describe('The es6-promise library', function() {
  var rootContext;
  var deferred;

  before(function() {
    rootContext = ns.createContext();
  });

  beforeEach(function() {
    deferred = new Deferred();
  });

  // reset context after each run
  afterEach(function(done) {
    done = ns.bind(done, rootContext);
    done();
  });

  // *** unshimmed tests ***
  describe('when not shimmed', function() {
    describe('when a promise is resolved', function() {
      it('should not maintain context', function() {
        var results = [];

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'original');
          results.push(deferred.promise.then(function() {
            expect(ns.get('context')).to.not.equal('original');
          }));
        });

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'resolving context');

          results.push(deferred.promise.then(function() {
            expect(ns.get('context')).to.equal('resolving context');
          }));

          process.nextTick(deferred.resolve.bind(deferred));
        });

        return Promise.all(results);
      });
    });

    describe('when a promise is rejected', function() {
      it('should not maintain context', function() {
        var results = [];

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'original');
          results.push(deferred.promise.catch(function() {
            expect(ns.get('context')).to.not.equal('original');
          }));
        });

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'resolving context');

          results.push(deferred.promise.catch(function() {
            expect(ns.get('context')).to.equal('resolving context');
          }));

          process.nextTick(deferred.reject.bind(deferred, new Error()));
        });

        return Promise.all(results);
      });
    });
  });

  // *** shimmed tests ***
  describe('when shimmed', function() {
    before(function loadShim() {
      require('..')(ns);
    });

    describe('when a promise is resolved', function() {
      it('should maintain context', function() {
        var results = [];

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'original');
          results.push(deferred.promise.then(function() {
            expect(ns.get('context')).to.equal('original');
          }));
        });

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'resolving context');

          results.push(deferred.promise.then(function() {
            expect(ns.get('context')).to.equal('resolving context');
          }));

          process.nextTick(deferred.resolve.bind(deferred));
        });

        return Promise.all(results);
      });
    });

    describe('when a promise is rejected', function() {
      it('should maintain context', function() {
        var results = [];

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'original');
          results.push(deferred.promise.catch(function() {
            expect(ns.get('context')).to.equal('original');
          }));
        });

        ns.run(function() {
          expect(ns.get('context')).to.not.exist();
          ns.set('context', 'resolving context');

          results.push(deferred.promise.catch(function() {
            expect(ns.get('context')).to.equal('resolving context');
          }));

          process.nextTick(deferred.reject.bind(deferred, new Error()));
        });

        return Promise.all(results);
      });
    });

    describe('when initial promise rejects in a chain', function() {

      describe('and the initial handler has no onFailure handler', function() {

        it('passes original error to eventual failure handler', function() {
          var originalError = new Error('fail');
          function shouldFail() {
            return Promise.reject(originalError);
          }

          return shouldFail().then(function() {
            assert.fail('should not resolve');
          }).catch(function(err) {
            expect(err).to.equal(originalError);
          });
        });
      });
    });

    describe('when initial promise resolves in a chain', function() {

      describe('and the intial handler has no onSuccess handler', function() {

        it('does not generate an error', function() {
          var originalResult = { foo: 'bar' };
          function shouldResolve() {
            return Promise.resolve(originalResult);
          }

          return shouldResolve().catch(function() {
            assert.fail('should not reject');
          }).catch(function(err) {
            expect(err).to.not.exist();
          });
        });
      });
    });
  });
});
