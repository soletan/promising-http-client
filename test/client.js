var vows = require( "vows" ),
    assert = require( "assert" ),
	promise = require( "bluebird" );


var useCases = {
	validHttp: function() {
		return require( "../lib/client" ).request( "http://github.com/" );
	},
	validHttps: function() {
		return require( "../lib/client" ).request( "https://github.com/" );
	},
	invalid: function() {
		return require( "../lib/client" ).request( "http://www.hopefully.unknown.service.at.github.com/" );
	},
	unsupported: function() {
		return require( "../lib/client" ).request( "abcd://github.com/" );
	}
};

var promiseStats = function( p, cb ) {
	return function() {
		cb( null, {
			pending: p.isPending(),
			fulfilled: p.isFulfilled(),
			rejected: p.isRejected()
		} );
	};
};


var respondingSubContext = {
	topic: function( request ) {
		var done = this.callback;

		request.spread( function( req, res, doc ) {
			done( null, req, res, doc );
		} );
	},

	"with request object": function( err, request, response, document ) {
		assert.isObject( request );
	},
	"with response meta information": function( err, request, response, document ) {
		assert.isObject( response );
	},
	"with response document": function( err, request, response, document ) {
		assert.isDefined( document );
	},
	"with status code indicating success": function( err, request, response, document ) {
		assert.isDefined( response.statusCode );
		assert.lesser( response.statusCode, 400 );
		assert.greater( response.statusCode, 199 );
	},
	"with headers": function( err, request, response, document ) {
		assert.isObject( response.headers );
		assert.isTrue( !!response.headers );
	},
	"with document": function( err, request, response, document ) {
		assert.isDefined( document );
		assert.isNotNull( document );
		assert.isObject( document );
		assert.instanceOf( document, Buffer );
		assert.isFunction( document.toString );
	},
	"properly": function( err, request, response, document ) {
		switch ( response.statusCode ) {
			case 200 :
				assert.greater( document.toString( "utf-8" ).length, 0 );
				break;

			case 301 :
				assert.isString( response.headers.location );
				assert.greater( response.headers.location.length, 0 );
				break;

			default :
				assert.equal( response.statusCode, 200 );
		}
	}
};


vows.describe( "client" )
	.addBatch( {

		"Requesting valid http-URL": {
			topic: useCases.validHttp,

			"delivering promise": {
				topic: function( request ) { return request; },

				"is actually promising": function( promise ) {
					assert.isFunction( promise.then );
					assert.isFunction( promise.catch );
				}
			},

			"is settling promise": {
				topic: function( request ) {
					var done = promiseStats( request, this.callback );
					request.then( done, done );
				},

				"to be fulfilled": function( state ) {
					assert.isTrue( state.fulfilled );
				},
				"not to be rejected": function( state ) {
					assert.isFalse( state.rejected );
				}
			},

			"is responding": respondingSubContext
		},

		"Requesting valid https-URL": {
			topic: useCases.validHttp,

			"delivering promise": {
				topic: function( request ) { return request; },

				"is actually promising": function( promise ) {
					assert.isFunction( promise.then );
					assert.isFunction( promise.catch );
				}
			},

			"is settling promise": {
				topic: function( request ) {
					var done = promiseStats( request, this.callback );
					request.then( done, done );
				},

				"to be fulfilled": function( state ) {
					assert.isTrue( state.fulfilled );
				},
				"not to be rejected": function( state ) {
					assert.isFalse( state.rejected );
				}
			},

			"is responding": respondingSubContext
		},

		"Requesting invalid URL": {
			topic: useCases.invalid,

			"delivering promise": {
				topic: function( request ) { return request; },

				"is actually promising": function( promise ) {
					assert.isFunction( promise.then );
					assert.isFunction( promise.catch );
				}
			},

			"is settling promise": {
				topic: function( request ) {
					var done = promiseStats( request, this.callback );
					request.then( done, done );
				},

				"to be fulfilled":    function( state ) {
					assert.isTrue( state.fulfilled );
				},
				"not to be rejected": function( state ) {
					assert.isFalse( state.rejected );
				}
			},

			"is responding": {
				topic: function( request ) {
					var done = this.callback;

					request.spread( function( req, res, doc ) {
						done( null, req, res, doc );
					} );
				},

				"with request object": function( err, request, response, document ) {
					assert.isObject( request );
				},
				"with response meta information": function( err, request, response, document ) {
					assert.isObject( response );
				},
				"with response document": function( err, request, response, document ) {
					assert.isDefined( document );
				},
				"with status code indicating 'Not Found'": function( err, request, response, document ) {
					assert.isDefined( response.statusCode );
					assert.equal( response.statusCode, 404 );
				},
				"with headers": function( err, request, response, document ) {
					assert.isObject( response.headers );
					assert.isTrue( !!response.headers );
				},
				"with document": function( err, request, response, document ) {
					assert.isDefined( document );
					assert.isNotNull( document );
					assert.isObject( document );
					assert.instanceOf( document, Buffer );
					assert.isFunction( document.toString );
				},
				"properly": function( err, request, response, document ) {
					assert.greater( document.toString( "utf-8" ).length, 0 );
					console.log( String( document ) );
				}
			}
		},

		"Requesting unsupported URL": {
			topic: useCases.unsupported,

			"delivering promise": {
				topic: function( request ) {
					// make sure expected exception isn't disturbing
					return request.catch( function() {} );
				},

				"is actually promising": function( promise ) {
					assert.isFunction( promise.then );
					assert.isFunction( promise.catch );
				}
			},

			"is settling promise": {
				topic: function( request ) {
					var done = promiseStats( request, this.callback );
					request.then( done, done );
				},

				"not to be fulfilled": function( state ) {
					assert.isFalse( state.fulfilled );
				},
				"to be rejected": function( state ) {
					assert.isTrue( state.rejected );
				}
			}
		}

	} )
	.export( module );
