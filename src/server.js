const Twit = require('twit')
const url = require('url')

const T = new Twit({
	consumer_key:         process.env.TWITTER_CONSUMER_KEY,
	consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
	access_token:         process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

const streams = {}
const configs = {}
const connectedUsers = {}

function makeStream(room) {
	const { track, follow } = configs[room]
	stopStream(room)
	const opts = { track, follow, stall_warnings: true }
	const stream = T.stream('statuses/filter', opts)
	stream.on('message', (message) => {
		if (!message.source) {
			console.log(`[${room}] ${JSON.stringify(message)}`)
		}
	})
	stream.on('tweet', (tweet) => {
		io.to(room).emit('tweet', { tweet, connectedUsers: connectedUsers[room] })
	})

	io.to(room).emit('config', configs[room])

	stream.on('connect', () => {
		console.log(`[${room}] created twitter stream ${JSON.stringify(opts)}`)
	})

	stream.on('limit', function (limitMessage) {
		console.log(`[${room}] hit limit ${JSON.stringify(limitMessage)}`)
	})

	stream.on('disconnect', function (disconnectMessage) {
		console.log(`[${room}] disconnect ${JSON.stringify(disconnectMessage)}`)
	})

	stream.on('warning', function (warning) {
		console.error(`[${room}] warning ${JSON.stringify(warning)}`)
	})
	stream.on('error', function (err) {
		console.error(`[${room}] error ${JSON.stringify(err)}`)
	})

	stream.on('reconnect', msg => {
		console.error(`[${room}] reconnect`)
	})

	streams[room] = stream
}

function stopStream(room){
	if (streams[room]) {
		streams[room].stop()
		streams[room] = null
		console.log(`[${room}] stopped stream`)
	} else {
		console.log(`[${room}] stream already stopped`)
	}
}

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static('public'))

io.on('connection', (socket) => {

	const ref = url.parse(socket.request.headers.referer)
	const room = ref.hostname
	// const room = "default"

	socket.join(room)
	if (!connectedUsers[room]) {
		connectedUsers[room] = 0
	}
	connectedUsers[room]++

	console.log(`a user connected to room ${room}, ${room} now has ${connectedUsers[room]} users`)

	socket.on('start', ({ track, follow }) => {
		configs[room] = { track, follow }
		makeStream(room)
	})

	socket.emit('config', configs[room])
	if (configs[room] && !streams[room]) {
		makeStream(room)
	}

	socket.on('stop', () => {
		stopStream(room)
		delete configs[room]
		socket.emit('config', { track: '', follow: '' })
	})

	socket.on('disconnect', () => {
		console.log(`[${room}] user disconnected`)
		connectedUsers[room]--
		if (connectedUsers[room] <= 0) {
			stopStream(room)
		}
		console.log(`a user connected to room ${room}, ${room} now has ${connectedUsers[room]} users`)
	})

})

http.listen(80, () => {
	console.log('listening on *:80')
})
