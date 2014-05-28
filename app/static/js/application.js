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

    /*
     * Local methods
     */

    var buildTopic = function(topicName, id) {
        var t  = '<li class="list-group-item topicItem">';
            t += '    <span class="fa fa-minus-circle topicDelete" style="display:none"></span>';
            t += '    <a href="#" class="topicName">' + topicName + '</a>';
            t += '    <span class="badge pull-right topicCounter">0</span>';
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


    var buildSnippet = function(title, description, code, id) {
        var ss =  '<div class="snippet">';
        ss +=     '    <div class="snippetSelector">';
        ss +=     '        <a href="#"><span class="fa fa-circle-o fa-2x"></span></a>';
        ss +=     '    </div>';
        ss +=     '    <div class="snippetContent">';
        ss +=     '        <div class="snippetFade" style="display:none">';
        ss +=     '            <button type="button" class="btn btn-danger btn-xs snip-it">Snip it</button>';
        ss +=     '            <button type="button" class="btn btn-default btn-xs snippetDelete">delete</button>';
        ss +=     '            <button type="button" class="btn btn-default btn-xs snippetEdit">';
        ss +=     '                <span class="glyphicon glyphicon-pencil"></span>';
        ss +=     '            </button>';
        ss +=     '        </div>';

        // Add the snippet id in an invisible place
        ss +=     '        <span class="snippetID" style="display:none">' + id + '</span>';

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
            ss += '                    <pre class="snippetCodeStyle">' + code + '</pre>';
            ss += '                </div>';
        }
        ss +=     '            </div>';
        ss +=     '        </div>';
        ss +=     '    </div>';
        ss +=     '</div>';

        return ss;
    }


    // Enable Bootstrap modal-popover for the snippet selector
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
            deleteSnippet($snippet);
        });
    }

    var displayNewSnippet = function(snippet_id) {
        /* Adds a new snippet to the DOM */
        var title = $('#titleField').val(),
            description = $('#desField').val(),
            code = $('#codeField').val(),
            ss = buildSnippet(title, description, code, snippet_id);

        // Reset form and hide it
        $('#snippetForm')[0].reset();
        $('#snippetForm').hide();
        
        // Create a new snippet with the form data
        $('#userSnippets').prepend(ss);

        // Add a popover to the snippet selector
        $snippet = $('#userSnippets .snippet:first-child');
        bindSnippetSelector($snippet);
    }

    var incrementTopicCount = function() {
        var $badge = $('#topicPanel .list-group li.topicItem.active span.topicCounter'),
            badge_count = 0;

        if ($badge.length == 0) {
            // No topic is active, so increment the General topic
            $badge = $('#topicPanel .list-group li.topicGeneralItem span.topicCounter');
        }
        badge_count = Number($badge.text());
        $badge.text(badge_count + 1);
    }

    var decrementTopicCount = function() {
        var $badge = $('#topicPanel .list-group li.topicItem.active span.topicCounter'),
            badge_count = 0;

        if ($badge.length == 0) {
            // No topic is active, so don't decrement any topic counter
            // NOTE: This needs to be fixed. Must find all topics that contained the snippet,
            //       and decrement each topic counter. (I think this is right)
            //$badge = $('#topicPanel .list-group li.topicGeneralItem span.topicCounter');
        }
        badge_count = Number($badge.text());
        $badge.text(badge_count - 1);
    }

    var updateTopicSnippets = function(snippets) {
        /* Adds the snippets associated with a topic to the DOM */
        var count = 0,
            key,
            snippet,
            title = '', description = '', code = '', id = 0;

        // Clear panel to get ready to display snippets in the topic
        $('#userSnippets').empty();

        // Show the new snippets
        for (key in snippets) {
            snippet = snippets[key];
            title = snippet.title;
            description = snippet.description;
            code = snippet.code;
            id = snippet.id;
            $('#userSnippets').append(buildSnippet(title, description, code, id));
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
        var topicName = form.topicName.value.replace(/^\s+|\s+$/g,''),
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

        // Use AJAX to persist the new topic
        // Use AJAX to POST the new snippet
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
            topicname = $('#snippetTopicSearchDisplay').text();

        // Must have at least a snippet title
        if (!title) return false;

        // Let the snippet get added to the "General" topic if no topic is current selected.
        // The user always has the "General" topic
        if (!topicname) {
            topicname = 'General'
        }

        // Use AJAX to POST the new snippet
        var ajaxOptions = {
            url:'snippets/' + topicname,
            type: 'POST',
            dataType: "json",
            data: data,
            success: function(results) {
                displayNewSnippet(results['id']);
                incrementTopicCount();
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
        return false;
    };


    var displayTopicSnippets = function(topicItem) {
        /*
         * Displays the selected topic in the snippet panel,
         * sends an AJAX 'GET' request to get the list of snippets
         * associated with the topic, and updates the snippet panel
         * with the returned snippets
         */

        var that = $(topicItem),
            // Get only the "li a" element text, not the children span's badge "count" text
            topicname = $(topicItem).find('a').clone().children().remove().end().text().replace(/^\s+|\s+$/g,'');
        if (!topicname) return;

        // Use AJAX to GET a list snippets
        var ajaxOptions = {
            url:'snippets/' + topicname,
            type: 'GET',
            dataType: "json",
            success: function(results) {
                var count = updateTopicSnippets(results);

                // Update the UI to show the currently displayed topic snippets
                $('#snippetTopicSearchDisplay').text(topicname);

                // Select topic in topic panel
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


    var showSnippetsHorizontal = function() {
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

    var showSnippetsVertical = function() {
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
        get isTopicPopoverDisplayed()     { return isTopicPopoverDisplayed; },
        set isTopicPopoverDisplayed(bool) { isTopicPopoverDisplayed = bool; },
        get isTopicEditModeEnabled()      { return isTopicEditModeEnabled; },
        set isTopicEditModeEnabled(bool)  { isTopicEditModeEnabled = bool; },
        get isTopicAddModeEnabled()       { return isTopicAddModeEnabled; },
        set isTopicAddModeEnabled(bool)   { isTopicAddModeEnabled = bool; },

        createTopic:createTopic,
        deleteTopic:deleteTopic,
        createSnippet:createSnippet,
        displayTopicSnippets:displayTopicSnippets,
        showSnippetsHorizontal:showSnippetsHorizontal,
        showSnippetsVertical:showSnippetsVertical,
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
            }
        }
    });

    // Topic delete button in topic panel is clicked - will delete topic here
    $('#topicPanel').on('click', 'span.topicDelete', function() {
        var $listItem = $(this).parent();
        if ($listItem.hasClass('topicGeneralItem')) {
            // Don't delete the general topic
        } else {
            // Delete the topic here
            snippet.deleteTopic($listItem);
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
    $('#topicPanel').on('click', 'li.topicItem', function() {
        if (snippet.isTopicEditModeEnabled) {
            if ($(this).hasClass('topicGeneralItem')) {
                // User might get confused when clicking on the 'General' topic when in edit mode.
                // So alert them somehow as to their condition
                notifyInEditMode(7);
            }
        } else {
            snippet.displayTopicSnippets(this);
        }
    });

    // Enable Bootstrap popover for the topic name input field
    $('#topicNameField').popover({container:'body', trigger:'manual', toggle:'popover', placement:'right',
                                  content:"This name already exists. Please type another name."});
    // Dismiss the popover upon click
    $('#topicNameField').click(function() {
        if (snippet.isTopicPopoverDisplayed) {
            $(this).popover('hide');
            snippet.isTopicPopoverDisplayed = false;
        }
    });
    $('#topicNameField').on('input', function() {
        if (snippet.isTopicPopoverDisplayed) {
            $(this).popover('hide');
            snippet.isTopicPopoverDisplayed = false;
        }
    });


    /* 
     * Snippet Panel Controls
     */

    // Snippet 'add' button is clicked
    $('#snippetAdd').click(function() {
        $('#snippetForm').show();
        $('#titleField').focus();
        $(this).find('span').addClass('selected');
    });

    // 'Columns' icon in snippet panel is clicked
    $('#snippetColIcon').click(snippet.showSnippetsHorizontal);

    // 'Rows' icon in snippet panel is clicked
    $('#snippetRowIcon').click(snippet.showSnippetsVertical);

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
        $('#snippetForm').hide();
        $('#snippetForm')[0].reset();
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

    // Snippet Selector
    $('.snippetSelector').on('mouseenter', function() {
        console.log("Snippet Selector is selected");
    });

    $('.snippetSelector').on('mouseleave', function() {
        console.log("Snippet Selector is not selected");
    });

});

