// populate database for slow tests
// eslint-disable-next-line import/no-extraneous-dependencies
const { event, recorder, output } = require('codeceptjs');
const { resetConnection } = require('../../server');

const TiggerOnTag = '@db';

module.exports = () => {
  event.dispatcher.on(event.test.before, (test) => {
    if (test.tags.indexOf(TiggerOnTag) >= 0) {
      recorder.add('dump db', async () => {
        output.print('[ ] reset db connection');
        await resetConnection();
        output.print('[ok] reset db connection');
      });
    }
  });
};
