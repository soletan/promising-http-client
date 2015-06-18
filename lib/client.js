

var PROMISE = require( "bluebird" );

exports.request = function( url, senderFn ) {

	if ( typeof url === "string" ) {
		url = require( "url" ).parse( url );
	} else if ( typeof url !== "object" || !url ) {
		throw new TypeError( "invalid request URL" );
	}

	if ( arguments.length > 1 ) {
		if ( typeof senderFn !== "function" ) {
			throw new TypeError( "invalid data-sending provider callback" );
		}
	}


	return new PROMISE( function( resolve, reject ) {

		var req;

		function handler( res ) {
			var data = new Buffer( 0 );

			res.on( "data", function( chunk ) {
				data = Buffer.concat( [ data, chunk ] );
			} );

			res.on( "end", function() {
				resolve( [ req, res, data ] );
			} );
		}


		switch ( url.protocol ) {
			case "http:" :
				req = require( "http" ).request( url, handler );
				break;

			case "https:" :
				req = require( "https" ).request( url, handler );
				break;

			default :
				reject( new TypeError( "unsupported URL scheme" ) );
		}

		req.on( "error", function( error ) {
			reject( error );
		} );

		if ( senderFn ) {
			PROMISE.resolve( senderFn( req ) )
				.then( function() {
					req.end();
				} )
				.catch( function( cause ) {
					reject( cause );
				} );
		} else {
			req.end();
		}
	} );
};
