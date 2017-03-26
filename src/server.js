import Twit from 'twit'

const T = new Twit({
	consumer_key:         process.env.TWITTER_CONSUMER_KEY,
	consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
	access_token:         process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

const stream = T.stream('user', { stringify_friend_ids: true } /*, { replies: 'all' } */)

stream.on('tweet', handleTweet)

stream.on('connect', () => {
	console.log('connected to twitter')
})

stream.on('friends', function (data) {
	console.log(`I follow ${data.friends_str.length} people!`)
})

function handleTweet(tweet) {
	const from = tweet.user.screen_name
	const text = tweet.text

	console.log({ from, text })
}
