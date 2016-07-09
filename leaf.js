"use strict";

/*:
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2016 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "leaf",
			"path": "leaf/leaf.js",
			"file": "leaf.js",
			"module": "leaf",
			"author": "Richeve S. Bebedor",
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/leaf.git",
			"global": true,
			"class": true
		}
	@end-module-configuration

	@module-documentation:
		Pages are grouped.

		Groups are synonymous to views

		Views are grouped pages.

		But views are not necessarily groups.

		Groups are just representation of composed pages.

		A page can be transferred between groups.

		Pages follow certain order in a group.
	@end-module-documentation

	@include:
		{
			"harden": "harden"
		}
	@end-include
*/

if( typeof window != "undefined" &&
	!( "harden" in window ) )
{
	throw new Error( "harden is not defined" );
}

/*:
	@option:
		{
			"name:required": "string",
			"level": "number",
			"group": "string"
		}
	@end-option
*/
var leaf = function leaf( option ){
	/*:
		@meta-configuration:
			{
				"option:required": [
					"object",
					"string"
				]
			}
		@end-meta-configuration
	*/

	if( !leaf.BOOTED ){
		throw new Error( "leaf is not loaded properly" );
	}

	if( typeof option == "string" &&
		option in leaf.page )
	{
		return leaf.page[ option ];

	}else if( typeof option == "string" ){
		option = { "name": option };

	}else{
		option = option || { };
	}

	var name = option.name;
	if( !name ){
		throw new Error( "name not specified" );
	}

	var page = document.createElement( "div" );
	page.classList.add( "page" );

	page.setAttribute( "name", name );
	page.classList.add( name );

	var group = option.group || "root";

	var view = document.querySelector( "section." + group );
	if( !view ){
		throw new Error( "view does not exists" );
	}

	if( document.querySelector( "section." + group + " > div." + name ) ){
		throw new Error( "page is already in the given group" );
	}

	page.setAttribute( "group", group );
	page.classList.add( group );

	leaf.group[ group ] = leaf.group[ group ] || { };
	leaf.data.group[ group ] = leaf.data.group[ group ] || { };

	if( leaf.group[ group ][ name ] ){
		throw new Error( "page is already in the given group" );
	}

	leaf.resolveGroup( {
		"group": group,
		"level": option.level,
		"name": name,
		"page": page
	} );

	page.setAttribute( "style", [
		"display: flex;",
		"flex-direction: row;",

		"position: absolute;",

		"width: 100vw;",
		"height: 100vh;",

		"border: 0;",
		"padding: 0px;",
		"margin: 0px;",

		"float: none;"
	].join( " " ) );

	page.classList.add( "hidden" );

	leaf.page[ name ] = page;

	view.appendChild( page );

	return page;
};

harden( "data", leaf.data || { }, leaf );

/*:
	This will be the collection of pages.

	No indexes will be on this page.
*/
harden( "page", leaf.page || { }, leaf );

/*:
	This will be a collection of page groups.
	Each group is a collection of pages.

	A group can be synonymous to views.

	Groups represent a parent element where the page
		is contained.

	Groups will contain the names and indexes of the page.
*/
harden( "group", leaf.group || { }, leaf );

