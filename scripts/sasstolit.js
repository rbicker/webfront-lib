#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const fs = require('fs');
const process = require('process');
const path = require('path');
const sass = require('sass');

// defaults for command line arguments
const defaultArgs = {
  srcDir: './src',
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
      opts.srcDir = process.env.argv[srcIndex + 1];
    }
  }
  return opts;
};

/**
 * recursivly search for scss files in given source directory
 * @param {string} srcDir directory in which to search for scss files
 * @returns {Promise<String[]>} promise resolving to a list of paths to scss files
 */
const getSassFiles = async (srcDir = './src') => new Promise((resolve, reject) => {
  console.log(`reading directory: ${srcDir}`);
  fs.readdir(srcDir, { withFileTypes: true }, async (err, files) => {
    if (err) {
      reject(err);
    } else {
      const results = [];
      const promises = files.map((f) => {
        // handle subdirectories
        if (f.isDirectory()) {
          const dirPath = path.join(srcDir, f.name);
          return getSassFiles(dirPath).then((res) => {
            results.push(...res);
          }, (e) => reject(e));
          // handle scss files
        } if (f.name.match(/\.s?css$/) && !f.name.startsWith('_')) {
          const filePath = path.join(srcDir, f.name);
          console.log(`found scss file: ${filePath}`);
          results.push(filePath);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      resolve(results);
    }
  });
});

/**
 *
 * @param {String} sassFile
 * @returns {Promise<String>}
 */
const sassToCss = (sassFile) => new Promise((resolve, reject) => {
  sass.render(
    {
      file: sassFile,
      outputStyle: 'compressed',
    },
    (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.css.toString());
      }
    },
  );
});

const writeFile = (outFile, data) => {
  console.log(`Creating file ${outFile}...`);
  return new Promise((resolve, reject) => {
    fs.writeFile(outFile, data, { encoding: 'utf-8' }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const sassRender = async () => {
  const template = "import { css } from 'lit';\n\nexport default css`{0}`;\n";
  const opts = getArgs();
  const sassFiles = await getSassFiles(opts.srcDir);
  const promises = sassFiles.map(async (f) => {
    const cssString = await sassToCss(f);
    const newFileName = f.replace(/\.[^/.]+$/, '.css.ts');
    const content = template.replace('{0}', cssString.trim());
    await writeFile(newFileName, content);
  });
  await Promise.all(promises);
};

sassRender().catch((err) => {
  console.error(err);
  process.exit(-1);
});
