const fs = require('fs/promises')
const { Readable } = require('stream')
const colors = require('colors/safe');
const { createServer } = require('http');
const path = require('path')

const loadFrames = async () => {
    const files = await fs.readdir('./frames')
    const all = await Promise.all(files.map(async (folder) => {
        const filesInFolder = (await fs.readdir(`./frames/${folder}`)).sort((a, b) => a.slice(0, a.indexOf('.')) - b.slice(0, b.indexOf('.')))
        return filesInFolder.map(file => `./frames/${folder}/${file}`)
    }))
    return await Promise.all(all.flat().map(file => fs.readFile(file)))
}

const colorOptions = [
    'red',
    'yellow',
    'green',
    'blue',
    'magenta',
    'cyan',
    'white'
];


const displayFramesInterval = async (rs) => {
    const frames = await loadFrames()
    let index = 0
    let colorIndex
    return setInterval(() => {
        colorIndex = index !== frames.length - 1 ? Math.floor(Math.random() * colorOptions.length) : colorIndex
        rs.push('\033[2J\033[3J\033[H');
        rs.push(colors[colorOptions[colorIndex]](frames[index].toString()))
        index = index !== frames.length - 1 ? index + 1 : index
    }, 70)
}


const server = createServer(async (req, res) => {
    if (
        req.headers &&
        req.headers['user-agent'] &&
        !req.headers['user-agent'].includes('curl')
      ) {
        res.writeHead(302, { Location: 'https://github.com/ignatij/terminal-stormlight' });
        return res.end();
      }
    const rs = new Readable()
    rs._read = () => {}
    rs.pipe(res)
    const interval = await displayFramesInterval(rs)
    req.on('close', () => {
        rs.destroy()
        clearInterval(interval)
    })
})

const port = process.env.PORT || 8080

server.listen(port, (err) => {
    if(err) {
        console.error(err)
        process.exit(1)
    }
    console.log('Server started on port ' + port)   
})