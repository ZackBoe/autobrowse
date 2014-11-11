document.addEventListener('DOMContentLoaded', function() {

  $('#go').on('click', function(){
    beginBrowse($('input[type="number"]').val(), $('input[type="checkbox"]').prop("checked"));
  });
  console.log('DOMContentLoaded');

});


function beginBrowse(mins, uninstall){
  chrome.extension.sendMessage({mins: mins, uninstall: uninstall},
        function (response) {
            console.log('response from background'+response);
        });
}