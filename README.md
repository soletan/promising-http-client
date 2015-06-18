# Promising HTTP Requests

This small library is utilizing bluebird promises to simplify use of HTTP client
implementation shipped with NodeJS.

## Examples

A GET-request might be as simple as this:

```js
require( "promising-http-client" )
	.request( "http://www.somedomain.com/path.html" )
		.spread( function( req, res, document ) {
		
			// req is object providing request information
			// res is object providing response information
			// document is Buffer containing retrieved response body

			// Note! This function is invoked on 404 responses, too, for those
			//       responses being basically valid, too.
		} )
		.catch( function( cause ) {
            // something more essential failed, e.g. connecting server

            // Note! This function is invoked in case of function above was
            //       throwing exception, too.
        } );
```

POST-requests are supported by simply providing some sending callback:

```js

function sender( request ) {
	request.write( "posted data" );
}

require( "promising-http-client" )
	.request( "http://www.somedomain.com/service/endpoint", sender )
		.spread( function( req, res, document ) {
		} )
		.catch( function( cause ) {
        } );
```

