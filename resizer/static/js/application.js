var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function() {

    var snippetPanelWidthPct = 0;

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

    function showTopicPanel() {
        var topicPanelWidth = $('#topicPanel').width(),
            snippetPanelWidth = $('#snippetPanel').width(),
            snippetBlockWidth = $('#snippetBlock').width(),
            delta = snippetBlockWidth / 100.0 / 2;  // make larger 1/100 of the whole snippet area
        if (topicPanelWidth < (20*delta)) {
            $('#snippetPanel').width(snippetPanelWidth - delta);
            $('#topicPanel').width(topicPanelWidth + delta);
            setTimeout(showTopicPanel, 1);
        } else {
            $('#snippetPanel').width('78%');
            $('#topicPanel').width('20%');
        }
    }

    function hideTopicPanel() {
        var topicPanelWidth = $('#topicPanel').width(),
            snippetPanelWidth = $('#snippetPanel').width(),
            snippetBlockWidth = $('#snippetBlock').width(),
            delta = snippetBlockWidth / 100.0 / 1.5; // make smaller 1/100 of the whole snippet area
        if (topicPanelWidth > delta) {
            $('#topicPanel').width(topicPanelWidth - delta);
            $('#snippetPanel').width(snippetPanelWidth + delta);
            setTimeout(hideTopicPanel, 1);
        } else { 
            $("#topicPanel").width(0);
            $("#topicPanel").toggle();
            $('#snippetPanel').width('100%');
        }
    }

    $('#toggleIcon').click(function() {
        if($('#topicPanel').css('display') != 'none') {
            hideTopicPanel();
            $('#toggleIcon span').removeClass('fa-rotate-90');
        } else {
            var snippetPanelWidth = $('#snippetPanel').width(),
                snippetBlockWidth = $('#snippetBlock').width(),
                delta = snippetBlockWidth / 100.0;
            $('#snippetPanel').width(snippetPanelWidth - delta/4);
            $("#topicPanel").css('display', 'block');
            showTopicPanel();
            $('#toggleIcon span').addClass('fa-rotate-90');
        }
    });

    function doResize() {
        console.log("Got resize event for Topic Panel");
    };

    $("#topicPanel").on('resize', doResize);
});

