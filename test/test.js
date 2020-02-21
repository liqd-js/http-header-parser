'use strict';

const assert = require('assert');
const HttpHeaderParser = require('../lib/http_header_parser.js');

describe( 'Tests', ( done ) =>
{
    it('should parse http header string', function()
	{
        let headers = 
            'Date: Mon, 23 May 2005 22:38:34 GMT\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            'Content-Disposition: form-data;\r\n\tname="fieldName";\r\n filename="filename.jpg"\r\n' +
            'Content-Length: 138\r\n' +
            'Last-Modified: Wed, 08 Jan 2003 23:11:55 GMT\r\n' +
            'Server: Apache/1.3.3.7 (Unix) (Red-Hat/Linux)\r\n' +
            'ETag: "3f80f-1b6-3e1cb03b"\r\n' + 
            'Accept-Ranges: bytes\r\n' +
            'Set-Cookie: foo=bar\r\n' +
            'Set-Cookie: bar=foo\r\n' +
            'Set-Cookie: foobar=barfoo\r\n' +
            'Connection: close';

        let result = 
        {
            date: 'Mon, 23 May 2005 22:38:34 GMT',
            'content-type': 'text/html; charset=UTF-8',
            'content-disposition': 'form-data; name="fieldName"; filename="filename.jpg"',
            'content-length': '138',
            'last-modified': 'Wed, 08 Jan 2003 23:11:55 GMT',
            server: 'Apache/1.3.3.7 (Unix) (Red-Hat/Linux)',
            'accept-ranges': 'bytes',
            etag: '"3f80f-1b6-3e1cb03b"',
            'set-cookie': [ 'foo=bar', 'bar=foo', 'foobar=barfoo' ],
            'connection': 'close'
        }

        assert.deepStrictEqual( HttpHeaderParser.parse( headers ), result, 'headers not parsed properly' );
        assert.deepStrictEqual( HttpHeaderParser.parse( headers + '\r\n' ), result, 'headers not parsed properly' );
    });

    it('should not parse after http header string', function()
	{
        let headers = 
            'Date: Mon, 23 May 2005 22:38:34 GMT\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
            'Content-Disposition: form-data;\r\n\tname="fieldName";\r\n filename="filename.jpg"\r\n' +
            'Content-Length: 138\r\n' +
            'Last-Modified: Wed, 08 Jan 2003 23:11:55 GMT\r\n' +
            'Server: Apache/1.3.3.7 (Unix) (Red-Hat/Linux)\r\n' +
            'ETag: "3f80f-1b6-3e1cb03b"\r\n' + 
            'Accept-Ranges: bytes\r\n' +
            'Set-Cookie: foo=bar\r\n' +
            'Set-Cookie: bar=foo\r\n' +
            'Set-Cookie: foobar=barfoo\r\n' +
            'Connection: close';

        let result = 
        {
            date: 'Mon, 23 May 2005 22:38:34 GMT',
            'content-type': 'text/html; charset=UTF-8'
        }

        assert.deepStrictEqual( HttpHeaderParser.parse( headers ), result, 'headers not parsed properly' );
        assert.deepStrictEqual( HttpHeaderParser.parse( headers + '\r\n' ), result, 'headers not parsed properly' );
    });

    it('should parse http header value', function()
	{
        let values = 
        {
            'Mon, 23 May 2005 22:38:34 GMT'                         : [ 'Mon, 23 May 2005 22:38:34 GMT' ],
            'text/html; charset=UTF-8'                              : [ 'text/html', { charset: 'UTF-8' }],
            'form-data; name="fieldName"; filename="filename.jpg"'  : [ 'form-data', { name: 'fieldName' }, { filename: 'filename.jpg' }],
            '138'                                                   : [ '138' ],
            'Apache/1.3.3.7 (Unix) (Red-Hat/Linux)'                 : [ 'Apache/1.3.3.7 (Unix) (Red-Hat/Linux)' ],
            '"3f80f-1b6-3e1cb03b"'                                  : [ '3f80f-1b6-3e1cb03b' ],
            'foo=bar'                                               : [{ foo: 'bar' }],
            'close'                                                 : [ 'close' ]
        }

        for( let [ raw, parsed ] of Object.entries( values ))
        {
            assert.deepStrictEqual( HttpHeaderParser.parseValue( raw ), parsed, 'header value not parsed properly' );
        }
    });

    it('should parse http header value parameter', function()
	{
        assert.deepStrictEqual( HttpHeaderParser.parseValueParameter( 'form-data; name="fieldName"; filename="filename.jpg"', 'foo' ), undefined, 'header value parameter not parsed properly' );
        assert.deepStrictEqual( HttpHeaderParser.parseValueParameter( 'form-data; name="fieldName"; filename="filename.jpg"', 'name' ), 'fieldName', 'header value parameter not parsed properly' );
        assert.deepStrictEqual( HttpHeaderParser.parseValueParameter( 'form-data; name="fieldName"; filename="filename.jpg"', 'filename' ), 'filename.jpg', 'header value parameter not parsed properly' );
    });
});
