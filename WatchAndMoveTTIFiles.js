const chokidar = require('chokidar')
const fs = require('node:fs/promises')
const path = require('path')

// Define the source and destination directories
const sourceDirTest = path.join('D:', 'Composer Presets', 'TTI CSV Holding folder', 'file.txt')
// const sourcePath = path.join('D:', 'Composer Presets', 'TTI CSV Holding folder', 'NewTextDocument.txt')
const sourceDir = path.join('D:', 'Composer Presets', 'TTI CSV Holding folder')
const destDir = path.join('D:', 'Composer Presets', 'VDP Presets', 'TTI BC', 'Input2')
const processedDir = path.join('D:', 'Composer Presets', 'TTI CSV Processed')
//const sourceDir = path.join(process.env.HOME, 'Code', 'Sandbox', 'ComposerServer', 'TTI CSV Holding folder for delay')
//const destDir = path.join(process.env.HOME, 'Code', 'Sandbox', 'ComposerServer', 'TTI BC Input')
//const processedDir = path.join(process.env.HOME, 'Code', 'Sandbox', 'ComposerServer', 'TTI Processed')

// Function to move files from source to destination
async function moveFile(sourcePath, destDir, processedPath) {
  // Wait until the file is no longer being written to
  let isWriting = true
  while (isWriting) {
    try {
      await fs.access(sourcePath, fs.constants.R_OK)
      isWriting = false
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  // Move the file
  const fileName = path.basename(sourcePath, '.csv')
  const destPath = path.join(destDir, fileName + '.csv')
  const processedFilePath = path.join(processedPath, fileName + '_processed.csv')

  try {
    // const temp = await fs.copy(sourcePath, `${processedFilePath}_processed`)
    fs.copyFile(`${sourcePath}`, `${destPath}`).then(() => {
      console.log('success!')
      console.log(`Copied file ${sourcePath} to ${destPath}`)
    }).catch(err => {
      console.error(err)
    })
  } catch (err) {
    console.error(`Failed to copy file ${sourcePath} to ${destFilePath}:`, err)
  }

  try {
    // const temp = await fs.copy(sourcePath, `${processedFilePath}_processed`)
    fs.copyFile(`${sourcePath}`, `${processedFilePath}`).then(() => {
      console.log('process success!')
      console.log(`Copied processed file ${sourcePath} to ${processedFilePath}`)
    }).catch(err => {
      console.error(err)
    })
  } catch (err) {
    console.error(`Failed to copy file ${sourcePath} to ${processedFilePath}:`, err)
  }
}
// Initialize the watcher
const watcher = chokidar.watch(sourceDir, {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,
  interval: 200,
  binaryInterval: 200,
})

// Add event listeners
watcher.on('add', (filePath) => {
  console.log(`File added: ${filePath}`)
  moveFile(filePath, destDir, processedDir)
})

// Handle errors
watcher.on('error', (error) => console.error(`Watcher error: ${error}`))

console.log(`Watching for new files in ${sourceDir}...`)
