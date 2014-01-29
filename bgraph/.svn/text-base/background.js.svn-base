//onCommitted
//onCompleted
/*
 details ( object )
 tabId ( integer )
 The ID of the tab in which the navigation occurs.
 url ( string )
 frameId ( integer )
 0 indicates the navigation happens in the tab content window; a positive value indicates navigation in a subframe. Frame IDs are unique within a tab.
 transitionType ( enumerated string ["link", "typed", "auto_bookmark", "auto_subframe", "manual_subframe", "generated", "start_page", "form_submit", "reload", "keyword", "keyword_generated"] )
 Cause of the navigation. The same transition types as defined in the history API are used.
 transitionQualifiers ( array of string ["client_redirect", "server_redirect", "forward_back", "from_address_bar"] )
 A list of transition qualifiers.
 timeStamp ( number )
 The time when the navigation was committed, in milliseconds since the epoch.
 */
localStorage.clear();


/*

 localStorage layout

 Page Details

 page\\1 = { url, title, date, image }

 Parents

 parent\\2 = 1

 Children

 children\\1 = [2,3]

 Url IDs

 url\\http://blah = 1

 Roots

 roots = [1]

 ChangeCount

 change = 1

 */



//---- DATA STORAGE API

var DataStore = (function ()
{
    var o = {};

    o.activeTabID = 0;

    //  This is a map of tab{tabid} => PageId

    var tabUrls = [];

    //---- PUBLIC FUNCTIONS

    //---- addPage

    o.AddPage = function ( pageUrl, transitionType, parentPageId )
    {
        //- Get previous page ID
//        var parentPageId = 0;

//        console.log( 'addPage( ' + pageUrl + ', ' + transitionType + ' ' + parentUrl + ' )' );

        //- Grab the previous URL
        /*var data = chrome.history.getVisits
            (
                {
                    url: pageUrl
                },
                function(visitItems)
                {
                    //- Grab the last place this was visited from
                    var previousVisit = visitItems.pop();
                }
            );*/

        var cleanedUrl = cleanUrl( pageUrl );

        //- If the URL already exists we don't need to do anything, just return the ID

        if( localStorage[ "url\\\\" + cleanedUrl ] )
        {
            tabUrls[ o.activeTabID ] = localStorage[ "url\\\\" + cleanedUrl ];
            return localStorage[ "url\\\\" + cleanedUrl ];
        }

        if( transitionType != 'typed' )
        {
var a = localStorage["lastPageId"] ? parseInt( localStorage["lastPageId"] ) : 0;
            parentPageId = Math.floor( Math.random()*a ) //tabUrls[ o.activeTabID ] ? parseInt( tabUrls[ o.activeTabID ] ) : 0;
        }

        //- Create a new page record

        var pageId = generateNewId();

        //- Store

        //  page\\1 = { url, title, date, image }

        localStorage[ "url\\\\" + pageId ] = cleanedUrl;
        localStorage[ "dirtyurl\\\\" + pageId ] = pageUrl;
        localStorage[ "title\\\\" + pageId ] = cleanedUrl;
        localStorage[ "date\\\\" + pageId ] = 'Today';
        localStorage[ "image\\\\" + pageId ] = '';

        //  parent\\2 = 1

        localStorage[ "parent\\\\" + pageId ] = parentPageId;

        //  children\\1 = [2,3]

        var children = localStorage[ "children\\\\" + parentPageId ] ? localStorage[ "children\\\\" + parentPageId ] + ',' : '';
        localStorage[ "children\\\\" + parentPageId ] = children + pageId

        //  url\\http://blah = 1

        localStorage[ "url\\\\" + cleanedUrl ] = pageId;

        //  change ++

        localStorage[ "changeCount" ] = localStorage[ "changeCount" ] ? parseInt( localStorage[ "changeCount" ] ) + 1 : 1;

        //- Store new page for this tab so that we know what the previous page was next time around

        tabUrls[ o.activeTabID ] = pageId;
    };

	//---- SetPageTitle
	
	o.SetPageTitle = function( tabId, title )
	{
		var pageId = tabUrls[ tabId ]
		localStorage[ "title\\\\"+pageId ] = title
	}

    //---- tabClosed

    //  Called when a tab is closed

    o.TabClosed = function ( tabId )
    {
        console.log( 'tabClosed( ' + tabId + ' )' );
        delete tabUrls[ tabId ];
    };

    //---- PRIVATE METHODS

    //---- cleanUrl

    var cleanUrl = function ( url )
    {
        //- Remove http:// & https://
        url = url.replace( 'http://', '' );
        url = url.replace( 'https://', '' );

        //- Remove www
        url = url.replace( 'www', '' );

        //- Remove the QUERY Params
        var pos = url.indexOf( '?' );

        if( pos > -1 )
        {
            url = url.substr( 0, pos );
        }

        //- If the final char is a / remove it
        if( url.substring( url.length - 1, url.length ) == "/" )
        {
            url = url.substring( 0, url.length - 1 );
        }

        //- If the final char is a / remove it
        if( url.substring( 0, 1 ) == "." )
        {
            url = url.substring( 1, url.length );
        }

        return url;
    };

    //---- generateNewId

    var generateNewId = function ()
    {
        var id = localStorage["lastPageId"] ? parseInt( localStorage["lastPageId"] ) : 0;
        id++;
        localStorage["lastPageId"] = id;
        return id;
    };

    return o;

})();


