var Utils = {}
Utils.isNumeric = function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}

Utils.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function() {

    // Use VEX dialogs to show the application instructions
	function showInfoDialog() {
		vex.open({
			contentClassName: 'infoDialog',
			content: 
                '<h3>Help</h3>' +
                '<ol>' +
                '<li>Click the "Samples" link and choose a sample invitation or business card' +
                '<li>Fill in the form on the edit page' +
                '<li>When the form is complete, click the "Save" button' +
                '<li>To make changes, click the "Edit" button and make the changes' +
                '<li>Once the invitation is correct, screenshot the invitation' +
                '    <ul>' +
                '    <li>On Mac OS X, type "Shift+Command+4"' +
                '    <li>On Windows:' +
                '        <ol>' +
                '        <li>select the browser window displaying the invitation' +
                '        <li>type "Alt + PrtScn"' +
                '        </ol>' +
                '    </ul>' +
                '<li>Edit the screenshot image if needed, then print or email to class attendees' +
                '<li>Contact Pam to have other invitations added to the list of samples' +
                '</ol>',
			overlayClassName:'infoDialogOverlay',
			showCloseButton:false});
	}

	// jQuery UI code for tooltips
	//$(document).tooltip();
});