harden( "boot",
	function boot( ){
		//: This will be the group when the page is not given any group.
		harden( "root", leaf.group.root || { }, leaf.group );

		harden( "group", leaf.data.group || { }, leaf.data );

		if( !document.querySelector( "style.root" ) ){
			var style = document.createElement( "style" );

			style.setAttribute( "name", "root" );
			style.classList.add( "root" );
			style.appendChild( document.createTextNode( "" ) );
			document.head.appendChild( style );

			harden( "sheet", style.sheet, leaf );

		}else{
			var sheet = document.querySelector( "style.root" ).sheet;
			if( sheet ){
				harden( "sheet", sheet, leaf );

			}else{
				throw new Error( "cannot find root style" );
			}
		}

		try{
			leaf.sheet.insertRule( ".hidden" + JSON.stringify( {
				"display": "none !important",

				"width": "0px !important",
				"height": "0px !important",

				"opacity": "hidden !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

			leaf.sheet.insertRule( "div.page" + JSON.stringify( {
				"display": "flex !important",

				"position": "absolute !important",

				"border": "0 !important",
				"padding": "0px !important",
				"margin": "0px !important",

				"float": "none !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

		}catch( error ){
			console.debug( "unexpected error when inserting rule", error );
		}

		harden( "BOOTED", "booted", leaf );

		return leaf;
	}, leaf );

harden( "show",
	function show( name ){
		if( name in leaf.page ){
			var page = leaf.page[ name ];

			var group = page.getAttribute( "group" );

			page.classList.remove( "hidden" );

			var level = parseInt( page.getAttribute( "level" ) );
			page.style.zIndex = level;

		}else{
			console.debug( "cannot find page", name );
		}

		return leaf;
	}, leaf );

harden( "hide",
	function hide( name ){
		if( name in leaf.page ){
			leaf.page[ name ].classList.add( "hidden" );

		}else{
			console.debug( "cannot find page", name );
		}

		return leaf;
	}, leaf );

/*:
	We separated the complicated procedure of resolving the group index.
*/
harden( "resolveGroup",
	function resolveGroup( option ){
		var name = option.name;

		if( !name ){
			throw new Error( "name not specified" );
		}

		var group = option.group;

		if( !group ){
			throw new Error( "group not specified" );
		}

		leaf.group[ group ] = leaf.group[ group ] || { };

		var page = option.page || leaf.group[ group ][ name ] || leaf.page[ name ];

		if( !page ){
			throw new Error( "page not specified" );
		}

		leaf.data.group[ group ] = leaf.data.group[ group ] || { };

		/*:
			This is the current count of the pages in the group from zero.
			This may represent the current count of pages in the group.
		*/
		var groupIndex = leaf.data.group[ group ].index || 0;
		/*:
			This is the stationary high value index and
				does not represent the curent count of the pages in a group.
		*/
		var lastIndex = leaf.data.group[ group ].last || 0;

		var level = option.level || groupIndex
		page.setAttribute( "level", level );

		var viewLevel = parseInt( document.querySelector( "section." + group )
			.getAttribute( "level" ) ) || 0;
		page.style.zIndex = viewLevel * level;

		//: The given level overrides the current group index.
		groupIndex = level;

		//: The last index may be the group index but it will change because of the given level.
		if( groupIndex > lastIndex ){
			lastIndex = groupIndex;
		}

		var index = 0;
		while( leaf.group[ group ][ index ] ){
			index++;
		}
		/*:
			The last index may not be the last one based on the registered pages in the group.

			This will confuse anyone in the future, we did this because
				we will never know what is the last index. It is safe to assume
				that the last index can be at the last space or/and with the highest value.
		*/
		if( lastIndex > index ){
			lastIndex = index;
		}

		//: Group index must not be occupied.
		while( leaf.group[ group ][ groupIndex ] ){
			//: If the group index and last index is equal and it is occupied then move one index.
			if( leaf.group[ group ][ groupIndex ] &&
				lastIndex == groupIndex )
			{
				lastIndex++;
			}

			/*:
				If the given last index is not occupied
					and the group index is occupied replace them over
					and free the group index.
			*/
			if( leaf.group[ group ][ groupIndex ] &&
				!leaf.group[ group ][ lastIndex ] &&
				lastIndex > groupIndex )
			{
				leaf.group[ group ][ lastIndex ] = leaf.group[ group ][ groupIndex ];
				leaf.group[ group ][ groupIndex ] = null;
			}
		}

		leaf.group[ group ][ name ] = page;
		leaf.group[ group ][ groupIndex ] = page;
		page.setAttribute( "index", groupIndex );

		var index = 0;
		while( leaf.group[ group ][ index ] ){
			index++;
		}
		//: The current group index must be empty.
		leaf.data.group[ group ].index = index;

		var nextIndex = 0;
		Object.keys( leaf.data.group[ group ] )
			.filter( function onEachKey( key ){
				return ( /^\d+$/ ).test( key.toString( ) );
			} )
			.forEach( function onEachIndex( index ){
				index = parseInt( index );

				if( index > nextIndex ){
					nextIndex = index;
				}
			} );
		//: The highest value index is the last index.
		leaf.data.group[ group ].last = nextIndex;

		return leaf;
	}, leaf );

/*:
	This will arrange the z-index of the pages based on their index.
*/
harden( "cascade",
	function cascade( group ){
		group = group || "root";

		var view = document.querySelector( "section." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		if( !leaf.data.group[ group ] ){
			console.debug( "cannot find group", group );

			return leaf;
		}

		Object.keys( leaf.data.group[ group ] )
			.filter( function onEachKey( key ){
				return ( /^\d+$/ ).test( key.toString( ) );
			} )
			.forEach( function onEachIndex( index ){
				index = parseInt( index );

				var page = leaf.group[ group ][ index ];

				page.setAttribute( "level", index );
				page.setAttribute( "index", index );

				var viewLevel = parseInt( view.getAttribute( "level" ) );
				page.style.zIndex = viewLevel * index;
			} );

		return leaf;
	}, leaf );

/*:
	Remove the page from the group.
*/
harden( "tear",
	function tear( name, group ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		var page = leaf.page[ name ];

		if( !page ){
			throw new Error( "page does not exists" );
		}

		group = group || "root";

		var view = document.querySelector( "section." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		//: Ensure that the given group is the same with the current page group.
		var _group = page.getAttribute( "group" );
		if( group != _group &&
			document.querySelector( "section." + _group + " > div." + name ) )
		{
			group = _group;
		}

		if( !document.querySelector( "section." + group + " > div." + name ) ){
			throw new Error( "page is not in the given group" );
		}

		leaf.cascade( group );

		var index = parseInt( page.getAttribute( "level" ) );
		delete leaf.group[ group ][ name ];
		delete leaf.group[ group ][ index ];

		page.removeAttribute( "group" );
		page.removeAttribute( "level" );
		page.removeAttribute( "index" );
		page.classList.remove( group );

		view.removeChild( page );

		leaf.hide( name );

		return leaf;
	}, leaf );

/*:
	Add the page to the group.
*/
harden( "tape",
	function tape( name, group ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		var page = leaf.page[ name ];

		if( !page ){
			throw new Error( "page does not exists" );
		}

		group = group || "root";

		var view = document.querySelector( "section." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		//: Ensure that the page is not yet in the group
		var _group = page.getAttribute( "group" );
		if( _group ){
			throw new Error( "page is not yet torn" );
		}

		if( _group &&
			( group == _group ||
			document.querySelector( "section." + group + " > div." + name ) ||
			document.querySelector( "section." + _group + " > div." + name ) ) )
		{
			throw new Error( "page is already in the given group" );
		}

		leaf.group[ group ] = leaf.group[ group ] || { };
		leaf.data.group[ group ] = leaf.data.group[ group ] || { };

		if( leaf.group[ group ][ name ] ){
			throw new Error( "page is already in the given group" );
		}

		leaf.cascade( group );

		page.setAttribute( "group", group );
		page.classList.add( group );

		leaf.resolveGroup( {
			"group": group,
			"name": name,
			"page": page
		} );

		view.appendChild( page );

		leaf.hide( name );

		return leaf;
	}, leaf );

/*:
	Tear and tape the page to another group.
*/
harden( "transfer",
	function transfer( name, group ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		group = group || "root";

		var view = document.querySelector( "section." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		var page = leaf.page[ name ];

		if( !page ){
			throw new Error( "page does not exists" );
		}

		var oldGroup = page.getAttribute( "group" );

		leaf.tear( name, oldGroup )
			.tape( name, group );

		leaf.cascade( group );

		return leaf;
	}, leaf );
