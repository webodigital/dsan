const url = require('url');
const path = require('path');
var ex = require('express')();

const {app, BrowserWindow, Menu} = require('electron');

let mainWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({
        frame: true,
        resizable: true,
        width: 450,
        height: 290,
        icon: __dirname + '/app/img/logo.png'
    });

    mainWindow.setOverlayIcon(__dirname + '/app/img/logo.png', 'DSAN Timer App');

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    // Build menu from template
    // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // // Insert menu
    // Menu.setApplicationMenu(mainMenu);

});

// Create menu template
// const mainMenuTemplate = [
//     {
//         label: ''
//     }
// ];

  