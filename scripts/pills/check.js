'use strict';

const path = require('path');
const { loadPills, validateCollection } = require('./validator');

const rootDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', '..', 'content', 'pills');
const now = process.argv[3]
  ? new Date(process.argv[3] + 'T00:00:00Z')
  : new Date();

if (require.main === module) {
  try {
    const records = loadPills(rootDir);
    const errors = validateCollection(records, now);

    if (errors.length) {
      errors.forEach(function (error) { console.error(error); });
      process.exitCode = 1;
    } else {
      console.log(records.length + ' Knowledge Pills passed validation.');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
