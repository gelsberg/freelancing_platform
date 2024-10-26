const http = require('http');
const fs = require('fs');
const { URLSearchParams } = require('url');

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/project', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('DATABASE CONNECTED');
    })
    .catch(err => {
        console.error('DATABASE CONNECTION ERROR:', err);
    });

const freelancerSchema = new mongoose.Schema({
    name: String,
    password: String,
    age: Number,
    mobile: String,
    email: String,
    gender: String,
    state: String,
    skills: String,
    experience: String,
    location: String,
    hourly_rate: String,
});
const Freelancer = mongoose.model('Freelancer', freelancerSchema);

const server = http.createServer(function(req, res) {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('signupf.html').pipe(res);
    } else if (req.url === '/signupf' && req.method === 'POST') {
        var rawdata = '';
        req.on('data', function(data) {
            rawdata += data;
        });
        req.on('end', function() {
            var formdata = new URLSearchParams(rawdata);
            const newFreelancer = new Freelancer({
                name: formdata.get('fullname'),
                email: formdata.get('email'),
                password: formdata.get('password'),
                skills: formdata.get('skills'),
                experience: formdata.get('experience'),
                location: formdata.get('location'),
                hourly_rate: formdata.get('hourly_rate'),
                age: formdata.get('age'),
                mobile: formdata.get('mobile'),
                gender: formdata.get('gender'),
                state: formdata.get('state'),
            });
            newFreelancer.save()
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
        Freelancer.find()
            .then(users => {
                res.write("<table border='1' cellspacing='0' style='width: 100%;'><tr><th>Name</th><th>Password</th><th>Age</th><th>MobileNumber</th><th>Email</th><th>Gender</th><th>State</th><th>Skills</th><th>Experience</th><th>Location</th><th>Hourly Rate</th></tr>");
                users.forEach(record => {
                    res.write('<tr>');
                    res.write('<td style="padding: 10px;">' + record.name + '</td>');
                    res.write('<td style="padding: 10px;">' + record.password + '</td>');
                    res.write('<td style="padding: 10px;">' + record.age + '</td>');
                    res.write('<td style="padding: 10px;">' + record.mobile + '</td>');
                    res.write('<td style="padding: 10px;">' + record.email + '</td>');
                    res.write('<td style="padding: 10px;">' + record.gender + '</td>');
                    res.write('<td style="padding: 10px;">' + record.state + '</td>');
                    res.write('<td style="padding: 10px;">' + record.skills + '</td>');
                    res.write('<td style="padding: 10px;">' + record.experience + '</td>');
                    res.write('<td style="padding: 10px;">' + record.location + '</td>');
                    res.write('<td style="padding: 10px;">' + record.hourly_rate + '</td>');
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

server.listen('3000', function() {
    console.log('Server started at http://127.0.0.1:3000');
});
