const express = require('express');
const redis = require('redis');
const kue = require('kue');
const { promisify } = require('util');

const client = redis.createClient();

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const initialAvailableSeats = 50;
setAsync('available_seats', initialAvailableSeats);

let reservationEnabled = true;

async function reserveSeat(number) {
  await setAsync('available_seats', number);
}

async function getCurrentAvailableSeats() {
  const numberOfAvailableSeats = await getAsync('available_seats');
  return parseInt(numberOfAvailableSeats);
}

const queue = kue.createQueue();

const app = express();
app.use(express.json());

app.get('/available_seats', async (req, res) => {
  const numberOfAvailableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats });
});

app.get('/reserve_seat', (req, res) => {
  if (!reservationEnabled) {
    res.json({ status: 'Reservation are blocked' });
    return;
  }

  const job = queue.create('reserve_seat').save((error) => {
    if (!error) {
      res.json({ status: 'Reservation in process' });
    } else {
      res.json({ status: 'Reservation failed' });
    }
  });

  job.on('complete', () => {
    console.log(`Seat reservation job ${job.id} completed`);
  });

  job.on('failed', (error) => {
    console.log(`Seat reservation job ${job.id} failed: ${error}`);
  });
});

app.get('/process', async (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', async (job, done) => {
    const currentAvailableSeats = await getCurrentAvailableSeats();
    if (currentAvailableSeats === 0) {
      reservationEnabled = false;
      done(new Error('Not enough seats available'));
    } else {
      const newAvailableSeats = currentAvailableSeats - 1;
      await reserveSeat(newAvailableSeats);
      if (newAvailableSeats === 0) {
        reservationEnabled = false;
      }
      done();
    }
  });
});

const port = 1245;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
