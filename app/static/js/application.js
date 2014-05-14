var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var snippet = (function() {
    var SNIPPET_HORIZONTAL = 'snippetDes-horz',
        SNIPPET_VERTICAL = 'snippetDes-vert',
        SNIPPET_TITLESONLY = 'snippetDes-vert',
        snippetDesLayout = SNIPPET_HORIZONTAL,
        snippetCodeLayout = SNIPPET_HORIZONTAL,
        isTopicPopoverDisplayed = false;

    /*
     * Local methods
     */

    var buildTopic = function(topicName) {
        var t =  '<li class="list-group-item topicItem"><a href="#">' + topicName;
            t += '    <span class="badge pull-right">0</span></a></li>';

        return t;
    }

    var displayNewTopic = function(topicName) {
        var t = buildTopic(topicName);

        // Create a new snippet with the form data
        $('#topicFormContainer').after(t);

        $('#topicForm')[0].reset();
        $('#topicFormContainer').hide();
    }


    var buildSnippet = function(title, description, code) {
        var ss  = '<div class="snippet">';
        ss +=     '    <span class="snippetID" style="display:none">snippet_id</span>';
        ss +=     '    <div class="snippetTitle">';
        ss +=     '        <h5>' + title + '</h5>';
        ss +=     '        <div class="snippetContent">';
        if (description) {
            if (snippetDesLayout != SNIPPET_TITLESONLY) {
                ss += '            <div class="' + snippetDesLayout + '">';
            }
            ss += '                <p class="snippetDesStyle">' + description + '</p>';
            ss += '            </div>';
        } else {
            if (snippetDesLayout != SNIPPET_TITLESONLY) {
                ss += '            <div class="' + snippetDesLayout + '">';
            }
            ss += '            </div>';
        }
        if (code) {
            if (snippetCodeLayout != SNIPPET_TITLESONLY) {
                ss += '            <div class="' + snippetCodeLayout + '">';
            }
            ss += '                <pre class="snippetCodeStyle">' + code + '</pre>';
            ss += '            </div>';
        }
        ss +=     '        </div>';
        ss +=     '    </div>';
        ss +=     '</div>';

        return ss;
    }


    var displayNewSnippet = function(snippet_id) {
        /* Adds a new snippet to the DOM */
        var title = $('#titleField').val(),
            description = $('#desField').val(),
            code = $('#codeField').val(),
            ss = buildSnippet(title, description, code);

        // Reset form and hide it
        $('#snippetForm')[0].reset();
        $('#snippetForm').hide();
        
        // Create a new snippet with the form data
        $('#userSnippets').prepend(ss);
    }

    var incrementTopicCount = function() {
        var badge = $('#topicPanel .list-group li.active').find('a span');
            badge_count = Number(badge.text());
        badge.text(badge_count + 1);
    }

    var updateTopicSnippets = function(snippets) {
        /* Adds the snippets associated with a topic to the DOM */
        var count = 0,
            key,
            snippet,
            title = '', description = '', code = '';

        // Clear panel to get ready to display snippets in the topic
        $('#userSnippets').empty();

        // Show the new snippets
        for (key in snippets) {
            snippet = snippets[key];
            title = snippet.title;
            description = snippet.description;
            code = snippet.code;
            $('#userSnippets').append(buildSnippet(title, description, code));
            count += 1;
        }
        return count;
    }


    /*
     * Public methods
     */

    var saveTopic = function(form) {
        var topicName = form.topicName.value,
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
                displayNewTopic(topicName);
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
        return false;
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


    var displayTopicSnippet = function(topicItem) {
        /*
         * Displays the selected topic in the snippet panel,
         * sends an AJAX 'GET' request to get the list of snippets
         * associated with the topic, and updates the snippet panel
         * with the returned snippets
         */

        var that = $(topicItem),
            // Get only the "li a" element text, not the children span's badge "count" text
            topicname = $(topicItem).find('a').clone().children().remove().end().text();
        if (!topicname) return;

        // Use AJAX to GET a list snippets
        var ajaxOptions = {
            url:'snippets/' + topicname,
            type: 'GET',
            dataType: "json",
            success: function(results) {
                var count = updateTopicSnippets(results);
                console.log("AJAX returned with a list of snippets");

                // Update the UI to show the currently displayed topic snippets
                $('#snippetTopicSearchDisplay').text(topicname);

                // Select topic in topic panel
                $('#topicPanel div.panel-body li').removeClass('active');
                that.addClass('active');
                that.find('a span').text(count);
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
    };


    var showSnippetsHorizontal = function() {
        $('.snippetDes-vert').toggleClass('snippetDes-vert snippetDes-horz');
        $('.snippetCode-vert').toggleClass('snippetCode-vert snippetCode-horz');
        $('.snippetDes-horz').css('display', 'block');
        $('.snippetCode-horz').css('display', 'block');
        $('#snippetHorzIcon span').addClass('active');
        $('#snippetVertIcon span').removeClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');
        snippetDesLayout = SNIPPET_HORIZONTAL;
        snippetCodeLayout = SNIPPET_HORIZONTAL;
    };

    var showSnippetsVertical = function() {
        $('.snippetDes-horz').toggleClass('snippetDes-horz snippetDes-vert');
        $('.snippetCode-horz').toggleClass('snippetCode-horz snippetCode-vert');
        $('.snippetDes-vert').css('display', 'block');
        $('.snippetCode-vert').css('display', 'block');
        $('#snippetHorzIcon span').removeClass('active');
        $('#snippetVertIcon span').addClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');
        snippetDesLayout = SNIPPET_VERTICAL;
        snippetCodeLayout = SNIPPET_VERTICAL;
    };

    var showSnippetTitlesOnly = function() {
        $('.snippetDes-vert').css('display', 'none');
        $('.snippetCode-vert').css('display', 'none');
        $('.snippetDes-horz').css('display', 'none');
        $('.snippetCode-horz').css('display', 'none');
        $('#snippetHorzIcon span').removeClass('active');
        $('#snippetVertIcon span').removeClass('active');
        $('#snippetTitleOnlyIcon span').addClass('active');
        snippetDesLayout = SNIPPET_TITLESONLY;
        snippetCodeLayout = SNIPPET_TITLESONLY;
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
        get isTopicPopoverDisplayed() { return isTopicPopoverDisplayed; },     // exported getter
        set isTopicPopoverDisplayed(bool) { isTopicPopoverDisplayed = bool; }, // exported setter
        saveTopic:saveTopic,
        createSnippet:createSnippet,
        displayTopicSnippet:displayTopicSnippet,
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
        $('#topicForm')[0].reset();
        $('#topicFormContainer').toggle();
        $('#topicNameField').focus();
        $('#topicNameField').popover('hide');
        snippet.isTopicPopoverDisplayed = false;
    });

    // Topic in topic panel is clicked
    $('#topicPanel div.panel-body li').click(function() {
        snippet.displayTopicSnippet(this);
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
    });

    // 'Columns' icon in snippet panel is clicked
    $('#snippetHorzIcon').click(snippet.showSnippetsHorizontal);

    // 'Rows' icon in snippet panel is clicked
    $('#snippetVertIcon').click(snippet.showSnippetsVertical);

    // 'Title Only' icon in snippet panel is clicked
    $('#snippetTitleOnlyIcon').click(snippet.showSnippetTitlesOnly);


    /* 
     * Snippet Controls
     */

    // New snippet 'save' button clicked
    $('#snippetSave').click(function() {
        snippet.createSnippet(this);
    });

    // New snippet 'cancel' button clicked
    $('#snippetCancel').click(function() {
        $('#snippetForm').hide();
        $('#snippetForm')[0].reset();
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

});

