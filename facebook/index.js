function statusChangeCallback(response) {
  if (response.status === "connected") {
    FB.api('/search?q=NCal.GroupBuying&type=group', (response) => {
      console.log(response);
    })
  } else {
    FB.login(function(status) {
      if (status.status === "connected") {
        localStorage.accessToken = status.authResponse.accessToken;
        console.log(localStorage.accessToken)

        console.log('hi');
        FB.api('/search?q=NCal.GroupBuying&type=group', (response) => {
          console.log(response);
        })
      }
    });
  }
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '502901450516172',
    cookie     : true,
    xfbml      : true,
    version    : 'v4.0'
  });

  FB.getLoginStatus(response => statusChangeCallback(response));
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
