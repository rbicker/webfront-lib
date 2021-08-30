/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

const brotli = require('brotli');
const zlib = require('zlib');
const fs = require('fs');

// defaults for command line arguments
const defaultArgs = {
  dir: './build/release',
};

/**
 * get args parses the scripts command line arguments
 * @returns dictonary containing scripts command line arguments
 */
const getArgs = () => {
  const opts = { ...defaultArgs };
  if (process.env.argv) {
    const srcIndex = process.env.argv.indexOf('-s');
    if (srcIndex > -1) {
      if (process.env.argv.length <= srcIndex + 1) {
        console.error('invalid command line arguments, expected string after source argument');
        process.exit(1);
      }
      opts.dir = process.env.argv[srcIndex + 1];
    }
  }
  return opts;
};

/**
 * recursively compress files in directory
 * using gzip and brotli
 */
const compressDir = () => {
  const opts = getArgs();
  const { dir } = opts;
  console.log(`reading directory: ${dir}`);
  fs.readdirSync(dir).forEach((fileName) => {
    if (fileName.endsWith('.js') || fileName.endsWith('.css') || fileName.endsWith('.html')) {
      const filePath = `${dir}/${fileName}`;
      // brotli
      const result = brotli.compress(fs.readFileSync(filePath), {
        extension: 'br',
        skipLarger: true,
        mode: 1, // 0 = generic, 1 = text, 2 = font (WOFF2)
        quality: 10, // 0 - 11,
        lgwin: 12, // default
      });
      const brPath = `${filePath}.br`;
      console.log(`writing: ${brPath}`);
      fs.writeFileSync(brPath, result);
      // gzip
      const gzPath = `${filePath}.gz`;
      console.log(`writing: ${gzPath}`);
      const fileContents = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream(gzPath);
      const zip = zlib.createGzip();
      fileContents
        .pipe(zip)
        .on('error', (err) => console.error(err))
        .pipe(writeStream)
        .on('error', (err) => console.error(err));
    }
  });
};

// compress given directory
compressDir();
