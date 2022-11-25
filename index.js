const express = require('express')
const app = express()
app.use(
	express.urlencoded({
		extended: false,
	}),
)

const cors = require('cors')
app.use(
	cors({
		optionsSuccessStatus: 200,
	}),
)

const dayjs = require('dayjs')

// ขี้เกียจเชื่อม database
const DB_USER = []
const DB_EXERCISE = []

app.post('/api/users', (req, res) => {
	const { username } = req.body

	const id = (DB_USER.length + 1).toString()
	DB_USER.push({
		_id: id,
		username,
	})
	return res.send({
		_id: id,
		username,
	})
})

app.get('/api/users', (req, res) => {
	return res.send(DB_USER)
})

app.post('/api/users/:id/exercises', (req, res) => {
	let { description, duration, date } = req.body
	if (!date) date = new Date()
	else date = Date.parse(date)

	const userData = DB_USER.find((row) => row._id == req.params.id)
	if (userData) {
		DB_EXERCISE.push({
			_id: userData._id,
			username: userData.username,
			description,
			duration: Number(duration),
			date: dayjs(date).format('ddd MMM DD YYYY'),
		})
		return res.send({
			_id: userData._id,
			username: userData.username,
			description,
			duration: Number(duration),
			date: dayjs(date).format('ddd MMM DD YYYY'),
		})
	}

	return res.send({
		error: 'User Not Found',
	})
})

// it just a example don't do this shit
app.get('/api/users/:id/logs', (req, res) => {
	const userData = DB_USER.find((row) => row._id === req.params.id)
	if (userData) {
		const { from, to, limit } = req.query
		const exerciseData = DB_EXERCISE.filter((row) => row._id === req.params.id)
		const filteredExercise = []

		let limited = 0

		for (row of exerciseData) {
			if (limited < Number(limit || 99999)) {
				const rowDate = new Date(Date.parse(row.date))
				const fromDate = new Date(Date.parse(from || row.date))
				const toDate = new Date(Date.parse(to || row.date))

				if (rowDate.getTime() >= fromDate.getTime() && rowDate.getTime() <= toDate.getTime()) {
					filteredExercise.push(row)
					limited++
				}
			}
		}

		return res.send({
			_id: userData._id,
			username: userData.username,
			count: filteredExercise.length,
			log: filteredExercise,
		})
	}

	return res.send({
		error: 'User Not Found',
	})
})

app.listen(3000)

module.exports = app
