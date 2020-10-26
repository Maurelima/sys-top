const path = require('path')
const osu = require('node-os-utils')
const {ipcRenderer} = require('electron')
//const notifier = require('node-notifier');
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload 
let alertFrequency

// Get settings & values 
ipcRenderer.on('settings:get', (e, settings) => {
    cpuOverload = +settings.cpuOverload
    alertFrequency = +settings.alertFrequency
})

// Object
// notifier.notify({
//   title: 'My notification',
//   message: 'Hello, there!'
// });

// Run every 2 secons
setInterval(() => {
    //cpu usage
    cpu.usage().then(info => {
        document.getElementById('cpu-usage').innerText = info + '%'

        document.getElementById('cpu-progress').style.width = info + '%'

        //make progressbar red if overload
        if(info >= cpuOverload){
            document.getElementById('cpu-progress').style.background = 'red'
        }else{
            document.getElementById('cpu-progress').style.background = '#30c88b'
        }

        //Check overload
        if(info >= cpuOverload && runNotify(alertFrequency)){
            notifyUser({
                title: 'Sobrecarga na CPU',
                body: `CPU está acima de ${cpuOverload}%`,
                icon: path.join(__dirname, 'img', 'icon.png'),
            })   
            
            localStorage.setItem('lastNotify', +new Date())
        }
    })

    //cpu free
    cpu.free().then(info =>{
        document.getElementById('cpu-free').innerText = info + '%'
    })
    //Uptime 
    document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime())

    //mem percent
    // mem.info().then(info =>{
    //     document.getElementById('mem-free').innerText = info.freeMemPercentage + '%'
    // })

}, 2000)

//set model
document.getElementById('cpu-model').innerText = cpu.model()

//computer name 
document.getElementById('comp-name').innerText = os.hostname()

//os 
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`

// total mem 
mem.info().then(info =>{
    document.getElementById('mem-total').innerText = info.totalMemMb
    console.log(info)
})



// show days hours mins secs
function secondsToDhms(seconds) {
    seconds =+ seconds
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d, ${h}h, ${m}m, ${s}s`
}

//Send notification 
 function notifyUser(options){
     new Notification(options.title, options)
 }

//Check time past since last notification
function runNotify(frequency) {
    if(localStorage.getItem('lastNotify') === null){
        //Store TimeStamp 
        localStorage.setItem('lastNotify', +new Date())
        return true
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
    const now = new Date()
    const diffTime = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTime / (1000 * 60))

    if(minutesPassed > frequency){
        return true
    }else{
        false
    }
}