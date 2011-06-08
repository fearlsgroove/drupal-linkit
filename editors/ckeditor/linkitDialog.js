
/**
 * @file Linkit ckeditor dialog helper
 */

var LinkitDialog = {};

(function ($) {

LinkitDialog = {
  init : function() {
    //Get CKEDITOR and current instance name
    if (typeof(dialogArguments) != 'undefined') {
      CKEDITOR = dialogArguments.opener.CKEDITOR;
      var name = dialogArguments.editorname;
    } else {
      CKEDITOR = window.opener.CKEDITOR;
      var name = decodeURI((RegExp('editorname=(.+?)(&|$)').exec(location.search)||[,null])[1]);
    }
    
    //Get the editor instance
    editor = CKEDITOR.instances[name];
    //Get the selected element
    var element = null;
    element = this._getSelection();
    var selection = editor.getSelection();

    // If we have selected an element, grab that elemes attributes
    if(element) {
      // Set values from selection (not href)
      $('#edit-attributes input[type=text]').each(function() {
        // element.getAttribute doent seems to like first arg to be empty.
        $(this).val(element.getAttribute($(this).attr('name')));
      });

      $('#edit-path').val(element.getAttribute('href'));
      $('#edit-text').val(selection);

      // href is set here
      if(href.length > 0) {
        // populate field
        //linkit_helper.search_styled_link(href);
      } 
    } else if(selection.getNative().isCollapsed) {
      
      // Show help text when there is no selection element
      //linkit_helper.show_no_selection_text();
    }
    console.log(selection._.cache.nativeSel);
  },

  insertLink : function() {   
    // Get the params from the form
    var params = this._getParams();  
    //If no href, just colse this window
    if(params.href == "") {
      window.close();
    } 
    // Ok, we have a href, lets make a link of it and insert it
    else {      
      CKEDITOR.tools.callFunction(editor._.linkitFnNum, params, editor);   
      window.close();
    }
  },
  
  _getParams : function () {
    // Regexp to find the "path"
    var matches = $('#edit-link--2').val().match(/\[path:(.*)\]/i);
    href = (matches == null) ? $('#edit-link--2').val() : matches[1];
    
    // Add anchor if we have any and make sure there is no "#" before adding the anchor
    // But do not add if there is an anchor in the URL
    var anchor = $('#edit-anchor').val().replace(/#/g,'');
    var hasAnchor = $('#edit-link--2').val().match(/\#/i);

    if(anchor.length > 0 && hasAnchor == null ) {
      href = href.concat('#' + anchor);
    }

    var link_text_matches = $('#edit-link--2').val().match(/(.*)\[path:.*\]/i);
    link_text = (link_text_matches == null) ? $('#edit-link--2').val() : link_text_matches[1].replace(/^\s+|\s+$/g, '');

    var params = { 'href' : href , 'link_text' : link_text, 'data-cke-saved-href' : href };
    
    $("fieldset fieldset input[id!='edit-anchor']").each(function() {
      if($(this).val() != "") {
        params[$(this).attr('name')] = $(this).val();
      }
    });

    return params;
  },

  _getSelection : function () {
    selection = editor.getSelection();
    ranges = selection.getRanges();
    element = '';
    
    if (ranges.length == 1) {
      var rangeRoot = ranges[0].getCommonAncestor(true);
      element = rangeRoot.getAscendant('a', true);
    }

    return element;
  }
};

$(document).ready(function() {
  var CKEDITOR, editor;

  LinkitDialog.init();

  $('#edit-link--2').keydown(function(ev) {
    if (ev.keyCode == 13) {
      // Prevent browsers from firing the click event on the first submit
      // button when enter is used to select from the autocomplete list.
      return false;
    }
  });
  
  $('#edit-insert').click(function() {
    LinkitDialog.insertLink();
    return false;
  });

  $('#edit-cancel').click(function() {
    window.close();
    return false;
  });
});

})(jQuery);