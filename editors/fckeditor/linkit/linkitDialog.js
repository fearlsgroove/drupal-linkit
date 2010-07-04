/* $Id$ */

var dialog	= window.parent ;
var oEditor = dialog.InnerDialogLoaded() ;

var FCK			  = oEditor.FCK ;
var FCKLang		= oEditor.FCKLang ;
var FCKConfig	= oEditor.FCKConfig ;
var FCKRegexLib	= oEditor.FCKRegexLib ;
var FCKTools	= oEditor.FCKTools ;

dialog.SetAutoSize( true ) ;

// Activate the "OK" button.
dialog.SetOkButton( true ) ;
var oLink = dialog.Selection.GetSelection().MoveToAncestorNode( 'A' ) ;

$(document).ready(function() {
  $('#edit-cancel, #edit-insert').hide();
  $('*', document).keydown(function(ev) {
    if (ev.keyCode == 13) {
      // Prevent browsers from firing the click event on the first submit
      // button when enter is used to select.
      return false;
    }
  });

  if ( oLink ) {
    FCK.Selection.SelectNode( oLink ) ;
    
    if($(oLink).attr('href').length > 0) {
     linkit_search_styled_link($(oLink).attr('href'));
    } 

    $('#edit-title').val($(oLink).attr('title'));
    $('#edit-id').val($(oLink).attr('id'));
    $('#edit-class').val($(oLink).attr('class'));
    $('#edit-rel').val($(oLink).attr('rel'));
    $('#edit-accesskey').val($(oLink).attr('accesskey'));
  }
});


// The OK button was hit.
function Ok() {
  var sInnerHtml ;
  
  var matches = $('#edit-link').val().match(/\[path:(.*)\]/i);
  linlit_url = (matches == null) ? $('#edit-link').val() : matches[1];

  var asLinkPath = $('#edit-link').val().match(/(.*)\[path:.*\]/i);
  asLinkPath_text = (matches == null) ? '' : asLinkPath[1].replace(/^\s+|\s+$/g, '');
  
  if ( linlit_url.length == 0 ) {
    alert(Drupal.t('No URL'));
    return false ;
  }

  oEditor.FCKUndo.SaveUndoStep();

  // If no link is selected, create a new one (it may result in more than one link creation - #220).
	var aLinks = oLink ? [ oLink ] : oEditor.FCK.CreateLink( linlit_url, true ) ;
  
  // If no selection, no links are created, so use the uri as the link text (by dom, 2006-05-26)
	var aHasSelection = ( aLinks.length > 0 ) ;
	if ( !aHasSelection )
	{
    if (asLinkPath_text)
      sInnerHtml = asLinkPath_text;  // use matched path

		// Create a new (empty) anchor.
		aLinks = [ oEditor.FCK.InsertElement( 'a' ) ] ;
	}
  
	for ( var i = 0 ; i < aLinks.length ; i++ )
	{
		oLink = aLinks[i] ;

		if ( aHasSelection )
			sInnerHtml = oLink.innerHTML ;		// Save the innerHTML (IE changes it if it is like an URL).

		oLink.href = linlit_url ;
		SetAttribute( oLink, '_fcksavedurl', linlit_url ) ;

		oLink.innerHTML = sInnerHtml ;		// Set (or restore) the innerHTML

		// Let's set the "id" only for the first link to avoid duplication.
		if ( i == 0 )
			SetAttribute( oLink, 'id', $('#edit-id').val() ) ;

		// Advances Attributes
		SetAttribute( oLink, 'title', $('#edit-title').val() ) ;
    SetAttribute( oLink, 'rel', $('#edit-rel').val() ) ;
    SetAttribute( oLink, 'accesskey', $('#edit-accesskey').val() ) ;
    SetAttribute( oLink, 'class', $('#edit-class').val() ) ;
	}

  // Select the (first) link.
	oEditor.FCKSelection.SelectNode( aLinks[0] );

	return true ;
  
}

function SetAttribute( element, attName, attValue )
{
	if ( attValue == null || attValue.length == 0 )
		element.removeAttribute( attName, 0 ) ;			// 0 : Case Insensitive
	else
		element.setAttribute( attName, attValue, 0 ) ;	// 0 : Case Insensitive
}

function GetAttribute( element, attName, valueIfNull )
{
	var oAtt = element.attributes[attName] ;

	if ( oAtt == null || !oAtt.specified )
		return valueIfNull ? valueIfNull : '' ;

	var oValue = element.getAttribute( attName, 2 ) ;

	if ( oValue == null )
		oValue = oAtt.nodeValue ;

	return ( oValue == null ? valueIfNull : oValue ) ;
}