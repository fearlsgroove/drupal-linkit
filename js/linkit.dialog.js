/**
 * @file
 * Linkit dialog functions
 */

// Create the linkit dialog namespace.
Drupal.linkit.dialog = Drupal.linkit.dialog || {};

(function($) {

/**
 * Dialog default options.
 */
Drupal.linkit.dialog.dialogOptions = function() {
  return {
    buttons: Drupal.linkit.dialog.dialogButtons(),
    dialogClass: 'linkit-wrapper',
    modal: true,
    draggable: false,
    resizable: false,
    minWidth: 800,
    width: 800,
    height: 550,
    position: 'center',
    overlay: {
      backgroundColor: '#000000',
      opacity: 0.4
    }
  }
};

/**
 * Define the dialog buttons.
 */
Drupal.linkit.dialog.dialogButtons = function () {

  var close = Drupal.t('Close');
  var buttons = {};

  buttons[close] = function () {
    $(this).dialog("destroy");
    $(this).remove();
  };

  return buttons;
};

/**
 * jQuery dialog buttons is located outside the IFRAME where Linkit dashboard
 * is shown and they cant trigger events in the IFRAME.
 * Our own buttons for inserting a link and cancel is inside that IFRAME and
 * can't destroy the dialog, so we have to bind our buttons to the dialog button.
 */
Drupal.behaviors.linkit_dialogButtons = {
  attach: function (context, settings) {
    $('#linkit-modal #edit-linkit-insert', context).click(function() {
      var linkitCache = Drupal.linkit.getLinkitCache();
      // Call the insertLink() function.
      Drupal.linkit.editorDialog[linkitCache.editorName].insertLink(Drupal.linkit.dialog.getLink());
      // Close the dialog.
      Drupal.linkit.dialog.close();
      return false;
    });

    $('#linkit-modal #linkit-cancel', context).bind('click', Drupal.linkit.dialog.close);
  }
};

/**
 * Close the Linkit dialog.
 * Return false so the default browser behavior will not submit the form in the
 * dialog.
 */
Drupal.linkit.dialog.close = function () {
  $('#linkit-modal').parent('.ui-dialog').find('.ui-dialog-buttonpane button').click();
};

/**
 * Populate fields on the dashboard. Typically this method is called from
 * an editor JS file when the dashboard page has just loaded.
 *
 * @param link
 *   An object with the following properties (all are optional):
 *   - path: The anchor's href
 *   - text: The text that should be linked. Has no effect if already set.
 *   - attributes: An object with additional attributes for the anchor element
 */
Drupal.linkit.dialog.populateFields = function(link) {
  link = link || {};
  link.attributes = link.attributes || {};
  $('#linkit-modal #edit-linkit-path').val(link.path);
  $.each(link.attributes, function(name, value) {
    $('#linkit-modal #edit-linkit-attributes #edit-linkit-' + name).val(value);
  });
  Drupal.linkit.dialog.requiredFieldsValidation();
};

/**
 * Check for mandatory text fields in the form and disable for submissions
 * if any of the fields are empty.
 */
Drupal.linkit.dialog.requiredFieldsValidation = function() {
  var allowed = true;
  $('#linkit-modal .form-text.required').each(function() {
    if (!$(this).val()) {
      allowed = false;
      return false;
    }
  });
  if (allowed) {
    $('#linkit-modal #edit-linkit-insert')
      .removeAttr('disabled')
      .removeClass('form-button-disabled');
  }
  else {
    $('#linkit-modal #edit-linkit-insert')
      .attr('disabled', 'disabled')
      .addClass('form-button-disabled');
  }
};

/**
 * Retrieve a list of the currently available additional attributes in the
 * dashboard. The attribute "href" is excluded.
 *
 * @return
 *   An array with the names of the attributes.
 */
Drupal.linkit.dialog.additionalAttributes = function() {
  var attributes = [];
  $('#linkit-modal #edit-linkit-attributes .form-text').each(function() {
    // Remove the 'linkit_' prefix.
    attributes.push($(this).attr('name').substr(7));
  });
  return attributes;
}

/**
 * Retrieve a link object by extracting values from the form.
 *
 * @return
 *   The link object.
 *
 * @see Drupal.linkit.dialog.populateFields.
 */
  Drupal.linkit.dialog.getLink = function() {
    var link = {
      path: $('#linkit-modal #edit-linkit-path').val(),
      attributes: {}
    };
    $.each(Drupal.linkit.dialog.additionalAttributes(), function(f, name) {
     link.attributes[name] =
         $('#linkit-modal #edit-linkit-attributes #edit-linkit-' + name).val();
    });
  return link;
};

/**
 * Open the IMCE file browser
 */
Drupal.linkit.dialog.openFileBrowser = function () {
  window.open(decodeURIComponent(Drupal.settings.linkit.IMCEurl), '', 'width=760,height=560,resizable=1');
};

/**
 * When a file is inserted through IMCE, this function is called
 * See IMCE api for details
 *
 * @param file
 *   The file object that was selected inside IMCE
 * @param win
 *   The IMCE window object
 */
Drupal.linkit.dialog.IMCECallback = function(file, win) {
  Drupal.linkit.dialog.populateLink(file.name,
      win.imce.decode(Drupal.settings.basePath +
                      Drupal.settings.linkit.publicFilesDirectory +
                      '/' + file.relpath));
  win.close();
};

/**
 * Show a message if there is no selection.
 */
Drupal.linkit.dialog.noselection = function() {
  var info_text = Drupal.t('<em class="notice">Notice: No selection was found, your link text will appear as the item title you are linking to.</em>');
  $('#linkit-dashboard-form').prepend(info_text);
};

/**
 * Return the Iframe that we use in the dialog.
 */
Drupal.linkit.dialog.createDialog = function(src) {
  var linkitCache = Drupal.linkit.getLinkitCache();

  // Initialize Linkit editor js.
  Drupal.linkit.editorDialog[linkitCache.editorName].init();

  // Create a dialog dig in the <body>.
  $('body').append($('<div></div>').attr('id', 'linkit-modal'));

  $.ajax({
    url : src,
    beforeSend : function() {
      // Delete exsisting throbbers.
      $('#linkit-modal .ajax-progress-throbber').remove();
      // Add new throbber
      var throbber = $('<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div></div>');
      $('#linkit-modal').append(throbber);
    },
    success : function(data) {
      // Insert the respons.
      $('#linkit-modal').append(data);
      // Delete exsisting throbbers.
      $('#linkit-modal .ajax-progress-throbber').remove();

      var linkitCache = Drupal.linkit.getLinkitCache();

      // Run all the behaviors again for this new context.
      Drupal.attachBehaviors($('.linkit-wrapper'), Drupal.settings);

      // Run the afterInit function.
      Drupal.linkit.editorDialog[linkitCache.editorName].afterInit();
    }
  });

  return $('#linkit-modal');
};

/**
 * Build the dialog
 *
 * @param url
 *   The url to call in the iframe.
 */
Drupal.linkit.dialog.buildDialog = function (url) {
   // Get the options for the dialog.
   var dialogOptions = Drupal.linkit.dialog.dialogOptions();

   // Build the dialog element.
   var linkitDialog = Drupal.linkit.dialog.createDialog(url);

   var dia = linkitDialog.dialog(dialogOptions);

   // Remove the title bar from the dialog.
   linkitDialog.parents(".ui-dialog").find(".ui-dialog-titlebar").remove();
};

})(jQuery);