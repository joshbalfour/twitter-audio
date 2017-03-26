const connectedUsers = {}

function classify(tweet) {
	if (tweet.text.indexOf('RT') > -1) {
		return "IssuesEvent"
	}
	if (tweet.text.indexOf('@') > -1) {
		return "IssueCommentEvent"
	}
	if (tweet.text.indexOf('http') > -1) {
		return "PushEvent"
	}
	return "PullRequestEvent"
}

socket.on('tweet', function(data) {
	const tweet = data.tweet
	const connectedUsers = data.connectedUsers
	const useful = {
		id: tweet.id_str,
		from: tweet.user.screen_name,
		message: tweet.text,
		type: classify(tweet),
	}
	console.log(useful)
	handleTweet(useful)
})

socket.on('config', function(config){
	if (config.track) {
		$('#track').val(config.track)
		$('#tracking').text(config.track)
	}
})

$('#tracking').text('nothing yet')

function stopStream() {
	socket.emit('stop')
}

function startStream(track, follow) {
	socket.emit('start', { track:track, follow:follow })
}

$('#trackForm').submit(function(){
	const track = $('#track').val()
	startStream(track)
})

$('#stop').click(function(){
	stopStream()
})