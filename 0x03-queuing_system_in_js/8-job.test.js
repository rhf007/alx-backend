const kue = require('kue');
const { expect } = require('chai');
const createPushNotificationsJobs = require('./8-job');

describe('createPushNotificationsJobs', () => {
  let queue;

  beforeEach((done) => {
    queue = kue.createQueue({ redis: { db: 3 } });
    queue.testMode.enter();
    queue.testMode.clear(done);
  });

  afterEach((done) => {
    queue.testMode.clear(done);
    queue.testMode.exit();
  });

  it('should throw an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs({}, queue)).to.throw('Jobs is not an array');
  });

  it('should create new jobs in the queue', (done) => {
    const jobs = [
      {
        phoneNumber: '4153518780',
        message: 'This is the code 1234 to verify your account',
      },
      {
        phoneNumber: '4153518781',
        message: 'This is the code 4562 to verify your account',
      },
    ];

    createPushNotificationsJobs(jobs, queue);

    setTimeout(() => {
      expect(queue.testMode.jobs.length).to.equal(jobs.length);
      expect(queue.testMode.jobs.map((job) => job.data)).to.deep.equal(jobs);
      done();
    }, 100);
  });
});
