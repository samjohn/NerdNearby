//= require jquery
//= require jquery_ujs

$(function() {
  $("#map_canvas").hide();
    FB.init({
      appId  : '203906409650922',
      status : true, // check login status
      cookie : true, // enable cookies to allow the server to access the session
      xfbml  : true  // parse XFBML
    });

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

  var mapCanvas = $("#map_canvas");

  var getFeedResults = function(position, google) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    var latlng = new google.maps.LatLng(lat,lng);
    var myOptions = {
      zoom: 14,
      center: latlng,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $.get('feed_items', { lat: lat, lng: lng }, function(response) {
      $(".feed-items").html(response);

      $("#map_canvas").show();
      var map = new google.maps.Map($("#map_canvas").get(0), myOptions);

      var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: "You are here"
      });
      findFeedItems();
    });
  };

  var position = {
    coords : {
      latitude : mapCanvas.data("lat"),
      longitude : mapCanvas.data("lng")
    }
  };
  if(position.coords.latitude && position.coords.longitude) {
    getFeedResults(position, google);
  }
  else {
    navigator.geolocation.getCurrentPosition(function(position){
      getFeedResults(position, google);
    });
  }
});

function previousDay(day) {
  switch(day) {
    case "Monday":
      return "Sunday";
    case "Wednesday":
      return "Tuesday";
    case "Thursday":
      return "Wednesday";
    case "Friday":
      return "Thursday";
    case "Saturday":
      return "Friday";
    case "Tuesday":
      return "Monday";
    default:
      return "Saturday";
  }
}

function nextDay(day) {
  switch(day) {
    case "Monday":
      return "Tuesday";
    case "Tuesday":
      return "Wednesday";
    case "Wednesday":
      return "Thursday";
    case "Thursday":
      return "Friday";
    case "Friday":
      return "Saturday";
    case "Saturday":
      return "Sunday";
    default:
      return "Monday";
  }
}
function findFeedItems() {
  $(".timestamp").each(function() {
    var $this = $(this);
    var newDate = new Date();
    var offset = -(newDate.getTimezoneOffset() / 60);
    var time = UTCToLocalTime($this.data("weekday"), $this.data("hour"), $this.data("minute"), offset)
    $this.html(time);
  });
}

function UTCToLocalTime(dayOfWeek, hour, minute, offset) {

  hour = hour + offset;
  var time;

  if(minute < 10) {
    minute = "0" + minute;
  }

  if(hour == 0) {
    hour = 12;
  }

  if (hour > 23) {
    hour = hour - 12;
    dayOfWeek = nextDay(dayOfWeek);
  } else if(hour < 0) {
    hour = hour + 24;
    dayOfWeek = previousDay(dayOfWeek);
  }


  if (hour > 12) {
    time = "" + (hour - 12) + ":" + minute + " PM";
  } else {
    time = "" + hour + ":" + minute + " AM";
  }

  return dayOfWeek + " " + time;
}