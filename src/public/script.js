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
	$('#edit').show()
	$('#start').hide()
	if (config && config.track) {
		$('#track').val(config.track)
		$('#trackForm').hide()
		$('#tracking').text('Tracking: ')
		$('#tracking-phrase').text(config.track)
		$('#stop').show()
		$('#cancel').hide()
	} else {
		$('#tracking').text('Tracking: ')
		$('#tracking-phrase').text('nothing yet')
		$('#stop').hide()
		$('#cancel').hide()
	}
})

socket.on('disconnect', function() {
	$('#tracking').text('Disconnected, Reconnecting...')
	$('#tracking-phrase').hide()
})

socket.on('connect', function() {
	$('#tracking').text('Tracking: ')
	$('#tracking-phrase').text($('#track').val())
	$('#tracking-phrase').show()
})

function stopStream() {
	socket.emit('stop')
}

function startStream(track, follow) {
	socket.emit('start', { track:track, follow:follow })
}

$('#start').click(function(){
	const track = $('#track').val()
	startStream(track)
	$('#tracking-phrase').show()
})

$('#stop').click(function(){
	stopStream()
})

$('#cancel').click(function(){
	$('#edit').show()
	$('#trackForm').hide()
	$('#start').hide()
	$('#cancel').hide()
	$('#tracking-phrase').show()
})

$('#edit').click(function(){
	$('#trackForm').show()
	$('#start').show()
	$('#cancel').show()
	$('#edit').hide()
	$('#tracking-phrase').hide()
})