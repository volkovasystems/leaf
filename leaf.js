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

		This module assumes that pages will be placed
			inside section elements classed as views.
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

harden( "MAXIMUM_PAGE_LEVEL", 2147483647 );
harden( "MAXIMUM_PAGE_INDEX", 2147483647 );

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

	var parameter = arguments[ 0 ];
	if( typeof parameter == "string" &&
		parameter in leaf.page )
	{
		return leaf.page[ parameter ];

	}else if( typeof parameter == "string" ){
		option = { "name": parameter };

	}else{
		option = option || { };
	}

	var name = option.name;
	if( !name ){
		throw new Error( "name not specified" );
	}

	var group = option.group || "root";

	var view = document.querySelector( "section.view." + group );
	if( !view ){
		throw new Error( "view does not exists" );
	}

	if( document.querySelector( "section.view." + group + " > div.page." + name ) ){
		throw new Error( "page is already in the view" );
	}

	if( !( group in leaf.group ) ){
		harden( group, leaf.group[ group ] || { }, leaf.group );
	}

	if( leaf.group[ group ][ name ] ){
		throw new Error( "page is already in the given group" );
	}

	if( !( group in leaf.data.group ) ){
		harden( group, leaf.data.group[ group ] || { }, leaf.data.group );
	}

	var page = document.createElement( "div" );
	page.classList.add( "page" );

	page.setAttribute( "name", name );
	page.classList.add( name );

	page.setAttribute( "group", group );
	page.classList.add( group );

	var level = option.level;
	if( level > MAXIMUM_PAGE_LEVEL ){
		throw new Error( "maximum page level" );
	}
	leaf.resolveGroup( {
		"group": group,
		"level": level,
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

		"float: none;",

		"pointer-events: none;"
	].join( " " ) );

	page.classList.add( "hidden" );

	leaf.page[ name ] = page;

	view.appendChild( page );

	return page;
};

/*:
	This will be the collection of pages.

	No indexes will be on this page.
*/
harden( "page", leaf.page || { }, leaf );

harden( "data", leaf.data || { }, leaf );
harden( "group", leaf.data.group || { }, leaf.data );

/*:
	This will be a collection of page groups.
	Each group is a collection of pages.

	A group can be synonymous to views.

	Groups represent a parent element where the page
		is contained.

	Groups will contain the names and indexes of the page.
*/
harden( "group", leaf.group || { }, leaf );

/*:
	This will be the group when the page is not given any group.

	This will be the root view or group.
*/
harden( "root", leaf.group.root || { }, leaf.group );

