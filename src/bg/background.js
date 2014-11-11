//TODO:
// Send 'browsing' status to popup, don't want to spawn multiple instances
// General cleanup of code & ui

browsing = false;
end = new Date();
sites = [];
$.getJSON( "../../topsites.json", function( data ) {
  $.each(data, function(key, val){sites.push(val);});
});

chrome.extension.onMessage.addListener(
  function(request, sender) {
    console.log('got message');
    // Super quick 'error' handling.
    //TODO: validation in popup script before message send
    //TODO: Inform popup we're doing stuff
    browsing = true;

    // Grab the start date for history cleaning later on
    start = new Date();
    // Calculate the end time from the popup
    end = new Date(start.getTime() + request.mins*60000);
  
    console.log('Starting Auto Browsing');
    console.log('Complete time is '+request.mins+' minutes from now, at \n'+end);
    if(request.uninstall) console.log('Uninstalling self upon completion.');
  

    // Create tab, pop it out, and focus it
    chrome.tabs.create({active: false}, function(tab) {
      chrome.windows.create({tabId: tab.id, type: 'popup', focused: true});

      //TODO: Pull up a local page w/ short explanation for first load
      chrome.tabs.update(tab.id, {url:"http://google.com"});
      
      // If browsing and end date has not been reached, load a new page every 10 seconds
      window.setInterval(function(){
        if(browsing && end > new Date()){
          // Update the tab with a new, random page
          chrome.tabs.update(tab.id, {url: "http://"+sites[Math.floor(Math.random()*sites.length)]}, function(){
            if (chrome.runtime.lastError) {
              console.log('Error when trying to update tab:\n'+chrome.runtime.lastError.message);

              // If error is because tab cannot be found, pop an alert and reload the extension
              re = /(No tab with id:\s\d{0,}.{0,})/;
              if(re.test(chrome.runtime.lastError.message)){
                browsing = false;
                confirm('It looks like the autobrowsing window was closed.\nPlease remember to uninstall this extension.');
                chrome.runtime.reload();
              }
            }
          });
        }

        // We've either manually stopped browsing or have reached the end date.
        // Cleanup: by killing the tab, deleting history, and uninstalling ourselves. Reload if not uninstalling
        else {
          browsing = false;
          console.log('We\'re done here.');
          chrome.tabs.remove(tab.id);
          chrome.history.deleteRange({startTime: start.getTime() / 1000, endTime: new Date().getTime() / 1000}, function(){ console.log('History Deleted'); });
          if(request.uninstall) chrome.management.uninstallSelf({showConfirmDialog:false});
          chrome.runtime.reload();
        }
      }, 10000);
    });

});
