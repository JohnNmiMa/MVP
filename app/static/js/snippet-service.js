var snippetService = (function() {
    var saveNewSnippet = function(topicName, data, success, error) {
        // Use AJAX to POST/create a new snippet
        var ajaxOptions = {
            url:'snippets/' + topicName,
            type: 'POST',
            dataType: "json",
            data: data,
            success:success,
            error:error
        };

        $.ajax(ajaxOptions);
    }

    var saveEditedSnippet = function(snippetID, data, success, error) {
        // Use AJAX to PUT/update a new snippet
        var ajaxOptions = {
            url:'snippets/' + snippetID,
            type: 'PUT',
            dataType: "json",
            data: data,
            success:success,
            error:error
        };

        $.ajax(ajaxOptions);
    }

    var deleteSnippet = function(snippetID, success, error) {
        // Use AJAX to delete a snippet
        var ajaxOptions = {
            url:'snippets/' + snippetID,
            type: 'DELETE',
            dataType: "json",
            success: success,
            error: error
        };

        $.ajax(ajaxOptions);
    }

    var createTopic = function(topicName, success, error) {
        // Use AJAX to POST/create a new topic
        var ajaxOptions = {
            url:'topic/' + topicName,
            type: 'POST',
            //dataType: "json",
            success:success,
            error:error
        };

        $.ajax(ajaxOptions);
    }

    var updateTopic = function(topicID, data, success, error) {
        // Use AJAX to PUT/update a topic
        var ajaxOptions = {
            url:'topic/' + topicID,
            type: 'PUT',
            dataType: "json",
            data: data,
            success: success,
            error: error
        };

        $.ajax(ajaxOptions);
    }

    var deleteTopic = function(topicID, success, error) {
        // Use AJAX to delete a topic
        var ajaxOptions = {
            url:'topic/' + topicID,
            type: 'DELETE',
            dataType: "json",
            success:success,
            error:error
        };

        $.ajax(ajaxOptions);
    }

    var searchSnippets = function(searchAccess, data, success, error) {
        // Use AJAX to GET a list searched snippets
        var ajaxOptions = {
            url:'snippets/search/' + searchAccess,
            type: 'GET',
            dataType: "json",
            data: data,
            success: success,
            error: error
        };

        $.ajax(ajaxOptions);
    }

    var displayTopicSnippets = function(topicName, success, error) {
        // Use AJAX to GET a list snippets in a topic
        var ajaxOptions = {
            url:'snippets/' + topicName,
            type: 'GET',
            dataType: "json",
            success: success,
            error: error
        };

        $.ajax(ajaxOptions);
    }

    return {
        saveNewSnippet:saveNewSnippet,
        saveEditedSnippet:saveEditedSnippet,
        deleteSnippet:deleteSnippet,
        createTopic:createTopic,
        updateTopic:updateTopic,
        deleteTopic:deleteTopic,
        searchSnippets:searchSnippets,
        displayTopicSnippets:displayTopicSnippets
    };
})();