harden( "boot",
	function boot( ){
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

				"opacity": "hidden !important",

				"pointer-events": "none !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

			leaf.sheet.insertRule( "div.page" + JSON.stringify( {
				"display": "flex !important",

				"position": "absolute !important",

				"border": "0 !important",
				"padding": "0px !important",
				"margin": "0px !important",

				"float": "none !important",

				"pointer-events": "none !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

		}catch( error ){
			console.debug( "unexpected error when inserting rule", error );
		}

		harden( "BOOTED", "booted", leaf );

		return leaf;
	}, leaf );

/*:
	@method-documentation:
		Show the page and re-assign the z-index.
	@end-method-documentation
*/
harden( "show",
	function show( name ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		if( name in leaf.page ){
			var page = leaf.page[ name ];

			var group = page.getAttribute( "group" );

			var view = document.querySelector( "section.view." + group );
			if( !view ){
				throw new Error( "view does not exists" );
			}

			page.classList.remove( "hidden" );

			var level = parseInt( page.getAttribute( "level" ) );
			var viewLevel = parseInt( view.getAttribute( "level" ) );
			level = viewLevel * level;
			if( level > MAXIMUM_PAGE_LEVEL ){
				throw new Error( "maximum page level" );
			}
			page.style.zIndex = level;

		}else{
			console.debug( "cannot find page", name );
		}

		return leaf;
	}, leaf );

/*:
	@method-documentation:
		Hides the page.
	@end-method-documentation
*/
harden( "hide",
	function hide( name ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		if( name in leaf.page ){
			leaf.page[ name ].classList.add( "hidden" );

		}else{
			console.debug( "cannot find page", name );
		}

		return leaf;
	}, leaf );

/*:
	@method-documentation:
		We separated the complicated procedure of resolving the group index.

		You may suggest a particular group index but this will check and resolve
			the best index for you.
	@end-method-documentation

	@option:
		{
			"name": "string",
			"group": "string",
			"page": "HTMLElement",
			"index": "number",
			"level": "level"
		}
	@end-option
*/
harden( "resolveGroup",
	function resolveGroup( option ){
		var name = option.name;
		if( !name ){
			throw new Error( "name not specified" );
		}

		var group = option.group || "root";

		var view = document.querySelector( "section.view." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		if( !( group in leaf.group ) ){
			harden( group, leaf.group[ group ] || { }, leaf.group );
		}

		if( !( group in leaf.data.group ) ){
			harden( group, leaf.data.group[ group ] || { }, leaf.data.group );
		}

		var page = option.page || leaf.group[ group ][ name ] || leaf.page[ name ];
		if( !page ){
			throw new Error( "page not specified" );
		}

		/*:
			This is the current count of the pages in the group from zero.
			This may represent the current count of pages in the group.
		*/
		var groupIndex = option.index || leaf.data.group[ group ].index || 0;
		if( groupIndex > MAXIMUM_PAGE_INDEX ){
			throw new Error( "maximum group index" );
		}

		/*:
			This is the stationary high value index and
				does not represent the curent count of the pages in a group.
		*/
		var lastIndex = leaf.data.group[ group ].last || 0;

		//: The given level overrides the current group index.
		var level = option.level || groupIndex;
		if( level > MAXIMUM_PAGE_LEVEL ){
			throw new Error( "maximum page level" );
		}
		groupIndex = level;

		//: The last index may be the group index but it will change because of the given level.
		if( groupIndex > lastIndex ){
			lastIndex = groupIndex;
		}

		var index = 0;
		while( leaf.group[ group ][ index ] ){
			index++;
		}
		if( index > MAXIMUM_PAGE_INDEX ){
			throw new Error( "maximum group last index" );
		}
		/*:
			The last index may not be the last one based on the registered pages in the group.

			This will confuse anyone in the future, we did this because
				we will never know what is the last index. It is safe to assume
				that the last index can be at the last space or/and with the highest value.

			We will be temporarily placing last index as the last non occupied index.
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

			//: If the group index and last index is occupied then move both one index.
			}else if( leaf.group[ group ][ groupIndex ] &&
				leaf.group[ group ][ lastIndex ] &&
				lastIndex != groupIndex )
			{
				groupIndex++;
				lastIndex++;
			}

			if( groupIndex > MAXIMUM_PAGE_INDEX ){
				throw new Error( "group is full" );
			}

			if( lastIndex > MAXIMUM_PAGE_INDEX ){
				throw new Error( "group is full" );
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

		level = groupIndex;
		page.setAttribute( "level", level );

		var viewLevel = parseInt( view.getAttribute( "level" ) ) || 0;
		page.style.zIndex = viewLevel * level;

		leaf.group[ group ][ name ] = page;
		leaf.group[ group ][ groupIndex ] = page;
		page.setAttribute( "index", groupIndex );

		var index = 0;
		while( leaf.group[ group ][ index ] ){
			index++;
		}
		//: The current group index must be empty.
		if( index > MAXIMUM_PAGE_INDEX ){
			throw new Error( "maximum group index" );
		}
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
		if( nextIndex > MAXIMUM_PAGE_INDEX ){
			throw new Error( "maximum group last index" );
		}
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

		var view = document.querySelector( "section.view." + group );
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
				var level = viewLevel * index;
				if( level > MAXIMUM_PAGE_LEVEL ){
					throw new Error( "maximum page level" );
				}
				page.style.zIndex = level;
			} );

		return leaf;
	}, leaf );

/*:
	@method-documentation:
		Remove the page from the group.
	@end-method-documentation
*/
harden( "tear",
	function tear( name, group ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		group = group || "root";

		var view = document.querySelector( "section.view." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		var page = leaf.page[ name ];
		if( !page ){
			throw new Error( "page does not exists" );
		}

		//: Ensure that the given group is the same with the current page group.
		var oldGroup = page.getAttribute( "group" );
		if( group != oldGroup &&
			document.querySelector( "section.view." + oldGroup + " > div.page." + name ) &&
			!document.querySelector( "section.view." + group + " > div.page." + name ) )
		{
			group = oldGroup;
		}

		if( !document.querySelector( "section.view." + group + " > div.page." + name ) ){
			throw new Error( "page is not in the view" );
		}

		if( !( group in leaf.group ) ){
			harden( group, leaf.group[ group ] || { }, leaf.group );
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
	@method-documentation:
		Add the page to the group.
	@end-method-documentation
*/
harden( "tape",
	function tape( name, group ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		group = group || "root";

		var view = document.querySelector( "section.view." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		var page = leaf.page[ name ];
		if( !page ){
			throw new Error( "page does not exists" );
		}

		//: Ensure that the page is not yet in the group
		var oldGroup = page.getAttribute( "group" );
		if( oldGroup ){
			throw new Error( "page is not yet torn" );
		}

		if( oldGroup &&
			( group == oldGroup ||
			document.querySelector( "section.view." + group + " > div.page." + name ) ||
			document.querySelector( "section.view." + oldGroup + " > div.page." + name ) ) )
		{
			throw new Error( "page is already in the given group" );
		}

		if( !( group in leaf.group ) ){
			harden( group, leaf.group[ group ] || { }, leaf.group );
		}

		if( !( group in leaf.data.group ) ){
			harden( group, leaf.data.group[ group ] || { }, leaf.data.group );
		}

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
	@method-documentation:
		Tear and tape the page to another group.
	@end-method-documentation
*/
harden( "transfer",
	function transfer( name, group ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		group = group || "root";

		var view = document.querySelector( "section.view." + group );
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
