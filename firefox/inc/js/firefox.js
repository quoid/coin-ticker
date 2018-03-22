function open_link(event) {
    var url = event.target.dataset.link;
    var creating = browser.tabs.create({
        url: url
    });
    creating.then(function() {
            browser.extension.getViews()[0].close()
        }, 
        function() {
            console.log('Error opening link...');
        }
    );
}