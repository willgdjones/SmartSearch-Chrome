// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.








var DataReader = (function(){

	var o = {}
	
	//  Given a pageId, returns a list of the children of that page

	o.GetChildren = function( pageId )
	{
		if( ! pageId ) pageId = 0
		if( ! localStorage[ "children\\\\"+pageId ] ) return []
		return localStorage[ "children\\\\"+pageId ].split(',')
	}
	
	o.GetPage = function( pageId )
	{
		var o = {}

		o.id     = pageId
		o.url    = localStorage[ "url\\\\"+pageId ] ? localStorage[ "url\\\\"+pageId ] : ''
		o.title  = localStorage[ "title\\\\"+pageId ] ? localStorage[ "title\\\\"+pageId ] : ''
		o.date   = localStorage[ "date\\\\"+pageId ] ? localStorage[ "date\\\\"+pageId ] : ''
		o.image  = localStorage[ "image\\\\"+pageId ] ? localStorage[ "image\\\\"+pageId ] : ''
		o.parent = localStorage[ "parent\\\\"+pageId ] ? parseInt( localStorage[ "parent\\\\"+pageId ] ) : 0
		
		return o
	}
	
	o.GetMaxId = function()
	{
		return localStorage['changeCount'] ? parseInt( localStorage['changeCount'] ) : 0
	}
	
	return o

})()






var Graph = (function()
{
	var canvas = document.getElementById('view')
	var im = canvas.getContext('2d')
	
	var o = {}
	
	var pages = []
	var pageIds = []
	
	var cx = canvas.width * 0.5
	var cy = canvas.height * 0.5
	var scale = 1

	var mouseX = -9999
	var mouseY = -9999
	
	var mouseOver = false

	var draggingPageId = 0
	var dragging = false
	var hoverPageId = 0
	
	var dragMouseX;
	var dragMouseY;
	
	var dragged = false

	//---- AddPage
	
	o.AddPage = function( pageData )
	{
		if( pageData.parent )
		{
			pageData.x = pages[ pageData.parent ].x + Math.random() * 50
			pageData.y = pages[ pageData.parent ].y + Math.random() * 50
			pageData.r = 10
			pageData.hover = false
		}
		else
		{
			pageData.x = Math.random() * 500 - 250
			pageData.y = Math.random() * 500 - 250
			pageData.r = 10
			pageData.hover = false
			
			pageData.line = null
		}

		pages[ pageData.id ] = pageData
		pageIds.push( pageData.id )
	}
	
	//---- OnMouseWheel
	
	o.OnMouseWheel = function()
	{
	}

	//---- update
	
	var update = function()
	{
		var i
		var j
		var pageData1
		var pageData2

		hoverPageId = 0

		//  Do physics

		for( i=0; i<pageIds.length; i++ ) if( pageIds[i] != draggingPageId )
		{
			pageData1 = pages[ pageIds[i] ]
			
			//  Calculate force
			
			for( j=0; j<pageIds.length; j++ ) if( i != j )
			{
				pageData2 = pages[ pageIds[j] ]
				
				var dx = pageData2.x - pageData1.x
				var dy = pageData2.y - pageData1.y
				
				var dd = Math.sqrt( dx*dx + dy*dy )
				
				if( dd < 1 ) dd = 1
				
				dx /= dd
				dy /= dd

				var rr = 75//pageData1.r + pageData2.r
				var f = 0
				
				var dist = pageData1.parent == pageIds[j] || pageData2.parent == pageIds[i] ? 40 : 100
				
				if( dd < rr )
				{
					f = 2
				}
				else if( dd < rr + dist )
				{
					f = 1 + 1 * Math.cos( (dd-rr)/dist * 3.14159 )
				}
				else if( pageData1.parent == pageIds[j] || pageData2.parent == pageIds[i] )
				{
					f = -0.02 * (dd-rr-dist)
				}

				if( f > 5 ) f = 5
				if( f < -5 ) f = -5

				pageData1.x -= 10 * f * dx
				pageData1.y -= 10 * f * dy
			}
			
			//  Attract towards center

//			pageData1.x = pageData1.x*0.999;
//			pageData1.y = pageData1.y*0.999;

			//  Change radius based on hover

			if( pageData1.hover )
			{
				pageData1.r = 30 + pageData1.r * 0.5
			}
			else
			{
				pageData1.r = 20 + pageData1.r * 0.5
			}

			//  Check mouseover

			var mdx = mouseX - pageData1.x
			var mdy = mouseY - pageData1.y
			var mdd = mdx*mdx + mdy*mdy
			
			pageData1.hover = mdd < pageData1.r * pageData1.r
			
			if( pageData1.hover )
			{
				hoverPageId = pageIds[i]
			}
		}

		//- Draw everything
		
		canvas.width = canvas.width
		
		//  Set up transform
		
		im.scale( scale, scale )
		
		//  Draw lines

		for( i=0; i<pageIds.length; i++ )
		{
			pageData1 = pages[ pageIds[i] ]
			
			if( pageData1.parent )
			{
				pageData2 = pages[ pageData1.parent ]
				
				im.moveTo( cx + pageData1.x, cy + pageData1.y )
				im.lineTo( cx + pageData2.x, cy + pageData2.y )
				im.lineWidth = 15
				im.strokeStyle = "#90a0c4"
				im.lineCap = "round"
				im.stroke()
			}
		}

		//  Draw circles
		
		for( i=0; i<pageIds.length; i++ )
		{
			pageData1 = pages[ pageIds[i] ]
			
			im.fillStyle='#3b5999';
			im.beginPath();
			im.arc( cx + pageData1.x, cy + pageData1.y, pageData1.r, 0, Math.PI*2, true); 
			im.closePath();
			im.fill();
			
			im.fillStyle='#ffffff';
			im.beginPath();
			im.arc( cx + pageData1.x, cy + pageData1.y, pageData1.r-8, 0, Math.PI*2, true); 
			im.closePath();
			im.fill();
			
			im.fillStyle = '#000000'
			im.fillText( pageData1.url, cx + pageData1.x, cy + pageData1.y )
		}
		
		//  Set cursor
		
		if( hoverPageId )
		{
			canvas.className = 'pointer'
		}
		else
		{
			canvas.className = 'hand'
		}
		
		//  Set
	}
	
	//---- canvas.onmousemove
	
	canvas.onmousemove = function( evt )
	{
		mouseX = evt.pageX - cx;
		mouseY = evt.pageY - cy;

		if(dragging)
		{
			var diffX = (mouseX - dragMouseX)
			var diffY = (mouseY - dragMouseY)
			
			if( draggingPageId )
			{
				pages[ draggingPageId ].x += diffX
				pages[ draggingPageId ].y += diffY
				
				dragMouseX += diffX
				dragMouseY += diffY
			}
			else
			{
				cx += diffX;
				cy += diffY;
			}
			
			dragged = true
		}
	}
	
	//---- canvas.onmousedown
	
	canvas.onmousedown = function()
	{
		dragMouseX = mouseX/scale;
		dragMouseY = mouseY/scale;
		dragging = true;
		draggingPageId = hoverPageId
		dragged = false
	}

	//---- canvas.onmouseup
	
	canvas.onmouseup = function()
	{
		if( ! dragged && draggingPageId )
		{
			var pageData = pages[ draggingPageId ]
			alert( pageData.url )
			chrome.tabs.create( { url:pageData.dirtyurl } )
		}

		dragging = false;
		draggingPageId = 0
		
		dragged = false
	}

	canvas.onkeydown = function ()
	{
		//Testing zoom
		//scale(5, 5);
		alert("Test");
	}
	/*
	canvas.onmousewheel = function( e )
	{
		if( e.wheelDelta > 0 )
		{
			scale *= 1.05
		}
		else if( e.wheelDelta < 0 )
		{
			scale /= 1.05
		}
	}
*/
	//---- timer
	
	var timer = setInterval( update, 20 )
	
	return o;
}
)()




