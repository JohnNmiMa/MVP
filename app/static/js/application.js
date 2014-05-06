var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function() {

    var topicPanelWidthRatio = topicPanelRatio();

    function topicPanelRatio() {
        return $('#topicPanel').width() / $('#topicPanel').parent().width();
    }

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
			overlayClassName:'infoDialogOverlay',
			showCloseButton:false});
	}
    $('#signin').click(showSigninDialog);

    $('#snippetHorzIcon').click(function() {
        $('.snippetDes-vert').toggleClass('snippetDes-vert snippetDes-horz');
        $('.snippetCode-vert').toggleClass('snippetCode-vert snippetCode-horz');
        $('.snippetDes-horz').css('display', 'block');
        $('.snippetCode-horz').css('display', 'block');
    });

    $('#snippetVertIcon').click(function() {
        $('.snippetDes-horz').toggleClass('snippetDes-horz snippetDes-vert');
        $('.snippetCode-horz').toggleClass('snippetCode-horz snippetCode-vert');
        $('.snippetDes-vert').css('display', 'block');
        $('.snippetCode-vert').css('display', 'block');
    });

    $('#snippetTitleOnlyIcon').click(function() {
        $('.snippetDes-vert').toggle();
        $('.snippetCode-vert').toggle();
        $('.snippetDes-horz').toggle();
        $('.snippetCode-horz').toggle();
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

