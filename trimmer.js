'use strict'

const fs = require('fs/promises')

const fn = async () => {
    const folder = await fs.readdir('./frames/4')
    folder.forEach(async (file) => {
        const fileContent = await fs.readFile(`./frames/4/${file}`)
        await fs.writeFile(`./frames/4/${file}`, fileContent.toString().trim())
    })
    
}

fn()
