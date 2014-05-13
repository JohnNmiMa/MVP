var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Using a getJSON AJAX request
function postSnippet(form) {
    var data = $("#snippetForm").serialize();
    console.log('The snippet title = ' + title);
    console.log('The snippet description = ' + description);
    console.log('The snippet code = ' + code);
    console.log('The data = ' + data);
    /*$.getJSON('/snippet', function(data) {*/
    $.post('/snippet', data, function(data) {
        console.log("Received an AJAX return from the server");
        //$("#result").text(data.result);
    });
    return false;
}

$(document).ready(function() {

    var topicPanelWidthRatio = topicPanelRatio();

    function topicPanelRatio() {
        return $('#topicPanel').width() / $('#topicPanel').parent().width();
    }

    $('#snippetAdd').click(function() {
        $('#snippetForm').show();
    });

    $('#snippetCancel').click(function() {
        $('#snippetForm').hide();
        $('#snippetForm')[0].reset();
    });

    // Use AJAX to GET a list snippets
    // Called when a topic in the topic panel is clicked
    $('#topicPanel div.panel-body li').click(function() {
        /*
         * Displays the selected topic in the snippet panel,
         * sends an AJAX 'GET' request to get the list of snippets
         * associated with the topic, and updates the snippet panel
         * with the returned snippets
         */

        var that = $(this),
            topicname = $(this).text();
        if (!topicname) return;
        topicname = topicname.replace(/[0-9]/g, ''); // remove trailing 'count' number from topic name

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
                $('#topicPanel div.panel-body li a span').text(count);
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
    });

    // Use AJAX to POST the new snippet
    $('#snippetSave').click(function() {
        /*
         * Creates a new snippet from the snippet form control,
         * sends an AJAX request to persist the new snippet,
         * and adds the new snippet to the DOM
         */

        var title = $('#titleField').val(),
            data = $("#snippetForm").serialize(),
            topicname = $('#snippetTopicSearchDisplay').text();

        // Must have at least a snippet title
        if (!title) return false;

        // Let the snippet get added to the "General" topic if no topic is current selected.
        // The user always has the "General" topic
        if (!topicname) {
            topicname = 'General'
        }

        var ajaxOptions = {
            url:'snippets/' + topicname,
            type: 'POST',
            dataType: "json",
            data: data,
            success: function(results) {
                displayNewSnippet(results['id']);
            },
            error: function(req, status, error) {
                console.log("AJAX returned with error");
            }
        };

        $.ajax(ajaxOptions);
        return false;
    });

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

    var buildSnippet = function(title, description, code) {
        var ss  = '<div class="snippet">';
        ss +=     '    <span class="snippetID" style="display:none">snippet_id</span>';
        ss +=     '    <div class="snippetTitle">';
        ss +=     '        <h5>' + title + '</h5>';
        ss +=     '        <div class="snippetContent">';
        if (description) {
            ss += '            <div class="snippetDes-horz">';
            ss += '                <p class="snippetDesStyle">' + description + '</p>';
            ss += '            </div>';
        } else {
            ss += '            <div class="snippetDes-horz">';
            ss += '            </div>';
        }
        if (code) {
            ss += '            <div class="snippetCode-horz">';
            ss += '                <pre class="snippetCodeStyle">' + code + '</pre>';
            ss += '            </div>';
        }
        ss +=     '        </div>';
        ss +=     '    </div>';
        ss +=     '</div>';

        return ss;
    }


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


    // Use VEX dialogs to show the application instructions
    function showSigninDialog() {
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
    $('#signin').click(showSigninDialog);

    $('#snippetHorzIcon').click(function() {
        $('.snippetDes-vert').toggleClass('snippetDes-vert snippetDes-horz');
        $('.snippetCode-vert').toggleClass('snippetCode-vert snippetCode-horz');
        $('.snippetDes-horz').css('display', 'block');
        $('.snippetCode-horz').css('display', 'block');
        $('#snippetHorzIcon span').addClass('active');
        $('#snippetVertIcon span').removeClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');
    });

    $('#snippetVertIcon').click(function() {
        $('.snippetDes-horz').toggleClass('snippetDes-horz snippetDes-vert');
        $('.snippetCode-horz').toggleClass('snippetCode-horz snippetCode-vert');
        $('.snippetDes-vert').css('display', 'block');
        $('.snippetCode-vert').css('display', 'block');
        $('#snippetHorzIcon span').removeClass('active');
        $('#snippetVertIcon span').addClass('active');
        $('#snippetTitleOnlyIcon span').removeClass('active');
    });

    $('#snippetTitleOnlyIcon').click(function() {
        $('.snippetDes-vert').css('display', 'none');
        $('.snippetCode-vert').css('display', 'none');
        $('.snippetDes-horz').css('display', 'none');
        $('.snippetCode-horz').css('display', 'none');
        $('#snippetHorzIcon span').removeClass('active');
        $('#snippetVertIcon span').removeClass('active');
        $('#snippetTitleOnlyIcon span').addClass('active');
    });

    function showTopicPanel(callback) {
        var topicPanelWidth = $('#topicPanel').width(),
            snippetPanelWidth = $('#snippetPanel').width(),
            snippetBlockWidth = $('#snippetBlock').width(),
            deltaFactor = 0.3, // decrease for faster animation
            delta = snippetBlockWidth / (100.0 * deltaFactor),  // make larger 1/100 of the whole snippet area
            newTPW = topicPanelWidth + delta;
        if (newTPW < (snippetBlockWidth * topicPanelWidthRatio)) {
            $('#snippetPanel').width(snippetPanelWidth - delta);
            $('#topicPanel').width(newTPW);
            setTimeout(showTopicPanel, 1, callback);
        } else {
            var spwStr = (((1.0 - topicPanelWidthRatio) * 100.0) - 2).toString() + '%',
                tpwStr = (topicPanelWidthRatio * 100.0).toString() + '%';
            $('#snippetPanel').width(spwStr);
            $('#topicPanel').width(tpwStr);

            if (typeof callback == "function") {
                callback(); // rotate the icon when the "show" is complete
            }
        }
    }

    function hideTopicPanel(callback) {
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

    $('#toggleIcon').click(function() {
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
            showTopicPanel(function() {
                $('#toggleIcon span').addClass('fa-rotate-90');
            });
        }
    });


});

