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
	function showInfoDialog() {
		vex.open({
			contentClassName: 'infoDialog',
			content: 
				'<h2>Purpose</h2>' +
                '<p>This example is used to show how to code up HTML forms.' +
                '   This will be used as a starting point for server side' +
                '   web form management.</p>',
			overlayClassName:'infoDialogOverlay',
			showCloseButton:false});
	}

    $('#info').click(function() {
		showInfoDialog();
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

