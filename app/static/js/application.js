var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function() {

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

    $('#signin').click(showSigninDialog);

	// jQuery UI code for tooltips
	//$(document).tooltip();
});

