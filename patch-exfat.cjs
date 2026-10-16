const fs = require('fs');

const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;
const origPromisesReadlink = fs.promises ? fs.promises.readlink : null;

if (origReadlink) {
  fs.readlink = function (path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    origReadlink.call(fs, path, options, (err, linkString) => {
      if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
        const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        einval.code = 'EINVAL';
        return callback(einval);
      }
      return callback(err, linkString);
    });
  };
}

if (origReadlinkSync) {
  fs.readlinkSync = function (path, options) {
    try {
      return origReadlinkSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
        const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        einval.code = 'EINVAL';
        throw einval;
      }
      throw err;
    }
  };
}

if (origPromisesReadlink) {
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
        const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        einval.code = 'EINVAL';
        throw einval;
      }
      throw err;
    }
  };
}