chrome.webNavigation.onCommitted.addListener
    (
        function ( details )
        {
            console.log( "details" );
            console.log( details );
            //- These are the different types of navigation that we are currently going to support
            if( details.frameId === 0 && details.url != undefined )
            {
                DataStore.AddPage( details.url, details.transitionType );
            }
        },
        {urls:["*://*/*"]},
        ["responseHeaders"]
    );

chrome.tabs.onRemoved.addListener
    (
        function ( tabId, removeInfo )
        {
            DataStore.TabClosed( tabId );
        }
    );

chrome.tabs.onActiveChanged.addListener
    (
        function(tabId, selectInfo)
        {
            DataStore.activeTabID = tabId;
        }
    );

chrome.tabs.onUpdated.addListener
    (
        function(tabId, selectInfo)
        {
            DataStore.activeTabID = tabId;
        }
    );

	

	
function fudge( url )
{
//o.activeTabID = 0
if( Math.random() < 0.2 )
{
DataStore.AddPage( url, 'click', 0 );
}
else
{
var a = localStorage["lastPageId"] ? parseInt( localStorage["lastPageId"] ) : 0;
DataStore.AddPage( url, 'click', Math.floor( Math.random()*a ) );
}}

chrome.webNavigation.onDOMContentLoaded.addListener
(
	function(details) 
	{
	console.log( 'aaaa' )
			  chrome.tabs.sendRequest(details.tabId, {action: "getDOM"}, function(response) {
				console.log(response.dom);
			  });

	}
);

/*


 function getCurrentLocalStorageID()
 {
 //- Grab the local storage id
 if( localStorage["s\\\\id"] != undefined )
 {
 var id = localStorage["s\\\\id"];
 }
 else
 {
 localStorage["s\\\\id"] = 1;
 var id = 1;
 }

 return id;
 }


 function trackParent(url, id)
 {
 //- Check to see if we already have this URL as a from\\ && check to see if we already have this ID
 if(localStorage["from\\\\"+url] != undefined)
 {
 //- Convert the data back into an JSON object
 var fromArray = JSON.parse(localStorage["from\\\\"+url]);
 if(fromArray.indexOf(id) == -1)
 {
 //- Add the element
 fromArray.push(id);

 //- Shove back into the storage
 localStorage["from\\\\"+url] = JSON.stringify(fromArray);
 }
 }
 else
 {
 localStorage["from\\\\"+url] = JSON.stringify([id]);
 }
 }

 function trackURLID(url, id)
 {
 localStorage["u\\\\"+url] = getCurrentLocalStorageID();
 trackURL(url, id);
 }

 function trackURL(url, id)
 {
 localStorage["d\\\\"+id] = url;
 }

 function getCurrentURLID(url)
 {
 if(localStorage["u\\\\"+url] != undefined)
 {
 return localStorage["u\\\\"+url]
 }
 else
 {
 return null;
 }
 }

 function getNewLocalStorageID()
 {
 id = parseInt(getCurrentLocalStorageID());
 id = id + 1;
 localStorage["s\\\\id"] = id;
 return id;
 }


 function doStringFind(url, id)
 {
 return;

 var minSize = 3;
 var maxSize = 8;

 //- Explode the URL around /
 var bits = url.split('/');
 var process = [];
 for(var b=0; b<bits.length; b++)
 {
 //- Explode around .
 var subBits = bits[b].split('.');
 for(var sb=0; sb<subBits.length; sb++)
 {
 process.push(subBits[sb]);
 }
 }

 for(var i=0; i<process.length; i++)
 {
 for(var length=minSize; length<=maxSize; length++)
 {
 var keyLen = process[i].length-length;
 for(var x=0; x<keyLen-1; i++)
 {
 var key = process[i].substr(i, length);
 if(key.length >= minSize && key.length <= maxSize)
 {
 if(localStorage["s\\\\"+key] != undefined)
 {
 //- Convert the data back into an JSON object
 var searchArray = JSON.parse(localStorage["s\\\\"+key]);
 if(searchArray.indexOf(id) == -1)
 {
 //- Add the element
 searchArray.push(id);

 //- Shove back into the storage
 localStorage["s\\\\"+key] = JSON.stringify(searchArray);
 }
 }
 else
 {
 localStorage["s\\\\"+key] = JSON.stringify([id]);
 }
 }
 }
 }
 }
 }

 */