window.addEventListener( 'DOMMouseScroll', Graph.OnMouseWheel, false )






//---- Array.shuffle

Array.prototype.shuffle = function()
{
 	var len = this.length;
	var i = len;
	 while (i--) {
	 	var p = parseInt(Math.random()*len);
		var t = this[i];
  	this[i] = this[p];
  	this[p] = t;
 	}
}




//  Bring each page in in turn

var queue = []
var lastMaxId = 0

function processQueue()
{
	//  Check if there's any more that have been added
	
	var newMaxId = DataReader.GetMaxId()
	
	if( newMaxId > lastMaxId )
	{
		for( var i = lastMaxId+1; i<=newMaxId; i++ )
		{
			var pageData = DataReader.GetPage( i )
			if( pageData.parent == 0 || pageData.parent <= lastMaxId ) queue.push( i )
		}
		
		lastMaxId = newMaxId
	}

	//  Process next item in queue

	if( queue.length > 0 )
	{
		//  Process the next item on the queue
		
		var pageId = queue.shift()
		
		Graph.AddPage( DataReader.GetPage( pageId ) )
		
		//  Add the children to the end of the queue
		
		var children = DataReader.GetChildren( pageId )
		
		for( var i=0; i<children.length; i++ )
		{
			queue.push( children[i] )
		}

//		queue.shuffle()
	}
}

processQueue()
setInterval( processQueue, 50 )

























/**
 * @filedescription Initializes the extension's popup page.
 */
/*
chrome.extension.sendRequest(
    {'type':'getMostRequestedUrls'},
    function generateList( response )
    {

        var section = document.querySelector( 'body>section' );
        var results = response.result;
        var ol = document.createElement( 'ol' );
        var li, p, em, code, text;
        var i;
        for( i = 0; i < results.length; i++ )
        {
            li = document.createElement( 'li' );
            p = document.createElement( 'p' );
            em = document.createElement( 'em' );
            em.textContent = i + 1;
            code = document.createElement( 'code' );
            code.textContent = results[i].url;
            text = document.createTextNode(
                chrome.i18n.getMessage( 'navigationDescription',
                                        [results[i].numRequests,
                                         results[i].average] ) );
            p.appendChild( em );
            p.appendChild( code );
            p.appendChild( text );
            li.appendChild( p );
            ol.appendChild( li );
        }
        section.innerHTML = '';
        section.appendChild( ol );
    } );
*/

