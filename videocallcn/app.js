let express = require('express');
let stream = require('./stream');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let path = require('path');
let bodyParser = require('body-parser');
let cors = require('cors');




app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.of('/stream').on('connection', stream);

const port = process.env.PORT || 3030;
server.listen(port, () => {
    console.log("ALL OK !! GO TO PORT : " + port);
});

// app.use(cors());
// customized welcome message