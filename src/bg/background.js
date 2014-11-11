// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

browsing = false;
sites = [];
end = new Date();

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {

  start = new Date();
  end = new Date(start.getTime() + request.mins*60000);

  console.log('Starting Auto Browsing');
  console.log('Complete time is '+request.mins+' minutes from now, at \n'+end);
  if(request.uninstall) console.log('Uninstalling self upon completion.');



  $.getJSON( "../../topsites.json", function( data ) {
    $.each(data, function(key, val){sites.push(val);});
  });

  chrome.tabs.create({active: false}, function(tab) {
      chrome.windows.create({tabId: tab.id, type: 'popup', focused: true});

      chrome.tabs.update(tab.id, {url:"http://google.com"});

      browsing = true;
      window.setInterval(function(){
        if(browsing && end > new Date()){
          chrome.tabs.update(tab.id, {url: "http://"+sites[Math.floor(Math.random()*sites.length)]}, function(){
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError.message);
              re = /(No tab with id:\s\d{0,}.{0,})/;
              if(re.test(chrome.runtime.lastError.message)){
                browsing = false;
                confirm('It looks like the autobrowsing window was closed.\nPlease remember to uninstall this extension.');
                chrome.runtime.reload();
              }
            }
          });
        }
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

  sendResponse();
});
