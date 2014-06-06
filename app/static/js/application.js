var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var snippet = (function() {
    var SNIPPET_DES_COL =   'snippetDes-col',
        SNIPPET_DES_ROW =   'snippetDes-row',
        SNIPPET_CODE_COL =  'snippetCode-col',
        SNIPPET_CODE_ROW =  'snippetCode-row',
        snippetDesLayout =  SNIPPET_DES_COL,
        snippetCodeLayout = SNIPPET_CODE_COL,
        snippetNoneLayout = false;
        isTopicPopoverDisplayed = false;
        isTopicEditModeEnabled = false;
        isTopicAddModeEnabled = false;
        topicEditReset = function() {};

    /*
     * Local methods
     */

    var buildTopic = function(topicName, id) {
        var t  = '<li class="list-group-item topicItem">';
            t += '    <span class="fa fa-minus-circle topicDelete" style="display:none"></span>';
            t += '    <a href="#" class="topicName">' + topicName + '</a>';
            t += '    <span class="badge sit-right topicCounter">0</span>';
            t += '    <span class="topicID" style="display:none">' + id + '</span>';
            t += '</li>';

        return t;
    }

    var displayNewTopic = function(topicName, id) {
        var t = buildTopic(topicName, id);

        // Create a new snippet with the form data
        // Show it right after the 'General' topic
        $('#topicPanel .list-group li.topicGeneralItem').after(t);

        $('#topicForm')[0].reset();
        $('#topicFormContainer').hide();
        $('#topicAdd span').removeClass('selected');
        isTopicAddModeEnabled = false;
    }


    var buildSnippet = function(title, description, code, id, creatorId, access, isLoggedIn) {
        var userId = Number($('#userID').text()),
            codeClass = "personal",
            accessStr = "",
            ss = "";

        if (isLoggedIn) {
            if (creatorId == userId) {
                codeClass = "personal";
            } else {
                codeClass = "public";
            }
        } else {
            codeClass = "public";
        }

        ss +=     '<div class="snippet">';
        ss +=     '    <div class="snippetSelector">';
        ss +=     '        <a href="#"><span class="fa fa-circle-o fa-2x"></span></a>';
        ss +=     '    </div>';
        ss +=     '    <div class="snippetContent">';
        ss +=     '        <div class="snippetFade" style="display:none">';
        ss +=     '            <button type="button" class="btn btn-danger btn-xs snip-it">Snip it</button>';
        ss +=     '            <button type="button" class="btn btn-default btn-xs snippetEdit">';
        //ss +=     '                <span class="fa fa-pencil fa-lg"></span>';
        ss +=     '                <span class="glyphicon glyphicon-pencil"></span>';
        ss +=     '            </button>';
        ss +=     '            <button type="button" class="btn btn-default btn-xs snippetDelete">';
        ss +=     '                <span class="fa fa-times fa-lg"></span>';
        ss +=     '            </button>';
        ss +=     '        </div>';

        // Always add the title, as it should always be present
        ss +=     '        <div class="snippetTitle">';
        ss +=     '            <h5>' + title + '</h5>';
        ss +=     '            <div class="snippetTextAreas">';

        if (description) {
            // Only add the description section if a description was entered
            if (snippetNoneLayout) {
              ss += '                <div class="' + snippetDesLayout + '" style="display:none">';
            } else {
              ss += '                <div class="' + snippetDesLayout + '">';
            }
            ss += '                    <p class="snippetDesStyle">' + description + '</p>';
            ss += '                </div>';
        } else {
            ss += '                <div class="' + snippetDesLayout + '"></div>';
        }

        if (code) {
            // Only add the code section if a description was entered
            if (snippetNoneLayout) {
              ss += '                <div class="' + snippetCodeLayout + '" style="display:none">';
            } else {
              ss += '                <div class="' + snippetCodeLayout + '">';
            }
            ss += '                    <pre class="snippetCodeStyle ' + codeClass + '">' + code + '</pre>';
            ss += '                </div>';
        }
        ss +=     '            </div>';
        ss +=     '        </div>';
        ss +=     '    </div>';

        // Add snippet meta-data
        // - snippet access (public or private)
        accessStr = access ? "public" : "private";
        ss +=     '    <span class="snippetAccess" style="display:none">' + accessStr + '</span>';
        // - snippet id in an invisible place
        ss +=     '    <span class="snippetID" style="display:none">' + id + '</span>';
        // - snippet creator id
        ss +=     '    <span class="snippetCreatorID" style="display:none">' + creatorId + '</span>';

        ss +=     '</div>';

        return ss;
    }


    // Setup the snippet selector for each newly displayed snippet
    var bindSnippetSelector = function($snippet) {

        // Enable Bootstrap modal-popover
        var $snippetSelector = $snippet.find('div.snippetSelector');

        // Bind a click event and its handler to the new snippet
        $snippetSelector.bind('mouseenter', function() {
            $snippet.find('div.snippetFade').show();
        });
        $snippet.bind('mouseleave', function() {
            $snippet.find('div.snippetFade').hide();
        });

        // Bind the snippet delete button
        $snippet.find('button.snippetDelete').bind('click', function() {
            $("#snippetDeleteDialog").data('snippetElement', $snippet);
            $("#snippetDeleteDialog").modal('show');
            $("#snippetDoDelete").focus();
        });
    }

    var displayNewSnippet = function(snippetId, creatorId, access) {
        /* Adds a new snippet to the DOM */
        var title = $('#titleField').val(),
            description = $('#desField').val(),
            code = $('#codeField').val(),
            ss = buildSnippet(title, description, code, snippetId, creatorId, access, isLoggedIn());

        // Reset form and hide it
        $snippetFormItem = $('#snippetForm');
        $snippetFormItem.hide();
        $snippetFormItem[0].reset();
        
        // Create a new snippet with the form data
        $('#userSnippets').prepend(ss);

        // Add a popover to the snippet selector
        $snippet = $('#userSnippets .snippet:first-child');
        bindSnippetSelector($snippet);
    }

    var incrementTopicCount = function() {
        var $badge = $('#topicPanel .list-group li.topicItem.active span.topicCounter'),
            badge_count = 0,
            $personal_badge = $('#personalSnippetCounter'),
            personal_badge_count = 0;

        if ($badge.length == 0) {
            // No topic is active, so increment the General topic
            $badge = $('#topicPanel .list-group li.topicGeneralItem span.topicCounter');
        }
        badge_count = Number($badge.text());
        $badge.text(badge_count + 1);

        personal_badge_count = Number($personal_badge.text());
        $personal_badge.text(personal_badge_count + 1);
    }

    var decrementTopicCount = function() {
        var $badge = $('#topicPanel .list-group li.topicItem.active span.topicCounter'),
            badge_count = 0,
            $personal_badge = $('#personalSnippetCounter'),
            personal_badge_count = 0;

        if ($badge.length == 0) {
            // No topic is active, so don't decrement any topic counter
            // NOTE: This needs to be fixed. Must find all topics that contained the snippet,
            //       and decrement each topic counter. (I think this is right)
            //$badge = $('#topicPanel .list-group li.topicGeneralItem span.topicCounter');
        }
        badge_count = Number($badge.text());
        $badge.text(badge_count - 1);

        personal_badge_count = Number($personal_badge.text());
        $personal_badge.text(personal_badge_count - 1);
    }

    var displaySnippets = function(snippets) {
        /* Adds the snippets associated with a topic to the DOM */
        var count = 0,
            isUserLoggedIn = false,
            key,
            snippet,
            title = '', description = '', code = '', id = 0;

        // Clear panel to get ready to display snippets in the topic
        $('#userSnippets').empty();

        for (key in snippets) {
            if (count == 0) {
                isUserLoggedIn = isLoggedIn();
            }
            snippet = snippets[key];
            title = snippet.title;
            description = snippet.description;
            code = snippet.code;
            id = snippet.id;
            creator_id = snippet.creator_id;
            access = snippet.access;
            $('#userSnippets').append(buildSnippet(title, description, code, id, creator_id, access, isUserLoggedIn));
            count += 1;

            // Add a popover to the snippet selector
            $newSnippet = $('#userSnippets .snippet:last-child');
            bindSnippetSelector($newSnippet);
        }
        return count;
    }


    /*
     * Public methods
     */

    var createTopic = function(form) {
        var topicName = $('input#topicNameField').val(),
            duplicateNameFound = false;
        console.log("Saving a new topic named " + topicName);

        // Make sure the topic doesn't already exist
        $('#topicPanel .topicItem a').each(function() {
            tmpTopicName = $(this).clone().children().remove().end().text().replace(/^\s+|\s+$/g,'');
            if (topicName.toUpperCase() === tmpTopicName.toUpperCase()) {
                duplicateNameFound = true;
                return;
            }
        });

        if (duplicateNameFound) {
            // Let user know the name already exists
            $('#topicNameField').popover('show');
            isTopicPopoverDisplayed = true;
            return false;
        }

        // Name can't be empty
        if (!topicName) return false;

        // Use AJAX to POST the new topic
        var ajaxOptions = {
            url:'topic/' + topicName,
            type: 'POST',
            dataType: "json",
            success: function(results) {
                displayNewTopic(topicName, results['id']);
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
        return false;
    }

    var updateTopic = function(form) {
        var $topicEditFormItem = $('form#topicEditForm'),
            topicName = $('input#topicEditNameField').val(),
            topicID = parseInt($topicEditFormItem.parent().find('span.topicID').text(), 10);
            data = $(form).serialize(),
            duplicateNameFound = false;
        console.log("Updating a topic named " + topicName);
        if (!topicName) return false;
        if (topicID <= 0) return false;

        // Make sure the topic doesn't already exist
        $('#topicPanel .topicItem a').each(function() {
            var tmpTopicName = $(this).clone().children().remove().end().text().replace(/^\s+|\s+$/g,'');
            if (topicName.toUpperCase() === tmpTopicName.toUpperCase()) {
                duplicateNameFound = true;
                return;
            }
        });

        if (duplicateNameFound) {
            // Let user know the name already exists
            $('#topicEditNameField').popover('show');
            isTopicPopoverDisplayed = true;
            return false;
        }

        // Use AJAX to update a topic name
        var ajaxOptions = {
            url:'topic/' + topicID,
            type: 'PUT',
            dataType: "json",
            data: $(form).serialize(),
            //data: data,
            success: function(results) {
                var $topicNameItem = $topicEditFormItem.parent().find('a.topicName');

                // Update topic with new name
                $topicNameItem.text(topicName);

                // Hide the topic edit form and show <a class='topicName'></a> element
                topicEditReset();
            },
            error: function(req, status, error) {
                topicEditReset();
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
        return false;
    }

    var resetTopicEdit = function(topicItem) {
        var $topicNameItem = $(topicItem).find('a.topicName'),
            $topicEditFormItem = $('form#topicEditForm'),
            $topicEditNameFieldItem = $('input#topicEditNameField');

        var topicFormReset = function() {
            $topicEditFormItem.hide();
            $topicNameItem.show();
        }
        return topicFormReset;
    }

    var editTopic = function(topicItem) {
        var $topicNameItem = $(topicItem).find('a.topicName'),
            $topicEditFormItem = $('form#topicEditForm'),
            $topicEditNameFieldItem = $('input#topicEditNameField'),
            $topicDeleteItem = $(topicItem).find('span.topicDelete'),
            topicName = $topicNameItem.clone().children().remove().end().text().replace(/^\s+|\s+$/g,'');
        if (!topicName) return;

        // Call the old topic form resetter - it is idempotent, so calling multiple times is okay
        topicEditReset();
        // Create a resetter function to undo the following form actions for the particular topic item
        topicEditReset = resetTopicEdit(topicItem);

        // Hide element with the topic name
        $topicNameItem.hide();

        // Move/Put the form element to the same place where the topic name was shown
        // Rather than poping up a whole new edit dialog, it is nice just to be able
        // to edit the name of the topic in place. So, that is why we are hiding the 
        // topic name, and adding an input form element to change the name.
        $topicDeleteItem.after($topicEditFormItem);
        $topicEditNameFieldItem.val(topicName);
        $topicEditFormItem.show();

        console.log("Editing topic " + topicName);
    }

    var removeDeletedTopic = function(topicItem, numGeneralSnippets) {
        var topicName = $(topicItem).find('a').clone().children().remove().end().text().replace(/^\s+|\s+$/g,'');

        // Remove the topic from the topic panel
        topicItem.remove();

        // Select the 'General' element's topic counter, and increment by numGeneralSnippets
        $generals_badge = $('#topicPanel .list-group li.topicGeneralItem span.topicCounter');
        badge_count = Number($generals_badge.text());
        $generals_badge.text(badge_count + numGeneralSnippets);

        // If the deleted topic was displayed in the snippet panel,
        // clear the snippet panel.
        topicDisplayedInSnippetPanel = $('#snippetTopicSearchDisplay').text();
        if (topicDisplayedInSnippetPanel == topicName) {
            $('#userSnippets').empty();
            $('#snippetTopicSearchDisplay').empty();
        }
    }

    var deleteTopic = function(topicItem) {
        /*
         * Deletes a topic from the list of topics.
         * - Sends an AJAX 'DELETE' request to delete the topic from the db.
         * - Removes the topic name from the topic panel
         */

        var topicName = $(topicItem).find('a').clone().children().remove().end().text().replace(/^\s+|\s+$/g,''),
            topicID = $(topicItem).find('span.topicID').text();

        // Use AJAX to delete the topic
        var ajaxOptions = {
            url:'topic/' + topicID,
            type: 'DELETE',
            dataType: "json",
            success: function(results) {
                console.log("Deleted topic " + topicName + " - id " + results.id + ", added " +
                             results.new_general_snippets + " to the General topic");
                removeDeletedTopic(topicItem, results.new_general_snippets);
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
    }

    var createSnippet = function(snippetAddButton) {
        /*
         * Creates a new snippet from the snippet form control,
         * sends an AJAX request to persist the new snippet,
         * and adds the new snippet to the DOM
         */

        var that = $(snippetAddButton),
            title = $('#titleField').val(),
            data = $("#snippetForm").serialize(),
            topicName = $('#topicPanel .topicItem.active').find('a').clone().children().remove().end().text().replace(/^\s+|\s+$/g,'');

        // Must have at least a snippet title
        if (!title) return false;

        // Let the snippet get added to the "General" topic if no topic is current selected.
        // The user always has the "General" topic
        if (!topicName) {
            topicName = 'General'
        }

        // Use AJAX to POST the new snippet
        var ajaxOptions = {
            url:'snippets/' + topicName,
            type: 'POST',
            dataType: "json",
            data: data,
            success: function(results) {
                displayNewSnippet(results['id'], results['creator_id'], results['access']);
                incrementTopicCount();
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
        return false;
    };


    var isLoggedIn = function() {
        return ($('#personalSnippetCounter').length) > 0 ? true : false;
    }

    var searchSnippets = function(form) {
        // Get search string

        var searchAccess =  $('#personalSnippetCounter').hasClass('selected') ? "personal" : "public",
            searchString = form.q.value;

        // Use AJAX to GET a list searched snippets
        var ajaxOptions = {
            url:'snippets/search/' + searchAccess,
            type: 'GET',
            dataType: "json",
            data: $(form).serialize(),
            success: function(results) {
                var headerString = '"' + searchString + '"' + ' search',
                    count = displaySnippets(results);

                // Update the UI to show the currently displayed search snippets
                $('#snippetTopicSearchDisplay').text(headerString);

                // Deselect any topic currently selected
                $('#topicPanel div.panel-body li.topicItem').removeClass('active');
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
        $('#snippetSearchForm')[0].reset();
        return false;
    }


    var displayTopicSnippets = function(topicItem) {
        /*
         * Displays the selected topic in the snippet panel,
         * sends an AJAX 'GET' request to get the list of snippets
         * associated with the topic, and updates the snippet panel
         * with the returned snippets
         */

        var that = $(topicItem),
            // Get only the "li a" element text, not the children span's badge "count" text
            topicName = $(topicItem).find('a').clone().children().remove().end().text().replace(/^\s+|\s+$/g,'');
        if (!topicName) return;

        // Use AJAX to GET a list snippets
        var ajaxOptions = {
            url:'snippets/' + topicName,
            type: 'GET',
            dataType: "json",
            success: function(results) {
                var headerString = '"' + topicName + '"' + ' topic',
                    count = displaySnippets(results);

                // Update the UI to show the currently displayed topic snippets
                $('#snippetTopicSearchDisplay').text(headerString);

                // Select topic in topic panel and increment its badge
                $('#topicPanel div.panel-body li.topicItem').removeClass('active');
                that.addClass('active');
                that.find('a span').text(count);
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
    };


    var deleteSnippet = function($snippet) {
        var snippetID = $snippet.find('span.snippetID').text();

        // Use AJAX to delete the snippet
        var ajaxOptions = {
            url:'snippets/' + snippetID,
            type: 'DELETE',
            dataType: "json",
            success: function(results) {
                console.log("Deleted snippet " + results.id);
                $snippet.remove();
                decrementTopicCount()
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
    };


    var showSnippetsInColumns = function() {
        // Update snippet description and code have columnar layout
        $('.snippetDes-row').toggleClass('snippetDes-row snippetDes-col');
        $('.snippetCode-row').toggleClass('snippetCode-row snippetCode-col');
        $('.snippetDes-col').css('display', 'block');
        $('.snippetCode-col').css('display', 'block');

        // Make the title, description and code visible
        $('#snippetColIcon span').addClass('active');
        $('#snippetRowIcon span').removeClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');

        // Save away the layout state
        snippetDesLayout = SNIPPET_DES_COL;
        snippetCodeLayout = SNIPPET_CODE_COL;
        snippetNoneLayout = false;
    };

    var showSnippetsInRows = function() {
        // Update snippet description and code have row layout
        $('.snippetDes-col').toggleClass('snippetDes-col snippetDes-row');
        $('.snippetCode-col').toggleClass('snippetCode-col snippetCode-row');
        $('.snippetDes-row').css('display', 'block');
        $('.snippetCode-row').css('display', 'block');

        // Make the title, description and code visible
        $('#snippetColIcon span').removeClass('active');
        $('#snippetRowIcon span').addClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');

        // Save away the layout state
        snippetDesLayout = SNIPPET_DES_ROW;
        snippetCodeLayout = SNIPPET_CODE_ROW;
        snippetNoneLayout = false;
    };

    var showSnippetTitlesOnly = function() {
        // Update snippet description and code to be hidden - show only the title
        $('.snippetDes-row').css('display', 'none');
        $('.snippetCode-row').css('display', 'none');
        $('.snippetDes-col').css('display', 'none');
        $('.snippetCode-col').css('display', 'none');

        // Make the title, description and code visible
        $('#snippetColIcon span').removeClass('active');
        $('#snippetRowIcon span').removeClass('active');
        $('#snippetTitleOnlyIcon span').addClass('active');

        // Save away the layout state
        snippetNoneLayout = true;
    };


    // Use VEX dialogs to show the application instructions
    var showSigninDialog = function() {
		vex.open({
			contentClassName: 'signinDialog',
			content: 
                '<h2>Sign In</h2>' +
                '<a href="/signin/facebook">' +
                '  <div class="signinButton facebookButton">' +
                '    <i class="fa fa-facebook-square"></i>' +
                '    <p>Sign in with Facebook</p>' +
                '  </div></a>' +
                '<a href="/signin/twitter">' +
                '  <div class="signinButton twitterButton">' +
                '    <i class="fa fa-twitter-square"></i>' +
                '    <p>Sign in with Twitter</p>' +
                '  </div></a>' +
                '<a href="/signin/google">' +
                '  <div class="signinButton googleButton">' +
                '    <i class="fa fa-google-plus-square"></i>' +
                '    <p>Sign in with Google</p>' +
                '  </div></a>',
			overlayClassName:'signinDialogOverlay',
			showCloseButton:false});
	}

    return {
        // Exported getters and setters
        get isTopicPopoverDisplayed()            { return isTopicPopoverDisplayed; },
        set isTopicPopoverDisplayed(bool)        { isTopicPopoverDisplayed = bool; },
        get isTopicEditModeEnabled()             { return isTopicEditModeEnabled; },
        set isTopicEditModeEnabled(bool)         { isTopicEditModeEnabled = bool; },
        get isTopicAddModeEnabled()              { return isTopicAddModeEnabled; },
        set isTopicAddModeEnabled(bool)          { isTopicAddModeEnabled = bool; },

        createTopic:createTopic,
        editTopic:editTopic,
        updateTopic:updateTopic,
        deleteTopic:deleteTopic,
        createSnippet:createSnippet,
        deleteSnippet:deleteSnippet,
        searchSnippets:searchSnippets,
        displayTopicSnippets:displayTopicSnippets,
        showSnippetsInColumns:showSnippetsInColumns,
        showSnippetsInRows:showSnippetsInRows,
        showSnippetTitlesOnly:showSnippetTitlesOnly,
        showSigninDialog:showSigninDialog
    };
})();


$(document).ready(function() {

    var topicPanelWidthRatio = topicPanelRatio();

    function topicPanelRatio() {
        return $('#topicPanel').width() / $('#topicPanel').parent().width();
    }

    /* 
     * Header Controls
     */

    // 'Sign In' link is clicked
    $('#signin').click(snippet.showSigninDialog);


    /* 
     * Topic Panel Controls
     */

    // Topic 'add' button is clicked
    $('#topicAdd').click(function() {
        if (!snippet.isTopicEditModeEnabled) {
            snippet.isTopicAddModeEnabled = !snippet.isTopicAddModeEnabled;
            if (snippet.isTopicAddModeEnabled) {
                $('#topicFormContainer').show();
                $(this).find('span').addClass('selected');

                // Clear out the form and set the focus
                $('#topicForm')[0].reset();
                $('#topicNameField').focus();
            } else {
                $('#topicFormContainer').hide();
                $(this).find('span').removeClass('selected');

                // Remove the popover if displayed
                $('#topicNameField').popover('hide');
                snippet.isTopicPopoverDisplayed = false;
            }
        }
    });

    // Topic 'edit' button is clicked - enable delete buttons on each topic name
    $('#topicEdit').click(function() {
        if (!snippet.isTopicAddModeEnabled) {
            snippet.isTopicEditModeEnabled = !snippet.isTopicEditModeEnabled;
            if (snippet.isTopicEditModeEnabled) {
                $('#topicPanel li span.topicDelete').show();
                $(this).find('span').addClass('selected');
            } else {
                $('#topicPanel li span.fa.topicDelete').hide();
                $(this).find('span').removeClass('selected');

                // Remove the topic edit form if displayed
                topicEditReset();

                // Remove the popover if displayed
                $('#topicEditNameField').popover('hide');
                snippet.isTopicPopoverDisplayed = false;
            }
        }
    });

    // Enable Bootstrap Modal Dialog for the Topic Delete action
    $("#topicDeleteDialog").modal({backdrop:'static', keyboard:false, show:false});
    $("#topicDoDelete").click(function() {
        // Delete the topic here
        var $topic = $("#topicDeleteDialog").data('topicElement');
        snippet.deleteTopic($topic);
        $("#topicDeleteDialog").modal('hide');
    });

    // Topic delete button in topic panel is clicked - will delete topic here
    $('#topicPanel').on('click', 'span.topicDelete', function() {
        var $topic = $(this).parent();
        if ($topic.hasClass('topicGeneralItem')) {
            // Don't delete the general topic
        } else {
            // Prompt user to see if topic should really be deleted
            $("#topicDeleteDialog").data('topicElement', $topic);
            $("#topicDeleteDialog").modal('show');
            $("#topicDoDelete").focus();
        }
    });

    var notifyInEditMode = function(times) {
        $editIcon = $('#topicEdit span');
        if (times > 0) {
            if (times %2) {
                $editIcon.addClass('fa-rotate-90');
            } else {
                $editIcon.removeClass('fa-rotate-90');
            }
            times -= 1;
            setTimeout(notifyInEditMode, 50, times);
        } else {
            $editIcon.removeClass('fa-rotate-90');
        }
    }

    // A topic was clicked, so display its snippets in the snippet panel
    $('#topicPanel').on('click', 'li.topicItem a.topicName', function(event) {
        var $topicItem = $(this).parent();

        if (snippet.isTopicEditModeEnabled) {
            if ($topicItem.hasClass('topicGeneralItem')) {
                // User might get confused when clicking on the 'General' topic when in edit mode.
                // So alert them somehow as to their condition
                notifyInEditMode(7);
            } else {
                snippet.editTopic($topicItem);
            }
        } else {
            snippet.displayTopicSnippets($topicItem);
        }
    });

    // Enable Bootstrap popover for the topic name input field
    var enablePopover = function($element) {
        $element.popover({container:'body', trigger:'manual', toggle:'popover', placement:'right',
                                      content:"This name already exists. Please type another name."});
        // Dismiss the popover upon click
        $element.click(function() {
            if (snippet.isTopicPopoverDisplayed) {
                $(this).popover('hide');
                snippet.isTopicPopoverDisplayed = false;
            }
        });
        $element.on('input', function() {
            if (snippet.isTopicPopoverDisplayed) {
                $(this).popover('hide');
                snippet.isTopicPopoverDisplayed = false;
            }
        });
    }
    enablePopover($('#topicNameField'));
    enablePopover($('#topicEditNameField'));


    /* 
     * Snippet Panel Controls
     */

    // Snippet 'add' button is clicked
    $('#snippetAdd').click(function() {
        // Relocate the snippetForm to the top of the displayed snippet list
        $snippetFormItem = $('#snippetForm');
        $('#userSnippets').before($snippetFormItem);
        $snippetFormItem.show();

        $('#titleField').focus();
        $(this).find('span').addClass('selected');
    });

    // 'Columns' icon in snippet panel is clicked
    $('#snippetColIcon').click(snippet.showSnippetsInColumns);

    // 'Rows' icon in snippet panel is clicked
    $('#snippetRowIcon').click(snippet.showSnippetsInRows);

    // 'Title Only' icon in snippet panel is clicked
    $('#snippetTitleOnlyIcon').click(snippet.showSnippetTitlesOnly);


    var showTopicPanel = function(panelWidthRatio, callback) {
        var topicPanelWidth = $('#topicPanel').width(),
            snippetPanelWidth = $('#snippetPanel').width(),
            snippetBlockWidth = $('#snippetBlock').width(),
            deltaFactor = 0.3, // decrease for faster animation
            delta = snippetBlockWidth / (100.0 * deltaFactor),  // make larger 1/100 of the whole snippet area
            newTPW = topicPanelWidth + delta;

        if (newTPW < (snippetBlockWidth * panelWidthRatio)) {
            $('#snippetPanel').width(snippetPanelWidth - delta);
            $('#topicPanel').width(newTPW);
            setTimeout(showTopicPanel, 1, panelWidthRatio, callback);
        } else {
            var spwStr = (((1.0 - panelWidthRatio) * 100.0) - 2).toString() + '%',
                tpwStr = (panelWidthRatio * 100.0).toString() + '%';
            $('#snippetPanel').width(spwStr);
            $('#topicPanel').width(tpwStr);

            if (typeof callback == "function") {
                callback(); // rotate the icon when the "show" is complete
            }
        }
    }

    var hideTopicPanel = function(callback) {
        var topicPanelWidth = $('#topicPanel').width(),
            snippetPanelWidth = $('#snippetPanel').width(),
            snippetBlockWidth = $('#snippetBlock').width(),
            deltaFactor = .4, // decrease for faster animation
            delta = snippetBlockWidth / (100.0 * deltaFactor);  // make smaller 1/100 of the whole snippet area
        if (topicPanelWidth > (delta * deltaFactor)) {
            $('#topicPanel').width(topicPanelWidth - delta);
            $('#snippetPanel').width(snippetPanelWidth + delta);
            setTimeout(hideTopicPanel, 1, callback);
        } else { 
            $("#topicPanel").width(0);
            $("#topicPanel").toggle();
            $('#snippetPanel').width('100%');

            if (typeof callback == "function") {
                callback(); // rotate the icon when the "hide" is complete
            }
        }
    }

    var updateTopicPanel = function() {
        if ($(this).hasClass('deactivate')) return;
        if($('#topicPanel').css('display') != 'none') {
            hideTopicPanel(function() {
                $('#toggleIcon span').removeClass('fa-rotate-90');
            });
        } else {
            var snippetPanelWidth = $('#snippetPanel').width(),
                snippetBlockWidth = $('#snippetBlock').width(),
                delta = snippetBlockWidth / 100.0;
            $('#snippetPanel').width(snippetPanelWidth - delta/4);
            $("#topicPanel").css('display', 'block');
            showTopicPanel(topicPanelWidthRatio, function() {
                $('#toggleIcon span').addClass('fa-rotate-90');
            });
        }
    };
    $('#toggleIcon').click(updateTopicPanel);


    /* 
     * Snippet Form Controls
     */

    // New snippet 'save' button clicked
    $('#snippetSave').click(function() {
        snippet.createSnippet(this);
        $('#snippetAdd').find('span').removeClass('selected');
    });

    // New snippet 'cancel' button clicked
    $('#snippetCancel').click(function() {
        $snippetFormItem = $('#snippetForm');
        $snippetFormItem.hide();
        $snippetFormItem[0].reset();
        $('#snippetAdd').find('span').removeClass('selected');
    });

    // Eatup the form keyboard 'enter' event, so the user must click the submit button
    $("#snippetForm").bind("keyup keypress", function(event) {
        var code = event.keyCode || event.which,
            target = event.target.nodeName;

        // Don't eat up the 'enter' key when typing in <textarea> tags.
        if (target.toUpperCase().search('TEXTAREA') == -1) {
            if (code == 13) {
                event.preventDefault();
                return false;
            }
        }
    });

    // Enable Bootstrap Modal Dialog for the Snippet Selector Delete Button
    $("#snippetDeleteDialog").modal({backdrop:'static', keyboard:false, show:false});

    $("#snippetDoDelete").click(function() {
        var $snippet = $("#snippetDeleteDialog").data('snippetElement');
        snippet.deleteSnippet($snippet);
        $("#snippetDeleteDialog").modal('hide');
    });

    $("#snippetSearchField").on("focus blur", function() {
        $("#snippetSearchDiv").toggleClass("focused");
    });

    $("#personalSnippetCounter").click(function() {
        $("#snippetSearchField").attr("placeholder", "Search personal snippets");
        $(this).addClass('selected');
        $("#publicSnippetCounter").removeClass('selected');
    });
    $("#publicSnippetCounter").click(function() {
        $("#snippetSearchField").attr("placeholder", "Search public snippets");
        $(this).addClass('selected');
        $("#personalSnippetCounter").removeClass('selected');
    });

    $('#signout').click(function() {
    });
});

