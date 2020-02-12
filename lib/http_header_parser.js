'use strict';

const RE = 
{
    header      : /(?<name>[\w-]+):\s*(?<value>.*?)(\r\n(?![\t ])|$)/sg,
    continuation: /[\t ]*\r\n[\t ]+/g,
    header_part : /\s*(?<value>([^;]|"(\\.|[^"\\])+")+)\s*(;|$)/g,
    parameter   : /^\s*(?<name>([^=]|"(\\.|[^"\\])+")+?)\s*=\s*(?<value>([^=]|"(\\.|[^"\\])+")+?)\s*$/
}

const unescape = ( str ) => str[0] === '"' ? JSON.parse( str ) : str;

let cache_value_raw, cache_value_parsed;

module.exports = class HttpHeaderParser
{
    static parse( header )
    {
        let headers = {};

        for( let entry of header.matchAll( RE.header ))
        {
            let name = entry.groups.name.toLowerCase(), value = entry.groups.value.replace( RE.continuation, ' ' );

            if( headers.hasOwnProperty( name ))
            {
                if( !Array.isArray( headers[ name ]))
                {
                    headers[ name ] = [ headers[ name ]];
                }

                headers[ name ].push( value );
            }
            else
            {
                headers[ name ] = value;
            }
        }

        return headers;
    }

    static parseValue( value )
    {
        if( cache_value_raw === value ){ return cache_value_parsed }

        let parts = [];

        for( let part of value.matchAll( RE.header_part ))
        {
            let parameter = part.groups.value.match( RE.parameter );

            if( parameter )
            {
                parts.push({[ unescape( parameter.groups.name )] : unescape( parameter.groups.value )});
            }
            else
            {
                parts.push( unescape( part.groups.value ));
            }
        }

        cache_value_raw = value; cache_value_parsed = parts;

        return parts;
    }

    static parseValueParameter( value, parameter )
    {
        let parts = this.parseValue( value );
        let part = parts.find( p => typeof p === 'object' && p.hasOwnProperty( parameter ));

        if( part )
        {
            return part[ parameter ];
        }
    }
}