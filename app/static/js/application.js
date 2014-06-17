var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var viewUtils = (function() {
    var SNIPPET_DES_COL =   'snippetDes-col',
        SNIPPET_DES_ROW =   'snippetDes-row',
        SNIPPET_CODE_COL =  'snippetCode-col',
        SNIPPET_CODE_ROW =  'snippetCode-row',
        snippetDesLayout =  SNIPPET_DES_COL,
        snippetCodeLayout = SNIPPET_CODE_COL,
        snippetNoneLayout = false,
        isTopicPopoverDisplayed = false,
        isTopicEditModeEnabled = false,
        isTopicAddModeEnabled = false,
        isSnippetEditModeEnabled = false,
        topicEditReset   = function() {},
        snippetFormReset = function() {},
        updateSnippet = function() {},
        codeEditor = {},
        codeEditorTheme = 'eclipse',
        codeEditorMode = 'javascript',
        desEditor = {},
        desEditorTheme = 'eclipse',
        desEditorMode = 'default';

    /*
     * Private methods
     */

    var snippetUpdater = function($snippet) {
        var updateSnippet = function(title, description, code) {
            // Update the snippet title
            $snippet.find('.snippetTitleText').text(title);

            // Update the snippet description
            $snippet.find('.snippetContent .snippetDesText').html(description);
            $snippet.find('.snippetTextAreas .snippetDesText').show();

            // Update the snippet code
            $snippet.find('.snippetContent .snippetCodeText').html(code);
            $snippet.find('.snippetTextAreas .snippetCodeText').show();
        }
        return updateSnippet;
    }

    var setFormTextAreaHeight = function($snippetForm) {
        var taLineHeight = 0,
            taHeight = 0,
            numberOfLines = 0,
            $desField  = $snippetForm.find('#desField'),
            $codeField = $snippetForm.find('#codeField'),
            defaultNumRows = 4;

        // Get the line height info for the description textarea
        taLineHeight = parseInt($desField.css('line-height'), 10);
        taHeight = $desField.prop('scrollHeight');
        numberOfLines = Math.floor(taHeight / taLineHeight);
        numberOfLines = numberOfLines > defaultNumRows ? numberOfLines : defaultNumRows;

        // Set the height of the textarea
        $desField.attr('rows', numberOfLines);
        $desField.css({'resize':'vertical'});

        // Get the line height info for the code textarea
        taLineHeight = parseInt($codeField.css('line-height'), 10);
        taHeight = $codeField.prop('scrollHeight');
        numberOfLines = Math.floor(taHeight / taLineHeight);
        numberOfLines = numberOfLines > defaultNumRows ? numberOfLines : defaultNumRows;

        // Set the height of the textarea
        $codeField.attr('rows', numberOfLines);
        $codeField.css({'resize':'vertical'});
    }

    var snippetFormResetter = function($snippet, $snippetForm) {
        var snippetFormReset = function() {
            var $desField = $snippetForm.find('#desField'),
                $codeField = $snippetForm.find('#codeField'),
                $desEditorNode = desEditor.getWrapperElement(),
                $codeEditorNode = codeEditor.getWrapperElement();

            // Hide and reset the form, and set textarea row size to 1
            $snippetForm.hide();
            $snippetForm[0].reset();
            $desEditorNode.remove(); // Remove the CodeMirror description editor
            $codeEditorNode.remove(); // Remove the CodeMirror code editor
            desEditor = function() {};
            codeEditor = function() {};

            $desField.css('height', 'auto'); // auto allow textarea 'rows' attribute to work again
            $desField.attr('rows', 1);

            $codeField.css('height', 'auto'); // auto allow textarea 'rows' attribute to work again
            $codeField.attr('rows', 1);

            // Relocate the snippetForm somewhere outside of #userSnippets
            // so it won't get deleted when the #userSnippets area is refreshed.
            $('#userSnippets').after($snippetForm);
            isSnippetEditModeEnabled = false;

            // If a snippet was being edited, display it again
            if ($snippet != undefined) {
                $snippet.show();
            }

            $('#modalCover').hide();
        }
        return snippetFormReset;
    }

    var isSnippetFormEnabled = function() {
        snippetFormDisplayState = $('#snippetForm').css('display');
        if (snippetFormDisplayState == 'none' ||
            snippetFormDisplayState == undefined) {
            return false;
        } else {
            return true;
        }
    }

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
            codeClass = "",
            accessStr = access ? "public" : "private",
            ss = "";

        if (isLoggedIn) {
            if (creatorId == userId) {
                codeClass = "owned";
            } else {
                codeClass = "notOwned";
            }
        } else {
            codeClass = "notOwned";
        }

        ss +=     '<div class="snippet">';
        ss +=     '    <div class="snippetSelector">';
        ss +=     '        <a href="#"><span class="fa fa-circle-o fa-2x"></span></a>';
        ss +=     '    </div>';
        ss +=     '    <div class="snippetContent">';
        ss +=     '        <div class="snippetFade" style="display:none">';
        ss +=     '            <button type="button" class="btn btn-danger btn-xs layout snip-it">Snip it</button>';
        ss +=     '            <div class="layout snippetColLayout">';
        ss +=     '                <span class="fa fa-minus-square-o fa-rotate-90 fa-2x">';
        ss +=     '            </div>';
        ss +=     '            <div class="layout snippetRowLayout">';
        ss +=     '                <span class="fa fa-minus-square-o fa-2x"></span>';
        ss +=     '            </div>';
        ss +=     '            <div class="layout snippetTitleOnlyLayout">';
        ss +=     '                <span class="fa fa-square-o fa-2x"></span>';
        ss +=     '            </div>';
        if (codeClass == "owned") {
            ss += '            <div class="layout snippetEdit">';
            ss += '                <span class="fa fa-pencil-square-o fa-2x"></span>';
            ss += '            </div>';
            ss += '            <div class="layout snippetDelete">';
            ss += '                <span class="fa fa-times fa-2x"></span>';
            ss += '            </div>';
        }
        ss +=     '        </div>';

        // Always add the title, as it should always be present
        ss +=     '        <div class="snippetTitle">';
        ss +=     '            <h5 class="snippetTitleText">' + title + '</h5>';
        ss +=     '            <div class="snippetTextAreas">';

        if (description) {
            // Only add the description section if a description was entered
            if (snippetNoneLayout) {
              ss += '              <div class="snippetDesText snippetDesStyle ' + snippetDesLayout + '" style="display:none">';
            } else {
              ss += '              <div class="snippetDesText snippetDesStyle ' + snippetDesLayout + '">';
            }
            ss += description + '</div>';
        } else {
            ss += '                <div class="snippetDesText snippetDesStyle ' + snippetDesLayout + '"></div>';
        }

        if (code) {
            // Only add the code section if a description was entered
            if (snippetNoneLayout) {
                ss += '            <div class="snippetCodeText snippetCodeStyle ' + snippetCodeLayout + ' ' + codeClass + '" style="display:none">';
            } else {
                ss += '            <div class="snippetCodeText snippetCodeStyle ' + snippetCodeLayout + ' ' + codeClass + '">';
            }
            //ss += '<pre>' + code + '</pre></div>'; // use for CodeMirror "Test 1" method, described elsewhere
            ss += code + '</div>';
        } else {
            ss += '                <div class="snippetCodeText snippetCodeStyle ' + snippetCodeLayout + ' ' + codeClass + '"></div>';
        }
        ss +=     '        </div>';
        ss +=     '    </div>';

        // Add snippet meta-data
        // - snippet access (public or private)
        ss +=     '    <span class="snippetAccess" style="display:none">' + accessStr + '</span>';
        // - snippet id in an invisible place
        ss +=     '    <span class="snippetID" style="display:none">' + id + '</span>';
        // - snippet creator id
        ss +=     '    <span class="snippetCreatorID" style="display:none">' + creatorId + '</span>';

        ss +=     '</div>';

        return ss;
    }

    var highlightSnippetLayout = function($snippetFade, layout) {
        if (layout === 'snippetColLayout') {
            // Highlight the Columnar layout button
            $snippetFade.find('.layout.snippetRowLayout span').removeClass('active');
            $snippetFade.find('.layout.snippetTitleOnlyLayout span').removeClass('active');
            $snippetFade.find('.layout.snippetColLayout span').addClass('active');
        } else if (layout === 'snippetRowLayout') {
            // Highlight the Row layout button
            $snippetFade.find('.layout.snippetColLayout span').removeClass('active');
            $snippetFade.find('.layout.snippetTitleOnlyLayout span').removeClass('active');
            $snippetFade.find('.layout.snippetRowLayout span').addClass('active');
        } else if (layout === 'snippetTitleOnlyLayout') {
            // Highlight the TitleOnly layout button
            $snippetFade.find('.layout.snippetColLayout span').removeClass('active');
            $snippetFade.find('.layout.snippetRowLayout span').removeClass('active');
            $snippetFade.find('.layout.snippetTitleOnlyLayout span').addClass('active');
        }
    }

    var showSnippetCol = function(event) {
        var $snippet = event.data.snippet,
            $snippetFade    = $snippet.find('div.snippetFade');

        // Set the layout of the snippet to columnar
        $snippet.find('.snippetContent .snippetDes-row').toggleClass('snippetDes-row snippetDes-col');
        $snippet.find('.snippetContent .snippetCode-row').toggleClass('snippetCode-row snippetCode-col');
        $snippet.find('.snippetContent .snippetDes-col').css('display', 'block');
        $snippet.find('.snippetContent .snippetCode-col').css('display', 'block');

        highlightSnippetLayout($snippetFade, 'snippetColLayout');
    }

    var showSnippetRow = function(event) {
        var $snippet = event.data.snippet,
            $snippetFade    = $snippet.find('div.snippetFade');

        // Set the layout of the snippet to rows
        $snippet.find('.snippetContent .snippetDes-col').toggleClass('snippetDes-col snippetDes-row');
        $snippet.find('.snippetContent .snippetCode-col').toggleClass('snippetCode-col snippetCode-row');
        $snippet.find('.snippetContent .snippetDes-row').css('display', 'block');
        $snippet.find('.snippetContent .snippetCode-row').css('display', 'block');

        highlightSnippetLayout($snippetFade, 'snippetRowLayout');
    }

    var showSnippetTitleOnly = function(event) {
        var $snippet = event.data.snippet,
            $snippetFade    = $snippet.find('div.snippetFade');

        // Set the layout of the snippet to title only
        $snippet.find('.snippetContent .snippetDes-col').css('display', 'none');
        $snippet.find('.snippetContent .snippetDes-row').css('display', 'none');
        $snippet.find('.snippetContent .snippetCode-col').css('display', 'none');
        $snippet.find('.snippetContent .snippetCode-row').css('display', 'none');

        highlightSnippetLayout($snippetFade, 'snippetTitleOnlyLayout');
    }

    var getDomNodesAsString = function($snippetDesText, $snippetCodeText) {
        var desStr = [],
            codeStr = [];

        $snippetDesText.children('pre').each(function() {
            desStr.push($(this).text());
        });
        if (desStr.length === 0) {
            $snippetDesText.children().each(function() {
                desStr.push($(this).text());
            });
        }

        $snippetCodeText.children('pre').each(function() {
            codeStr.push($(this).text());
        });
        return {'desStr':desStr.join("\n"), 'codeStr':codeStr.join("\n")};
    }

    var setupSnippetForm = function($snippet, titleText, desHtml, codeText, snippetID) {
        var $snippetForm = $('#snippetForm'),
            $snippetDesCol = $snippet.find('.snippetContent .snippetDes-col'),
            $snippetDesRow = $snippet.find('.snippetContent .snippetDes-row');

        // Populate fields in the form
        $("form #titleField").val(titleText);
        $("form #desField").val(desHtml);
        $("form #codeField").val(codeText);

        setupCodeMirrorEditors($('#desField'), $('#codeField'), desEditorTheme, desEditorMode, codeEditorTheme, codeEditorMode);
        $snippetForm.data('snippetID', snippetID); // save the snippet id in the form for later use

        // Set the layout according to the layout controls
        if ($snippetDesCol.length > 0 && $snippetDesCol.css('display') != 'none') {
            // Set the form to Columnar layout
            $snippetForm.find('.snippetContent .snippetDes-row').toggleClass('snippetDes-row snippetDes-col');
            $snippetForm.find('.snippetContent .snippetCode-row').toggleClass('snippetCode-row snippetCode-col');
            $snippetForm.find('.snippetContent .snippetDes-col').css('display', 'block');
            $snippetForm.find('.snippetContent .snippetCode-col').css('display', 'block');
        } else if ($snippetDesRow.length > 0 && $snippetDesRow.css('display') != 'none') {
            // Set the form to Row layout
            $snippetForm.find('.snippetContent .snippetDes-col').toggleClass('snippetDes-col snippetDes-row');
            $snippetForm.find('.snippetContent .snippetCode-col').toggleClass('snippetCode-col snippetCode-row');
            $snippetForm.find('.snippetContent .snippetDes-row').css('display', 'block');
            $snippetForm.find('.snippetContent .snippetCode-row').css('display', 'block');
        } else {
            // Set the form to TitleOnly layout
            $snippetForm.find('.snippetContent .snippetDes-col').css('display', 'none');
            $snippetForm.find('.snippetContent .snippetDes-row').css('display', 'none');
            $snippetForm.find('.snippetContent .snippetCode-col').css('display', 'none');
            $snippetForm.find('.snippetContent .snippetCode-row').css('display', 'none');
        }

        return $snippetForm;
    }

    // Setup the snippet selector for each newly displayed snippet
    var bindSnippetSelector = function($snippet) {

        // Enable Bootstrap modal-popover
        var $snippetSelector = $snippet.find('div.snippetSelector');

        // Bind a click event and its handler to the new snippet
        $snippetSelector.bind('mouseenter', function() {
            var $snippetFade = $snippet.find('div.snippetFade'),
                $snippetDesCol = $snippet.find('.snippetContent .snippetDes-col'),
                $snippetDesRow = $snippet.find('.snippetContent .snippetDes-row');

            // Highlight the correct layout control
            if ($snippetDesCol.length > 0 && $snippetDesCol.css('display') != 'none') {
                highlightSnippetLayout($snippetFade, 'snippetColLayout');
            } else if ($snippetDesRow.length > 0 && $snippetDesRow.css('display') != 'none') {
                highlightSnippetLayout($snippetFade, 'snippetRowLayout');
            } else {
                highlightSnippetLayout($snippetFade, 'snippetTitleOnlyLayout');
            }

            $snippetFade.show();
        });
        $snippet.bind('mouseleave', function() {
            $snippet.find('div.snippetFade').hide();
        });

        // Bind the snippet layout buttons
        $snippet.find('.layout.snippetColLayout').on('click', {snippet:$snippet}, showSnippetCol);
        $snippet.find('.layout.snippetRowLayout').on('click', {snippet:$snippet}, showSnippetRow);
        $snippet.find('.layout.snippetTitleOnlyLayout').on('click', {snippet:$snippet}, showSnippetTitleOnly);

        // Bind the snippet edit button
        $snippet.find('.layout.snippetEdit').on('click', function() {
            var snippetID = $snippet.find('span.snippetID').clone().children().remove().end().text();
                titleText = $snippet.find('.snippetContent .snippetTitleText').clone().children().remove().end().text(),
                desHtml   = $snippet.find('.snippetContent .snippetDesText').html(),
                domNodeStrings = getDomNodesAsString(
                    $snippet.find('.snippetContent .snippetDesText'),
                    $snippet.find('.snippetContent .snippetCodeText')),
                desText  = domNodeStrings['desStr'],
                codeText  = domNodeStrings['codeStr'],
                $snippetForm = setupSnippetForm($snippet, titleText, desText, codeText, snippetID);

            isSnippetEditModeEnabled = true;

            // Create the snippet updater and form resetter
            updateSnippet = snippetUpdater($snippet);
            snippetFormReset = snippetFormResetter($snippet, $snippetForm);

            // Hide the snippet and show the form in the correct location
            $('#modalCover').show();              // modal window to focus attention to snippet form
            $snippet.hide();                      // hide the currenlty edited snippet
            $snippet.before($snippetForm);        // place the form right before the snippet in the DOM
            $snippetForm.show();                  // show the form
            desEditor.refresh();
            codeEditor.refresh();
            setFormTextAreaHeight($snippetForm);  // set the textareas in the form to a useful size
        });

        // Bind the snippet delete button
        $snippet.find('.layout.snippetDelete').on('click', function() {
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
            ss = buildSnippet(title, description, code, snippetId, creatorId, access, isLoggedIn()),
            snippetTheme = codeEditorTheme.replace(/(^|\s)\s*/g, " cm-s-");

        snippetFormReset();

        // Create a new snippet with the form data
        $('#userSnippets').prepend(ss);

        // Add a popover to the snippet selector
        $snippet = $('#userSnippets .snippet:first-child');
        // Set the snippet theme 
        $snippet.find('.snippetCodeText').addClass(snippetTheme);
        // Bind handlers to buttons in the snippet selector
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
            title = '', description = '', code = '', id = 0,
            snippetTheme = codeEditorTheme.replace(/(^|\s)\s*/g, " cm-s-");

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

            // Set the snippet theme
            $newSnippet.find('.snippetCodeText').addClass(snippetTheme);
        }
        return count;
    }


    /*
     * Public methods
     */

    var createTopic = function(form) {
        var topicName = $('input#topicNameField').val(),
            duplicateNameFound = false,
            success = function() {}, error = function() {};

        console.log("Saving a new topic named " + topicName);

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
            $('#topicNameField').popover('show');
            isTopicPopoverDisplayed = true;
            return false;
        }

        // Name can't be empty
        if (!topicName) return false;

        success = function(results) {
            displayNewTopic(topicName, results['id']);
        };
        error = function(req, status, error) {
            console.log("AJAX returned with error");
        };

        snippetService.createTopic(topicName, success, error);
        return false;
    }

    var updateTopic = function(form) {
        var $topicEditFormItem = $('form#topicEditForm'),
            topicName = $('input#topicEditNameField').val(),
            topicID = parseInt($topicEditFormItem.parent().find('span.topicID').text(), 10),
            data = $(form).serialize(),
            duplicateNameFound = false,
            success = function() {}, error = function() {};

        console.log("Updating topic " + topicName);
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

        success = function(results) {
            var $topicNameItem = $topicEditFormItem.parent().find('a.topicName');

            // Update topic with new name
            $topicNameItem.text(topicName);

            // Hide the topic edit form and show <a class='topicName'></a> element
            topicEditReset();
        };
        error = function(req, status, error) {
            topicEditReset();
            console.log("AJAX returned with error");
        };

        snippetService.updateTopic(topicID, data, success, error);
        return false;
    }

    var resetTopicEdit = function(topicItem) {
        var $topicNameItem = $(topicItem).find('a.topicName'),
            $topicEditFormItem = $('form#topicEditForm'),
            $topicEditNameFieldItem = $('input#topicEditNameField'),

            topicFormReset = function() {
                $topicEditFormItem.hide();
                $topicNameItem.show();
            };

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
            topicID = $(topicItem).find('span.topicID').text(),
            success = function() {}, error = function() {};

        success = function(results) {
            removeDeletedTopic(topicItem, results.new_general_snippets);
        };
        error = function(req, status, error) {
            console.log("AJAX returned with error");
        };

        snippetService.deleteTopic(topicID, success, error);
    }

    var setupCodeMirrorEditors = function($desField, $codeField, desTheme, desMode, codeTheme, codeMode) {
        // Create a new CodeMirror desciption editor, right under our #desField textarea
        desEditor = CodeMirror.fromTextArea($desField.get(0), {
            mode:desMode,
            tabindex: "2",
            theme:desTheme,
            specialCharPlaceholder: function(ch) {
                var token = document.createElement('span');
                token.title = "\\u" + ch.charCodeAt(0).toString(16);
                return token;
            },
            autofocus:false
        });

        // Create a new CodeMirror code editor, right under our #codeField textarea
        codeEditor = CodeMirror.fromTextArea($codeField.get(0), {
            mode:codeMode,
            tabindex: "3",
            theme:codeTheme,
            specialCharPlaceholder: function(ch) {
                var token = document.createElement('span');
                token.title = "\\u" + ch.charCodeAt(0).toString(16);
                return token;
            },
            autofocus:false
        });
    }

    var enterNewSnippet = function() {
        var $snippetForm = $('#snippetForm');

        // Create the reset closure function to clear and hide the form when finished
        snippetFormReset = snippetFormResetter(undefined, $snippetForm);

        // Relocate the snippetForm to the top of the displayed snippet list
        $('#modalCover').show();
        $('#userSnippets').before($snippetForm);
        setupCodeMirrorEditors($('#desField'), $('#codeField'), desEditorTheme, desEditorMode, codeEditorTheme, codeEditorMode);
        $snippetForm.show();

        $('#titleField').focus();
    }

    // Create function that returns a string with all non-printing characters removed
    var getEditorTextContents = function($editorCodeDiv) {
        //var editorTextContents = $editorCodeDiv.text().replace(/^\s+|\s+$/gm,'');
        var editorTextContents = $editorCodeDiv.text();
        if (editorTextContents.length === 1) {
            var charCode = editorTextContents.charCodeAt(0);
            if (charCode === 8203) {
                editorTextContents = "";
            }
        }
        return editorTextContents;
    }

    var updateTextareasWithEditorsContents = function($desField, $codeField) {
        // Get the description editors DOM nodes in an HTML string
        var editorTextContents = getEditorTextContents($desField.next().find('.CodeMirror-code'));
        if (editorTextContents.length > 0) {
            editorDomContents = $desField.next().find('.CodeMirror-code').html();
            // Add the HTML string as new DOM nodes in the form's textarea
            $desField.val(editorDomContents);
        } else {
            $desField.val("");
        }

        // Get the code editors DOM nodes in an HTML string
        editorTextContents = getEditorTextContents($codeField.next().find('.CodeMirror-code'));
        if (editorTextContents.length > 0) {
            editorDomContents = $codeField.next().find('.CodeMirror-code').html();
            // Add the HTML string as new DOM nodes in the form's textarea
            $codeField.val(editorDomContents);
        } else {
            $codeField.val("");
        }
    }

    var saveNewSnippet = function(snippetSaveButton) {
        /* Creates a new snippet from the snippet form control,
         * sends an AJAX request to persist the new snippet
         * and adds the new snippet to the DOM */
        var title = $('#titleField').val(),
            data = {},
            topicName = $('#topicPanel .topicItem.active').find('a').clone().children().remove().end().text().replace(/^\s+|\s+$/g,''),
            success = function() {}, error = function() {};

        // Now, with the CodeMirror editor running, we need to place the contents of the
        // editor into the form's textarea.
        // Test 1: use the editors save() function. This takes the text() from the editors div
        // element and puts the text into our form's textarea. This means that we need to
        // put the text inside of <pre> elements in our snippet's (.snippetCodeText) <div>
        // Keep this in case we find that filling the DOM up (as done in Test 2) is problematic.
        //codeEditor.save();

        // Test 2: rather than take the text out of the editor, let's take the DOM elements.
        // And let's copy those DOM elements into our textarea. Is this going to work?
        // YES! This works great. It allows the snippet to be styled according to a ComeMirror theme.
        updateTextareasWithEditorsContents($('#desField'), $('#codeField'));

        data = $("#snippetForm").serialize();

        // Must have at least a snippet title
        if (!title) return false;

        // Let the snippet get added to the "General" topic if no topic is current selected.
        // The user always has the "General" topic
        if (!topicName) {
            topicName = 'General'
        }

        success = function(results) {
            displayNewSnippet(results['id'], results['creator_id'], results['access']);
            incrementTopicCount();
        };
        error = function(req, status, error) {
            console.log("AJAX returned with error");
        };

        snippetService.saveNewSnippet(topicName, data, success, error);
        return false;
    };


    var saveEditedSnippet = function(snippetID) {
        var data = {},
            title = '',
            desText = '',
            codeText = '';

        // We must get the editor's contents into the form
        updateTextareasWithEditorsContents($('#desField'), $('#codeField'));

        title = $('#snippetForm #titleField').val();
        desText = $('#snippetForm #desField').val();
        codeText  = $('#snippetForm #codeField').val();
        data = $("#snippetForm").serialize(),

        console.log("Saving edited snippet ID " + snippetID);
        // Could check to see if anything changed. If not, don't talk to server.

        success = function(results) {
            updateSnippet(title, desText, codeText);
            snippetFormReset();
        };
        error = function(req, status, error) {
            console.log("AJAX error: could not update snipet ID " + snippetID);
        };

        snippetService.saveEditedSnippet(snippetID, data, success, error);
        return false;
    }


    var deleteSnippet = function($snippet) {
        var snippetID = $snippet.find('span.snippetID').text(),
            success = function() {}, error = function() {};

        success = function(results) {
            $snippet.remove();
            decrementTopicCount()
        };
        error = function(req, status, error) {
            console.log("AJAX returned with error");
        };

        snippetService.deleteSnippet(snippetID, success, error);
    }


    var cancelSnippet = function() {
        snippetFormReset();
    }



    var isLoggedIn = function() {
        return ($('#personalSnippetCounter').length) > 0 ? true : false;
    }

    var searchSnippets = function(form) {
        if (isSnippetFormEnabled() == true) {
            $('#snippetSearchForm')[0].reset();
            return false;
        }

        // Get search string
        var searchAccess =  $('#personalSnippetCounter').hasClass('selected') ? "personal" : "public",
            searchString = form.q.value,
            data = $(form).serialize(),
            success = function() {}, error = function() {};

        success = function(results) {
            var headerString = '"' + searchString + '"' + ' search',
                count = displaySnippets(results);

            // Update the UI to show the currently displayed search snippets
            $('#snippetTopicSearchDisplay').text(headerString);

            // Deselect any topic currently selected
            $('#topicPanel div.panel-body li.topicItem').removeClass('active');
        };
        error = function(req, status, error) {
            console.log("AJAX returned with error");
        };

        snippetService.searchSnippets(searchAccess, data, success, error);

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
            topicName = $(topicItem).find('a').clone().children().remove().end().text().replace(/^\s+|\s+$/g,''),
            success = function() {}, error = function() {};

        if (!topicName) return;

        success = function(results) {
            var headerString = '"' + topicName + '"' + ' topic',
                count = displaySnippets(results);

            // Update the UI to show the currently displayed topic snippets
            $('#snippetTopicSearchDisplay').text(headerString);

            // Select topic in topic panel and increment its badge
            $('#topicPanel div.panel-body li.topicItem').removeClass('active');
            that.addClass('active');
            that.find('a span').text(count);
        };
        error = function(req, status, error) {
            console.log("AJAX returned with error");
        };

        snippetService.displayTopicSnippets(topicName, success, error);
    };


    var showSnippetsInColumns = function() {
        // Update snippet description and code have columnar layout
        $('.snippetDes-row').toggleClass('snippetDes-row snippetDes-col');
        $('.snippetCode-row').toggleClass('snippetCode-row snippetCode-col');
        $('.snippetDes-col').css('display', 'block');
        $('.snippetCode-col').css('display', 'block');

        // Make the columnar layout icon active
        $('#snippetColIcon span').addClass('active');
        $('#snippetRowIcon span').removeClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');

        // Save away the layout state
        snippetDesLayout = SNIPPET_DES_COL;
        snippetCodeLayout = SNIPPET_CODE_COL;
        snippetNoneLayout = false;

        // Show the CodeMirror editors if we were in Text Only layout
        if ('refresh' in desEditor) {
            desEditor.refresh();
        }
        if ('refresh' in codeEditor) {
            codeEditor.refresh();
        }
    };

    var showSnippetsInRows = function() {
        // Update snippet description and code have row layout
        $('.snippetDes-col').toggleClass('snippetDes-col snippetDes-row');
        $('.snippetCode-col').toggleClass('snippetCode-col snippetCode-row');
        $('.snippetDes-row').css('display', 'block');
        $('.snippetCode-row').css('display', 'block');

        // Make the row layout icon active
        $('#snippetColIcon span').removeClass('active');
        $('#snippetRowIcon span').addClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');

        // Save away the layout state
        snippetDesLayout = SNIPPET_DES_ROW;
        snippetCodeLayout = SNIPPET_CODE_ROW;
        snippetNoneLayout = false;

        // Show the CodeMirror editors incase we were in Text Only mode
        if ('refresh' in desEditor) {
            desEditor.refresh();
        }
        if ('refresh' in codeEditor) {
            codeEditor.refresh();
        }
    };

    var showSnippetTitlesOnly = function() {
        // Update snippet description and code to be hidden - show only the title
        $('.snippetDes-row').css('display', 'none');
        $('.snippetCode-row').css('display', 'none');
        $('.snippetDes-col').css('display', 'none');
        $('.snippetCode-col').css('display', 'none');

        // Make the title only layout icon active
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
        get isSnippetEditModeEnabled()           { return isSnippetEditModeEnabled; },
        set isSnippetEditModeEnabled(bool)       { isSnippetEditModeEnabled = bool; },

        // Okay, this took me a bit to grock. "topicEditReset" is a function pointer that
        // points to function closures which are used to restore the state of a topic when
        // it is being edited back to an unedited state. The function closure is nice
        // in that it remembers the state (closure) of the topic before it was edited. Then,
        // later on when the topic editing is saved or canceled, all we need to do is call
        // the function closure and the topic is back to an unedited state, hopefully with
        // the appropriate changes if it was edited, or to its original state if the editing
        // was cancelled. Well, the 'topicEditReset' variable is private to this viewUtils
        // module. The pointer can change state (point to different closures) throughout the
        // operation of the app. What needs to be done is pass the closure (or a pointer to 
        // it) to the "view" code whenever it needs to reset the topic editing.
        // If the following line is set:
        //     topicEditReset:topicEditReset,
        // then the "topicEditReset" pointer will change, but any external use of the 
        // viewUtils.topicEditReset will only get the original value that the pointer
        // was pointing to. So, to make sure the current function closure is returned, the 
        // current pointer must be reference. The following does the trick.
        // Hopefully I'll know this the rest of my life and not have to write a Gozilla comment.
        topicEditReset: function() { topicEditReset(); },
        snippetFormReset: function() { snippetFormReset(); },

        createTopic:createTopic,
        editTopic:editTopic,
        updateTopic:updateTopic,
        deleteTopic:deleteTopic,
        enterNewSnippet:enterNewSnippet,
        saveNewSnippet:saveNewSnippet,
        saveEditedSnippet:saveEditedSnippet,
        deleteSnippet:deleteSnippet,
        cancelSnippet:cancelSnippet,
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
    $('#signin').click(viewUtils.showSigninDialog);


    /* 
     * Topic Panel Controls
     */

// Topic 'add' button is clicked
$('#topicAdd').click(function() {
    if (!viewUtils.isTopicEditModeEnabled) {
        viewUtils.isTopicAddModeEnabled = !viewUtils.isTopicAddModeEnabled;
        if (viewUtils.isTopicAddModeEnabled) {
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
            viewUtils.isTopicPopoverDisplayed = false;
        }
    }
});

    // Topic 'edit' button is clicked 
    // - allow topics to be deleted
    // - allow topic names to be changed
    $('#topicEdit').click(function() {
        if (!viewUtils.isTopicAddModeEnabled) {
            viewUtils.isTopicEditModeEnabled = !viewUtils.isTopicEditModeEnabled;
            if (viewUtils.isTopicEditModeEnabled) {
                $('#topicPanel li span.topicDelete').show();
                $(this).find('span').addClass('selected');
                //viewUtils.topicEditReset = 
            } else {
                $('#topicPanel li span.fa.topicDelete').hide();
                $(this).find('span').removeClass('selected');

                // Remove the topic edit form if displayed
                viewUtils.topicEditReset();

                // Remove the popover if displayed
                $('#topicEditNameField').popover('hide');
                viewUtils.isTopicPopoverDisplayed = false;
            }
        }
    });

    // Enable Bootstrap Modal Dialog for the Topic Delete action
    $("#topicDeleteDialog").modal({backdrop:'static', keyboard:false, show:false});
    $("#topicDoDelete").click(function() {
        // Delete the topic here
        var $topic = $("#topicDeleteDialog").data('topicElement');
        viewUtils.deleteTopic($topic);
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
        var $editIcon = $('#topicEdit span');
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

        if (viewUtils.isTopicEditModeEnabled) {
            if ($topicItem.hasClass('topicGeneralItem')) {
                // User might get confused when clicking on the 'General' topic when in edit mode.
                // So alert them somehow as to their condition
                notifyInEditMode(7);
            } else {
                viewUtils.editTopic($topicItem);
            }
        } else {
            viewUtils.displayTopicSnippets($topicItem);
        }
    });

    // Enable Bootstrap popover for the topic name input field
    var enablePopover = function($element) {
        $element.popover({container:'body', trigger:'manual', toggle:'popover', placement:'right',
                                      content:"This name already exists. Please type another name."});
        // Dismiss the popover upon click
        $element.click(function() {
            if (viewUtils.isTopicPopoverDisplayed) {
                $(this).popover('hide');
                viewUtils.isTopicPopoverDisplayed = false;
            }
        });
        $element.on('input', function() {
            if (viewUtils.isTopicPopoverDisplayed) {
                $(this).popover('hide');
                viewUtils.isTopicPopoverDisplayed = false;
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
        viewUtils.enterNewSnippet();
        $(this).find('span').addClass('selected');
    });

    // 'Columns' icon in snippet panel is clicked
    $('#snippetColIcon').click(viewUtils.showSnippetsInColumns);

    // 'Rows' icon in snippet panel is clicked
    $('#snippetRowIcon').click(viewUtils.showSnippetsInRows);

    // 'Title Only' icon in snippet panel is clicked
    $('#snippetTitleOnlyIcon').click(viewUtils.showSnippetTitlesOnly);


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
     * Snippet CRUD
     */

    // Snippet 'save' button clicked
    $('#snippetSave').click(function() {
        if (viewUtils.isSnippetEditModeEnabled === true) {
            var snippetID = $('#snippetForm').data('snippetID');
            viewUtils.saveEditedSnippet(snippetID);
        } else {
            viewUtils.saveNewSnippet(this);
            $('#snippetAdd').find('span').removeClass('selected');
        }
    });

    // New snippet 'cancel' button clicked
    $('#snippetCancel').click(function() {
        viewUtils.cancelSnippet();
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

    /* 
     * Snippet Selector Controls
     */

    // Enable Bootstrap Modal Dialog for the Snippet Selector Delete Button
    $("#snippetDeleteDialog").modal({backdrop:'static', keyboard:false, show:false});

    $("#snippetDoDelete").click(function() {
        var $snippet = $("#snippetDeleteDialog").data('snippetElement');

        viewUtils.deleteSnippet($snippet);
        $("#snippetDeleteDialog").modal('hide');
    });

    $("#snippetSearchField").on("focus blur", function() {
        $("#snippetSearchDiv").toggleClass("focused");
    });

    /* 
     * Snippet Search Controls
     */

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

