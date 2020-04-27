const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = require('electron');

let mainWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({
        frame: true,
        resizable: true,
        icon: __dirname + '/app/img/logo.png'
    });

    mainWindow.setOverlayIcon(__dirname + '/app/img/logo.png', 'DSAN Timer App');


    // Load html into window
    // mainWindow.loadURL(url.format({
    //     pathname : path.join(__dirname, '/app/index.html'),
    //     protocol : 'file:',
    //     slashes  : true
    // }));

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    // Build menu from template
    // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    // Menu.setApplicationMenu(mainMenu);
});

// Create menu template
// const mainMenuTemplate = [
//     {
//         label: ''
//     }
// ];

  