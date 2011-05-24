class FeedItemsController < ApplicationController
  def index

    # foursquare = Foursquare::Base.new(ENV["FOURSQUARE_CLIENT_ID"], ENV["FOURSQUARE_CLIENT_SECRET"])
    # foursquare_venues = []
    # foursquare.venues.nearby(ll: "#{params[:lat]}, #{params[:lng]}").map do |venue|
      # distance = venue.json["location"]["distance"]
      # fs_venue = foursquare.venues.find(venue.json["id"])
      # fs_venue.json["tips"]["groups"].first["items"].each do |tip|
        # time = Time.at(tip["createdAt"].to_i)
        # if time > Time.now - 12.years
          # foursquare_venues.push(
          # {
            # venue: venue.json["name"],
            # distance: distance,
            # time: Time.at(tip["createdAt"].to_i),
            # text: tip["text"],
            # feed_item_type: "foursquare"
          # }
          # )
        # end
      # end
    # end
    foursquare_venues = []

    tweets = Twitter::Search.new.geocode(params[:lat], params[:lng], "1mi").per_page(50).fetch.reject{|tweet| tweet.geo.nil?}.reject{|tweet| tweet.text.first == "@"}.try(:collect) do |tweet|
      {
        time: Time.parse(tweet.created_at),
        profile_image: tweet.profile_image_url.sub(/_normal\.jpg/, "_reasonably_small.jpg"),
        text: tweet.text,
        user: tweet.from_user,
        distance: tweet.geo.try(:coordinates),
        feed_item_type: "tweet"
      }
    end
    tweets ||= []

    instagrams = Instagram.media_search(params[:lat], params[:lng]).collect do |instagram|
      {
        time: Time.at(instagram.created_time.to_i),
        image_tag: instagram.images.low_resolution.url,
        place_name: instagram.location.name,
        checkin_text: instagram.caption.try(:text),
        feed_item_type: "instagram"
      }
    end

    args = {}
    radius = 0.014
    args[:bbox] = "#{params[:lng].to_f - radius},#{params[:lat].to_f - radius},#{params[:lng].to_f + radius},#{params[:lat].to_f + radius}"
    args[:min_taken_date] = Time.now - 1.days
    args[:max_taken_date] = Time.now
    args[:accuracy] = 11
    flickr_pictures = flickr.photos.search(args).collect do |flickr_photo|
      # info = flickr.photos.getInfo({photo_id: flickr_photo.id, secret: flickr_photo.secret})
      # time: Time.parse(info.dates.try(:taken))
      {
        image_tag: FlickRaw.url(flickr_photo),
        feed_item_type: "flickr",
        checkin_text: "flickr",
        place_name: flickr_photo.title,
        time: Time.now - (rand(60)).minutes
      }
    end
    flickr_pictures ||= []

    feed_items = (tweets + instagrams + foursquare_venues + flickr_pictures).sort{|a, b| b[:time] <=> a[:time] }

    render partial: "index", locals: {feed_items: feed_items}, layout: false

  end
end
