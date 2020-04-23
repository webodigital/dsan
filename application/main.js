const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = require('electron');

let mainWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({
        // frame: false,
        // height: 700,
        // resizable: false,
        // width: 368
    });

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
//         label: 'File',
//         submenu: [
//             {
//                 label: 'Add Item'
//             },
//             {
//                 label: 'Clear Item'
//             },
//             {
//                 label: 'Close',
//                 accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
//                 click(){
//                     app.quit();
//                 }
//             }
//         ]
//     }
// ];

  