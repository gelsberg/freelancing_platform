const http = require('http');
const fs = require('fs');
const { URLSearchParams } = require('url');
const mongoose = require('mongoose');

// Replace the local connection string with the MongoDB Atlas connection string
mongoose.connect('mongodb+srv://gelsberge:<db_password>@webdev3.az963.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('DATABASE CONNECTED TO MONGODB ATLAS');
    })
    .catch(err => {
        console.error('DATABASE CONNECTION ERROR:', err);
    });

const jobAssignerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});
const JobAssigner = mongoose.model('JobAssigner', jobAssignerSchema);

const server = http.createServer(function(req, res) {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('signupj.html').pipe(res);
    } else if (req.url === '/signupj' && req.method === 'POST') {
        var rawdata = '';
        req.on('data', function(data) {
            rawdata += data;
        });
        req.on('end', function() {
            var formdata = new URLSearchParams(rawdata);
            const newJobAssigner = new JobAssigner({
                name: formdata.get('fullname'),
                email: formdata.get('email'),
                password: formdata.get('password'),
            });
            newJobAssigner.save()
                .then(() => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write("Data saved");
                    res.end();
                })
                .catch(err => {
                    console.error('DATABASE INSERTION ERROR:', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.write("Error saving data");
                    res.end();
                });
        });
    } else if (req.url === '/view' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        JobAssigner.find()
            .then(users => {
                res.write("<table border='1' cellspacing='0' style='width: 100%;'><tr><th>Name</th><th>Email</th><th>Password</th></tr>");
                users.forEach(user => { 
                    res.write('<tr>');
                    res.write('<td style="padding: 10px;">' + user.name + '</td>');
                    res.write('<td style="padding: 10px;">' + user.email + '</td>');
                    res.write('<td style="padding: 10px;">' + user.password + '</td>');
                    res.write('</tr>');
                });
                res.write('</table>');
                res.end();
            })
            .catch(err => {
                console.error('DATABASE QUERY ERROR:', err);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.write("Error fetching data");
                res.end();
            });
    }
});

server.listen('2000', function() {
    console.log('Server started at http://127.0.0.1:2000');
});
