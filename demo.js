const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URLSearchParams } = require('url');

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/project')
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

const jobAssignerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});
const JobAssigner = mongoose.model('JobAssigner', jobAssignerSchema);

const hireRequestSchema = new mongoose.Schema({
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
    freelancerName: String,
    fromId: String,
    fromType: String,
    fromName: String,
    fromEmail: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});
const HireRequest = mongoose.model('HireRequest', hireRequestSchema);

const jobSchema = new mongoose.Schema({
    title: String,
    description: String,
    skills: String,
    budget: String,
    location: String,
    clientId: String,
    clientName: String,
    createdAt: { type: Date, default: Date.now },
});
const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    jobTitle: String,
    clientId: String,
    freelancerId: String,
    freelancerName: String,
    freelancerEmail: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});
const Application = mongoose.model('Application', applicationSchema);

// ---------- Sessions ----------

const sessions = new Map(); // token -> { id, type, name, email }

function getUser(req) {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/(?:^|;\s*)session=([a-f0-9]+)/);
    return match ? sessions.get(match[1]) || null : null;
}

function createSession(res, user) {
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, user);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=604800`);
}

function destroySession(req, res) {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/(?:^|;\s*)session=([a-f0-9]+)/);
    if (match) sessions.delete(match[1]);
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
}

function redirect(res, to) {
    res.writeHead(302, { Location: to });
    res.end();
}

function readBody(req) {
    return new Promise(resolve => {
        let raw = '';
        req.on('data', d => { raw += d; });
        req.on('end', () => resolve(new URLSearchParams(raw)));
    });
}

// ---------- HTML helpers ----------

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Role-aware navbar + shared HustleHub theme shell
function page(title, body, user) {
    let rightNav;
    if (!user) {
        rightNav = `
           <li><a href="/jobs">Find Jobs</a></li>
           <li><a href="/view">Browse Talent</a></li>
           <li><a href="/signin.html">Sign in</a></li>
           <li><a class="cta" href="/signup.html">Join now</a></li>`;
    } else if (user.type === 'freelancer') {
        rightNav = `
           <li><a href="/jobs">Find Jobs</a></li>
           <li><a href="/messages">Messages</a></li>
           <li><a href="/logout">Log out</a></li>
           <li><a class="cta" href="/freelancer/${user.id}">${esc(user.name.split(' ')[0])}</a></li>`;
    } else {
        rightNav = `
           <li><a href="/view">Browse Talent</a></li>
           <li><a href="/postjob">Post a Job</a></li>
           <li><a href="/messages">Messages</a></li>
           <li><a href="/logout">Log out</a></li>
           <li><a class="cta" href="/view">${esc(user.name.split(' ')[0])}</a></li>`;
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — HustleHub</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#070d1a;--card:#111b30;--field:#0b1322;--line:rgba(148,163,184,.14);--line-strong:rgba(148,163,184,.28);--ink:#e8eef8;--muted:#92a4c0;--teal:#2dd4bf;--grad:linear-gradient(135deg,#2dd4bf,#38bdf8)}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;display:flex;flex-direction:column}
.navbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 6vw;background:rgba(7,13,26,.72);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.brand{font-size:1.35rem;font-weight:800;letter-spacing:-.02em;text-decoration:none;color:var(--ink)}
.brand span{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.nav-links{display:flex;align-items:center;gap:6px;list-style:none}
.nav-links a{color:var(--muted);text-decoration:none;font-size:.92rem;font-weight:600;padding:8px 14px;border-radius:10px;transition:color .2s,background .2s}
.nav-links a:hover{color:var(--ink);background:rgba(148,163,184,.1)}
.nav-links a.cta{color:#06202b;background:var(--grad);margin-left:8px;box-shadow:0 4px 18px rgba(45,212,191,.35)}
main{flex:1;padding:50px 6vw 80px;max-width:1200px;width:100%;margin:0 auto}
h1{font-size:clamp(1.7rem,3.5vw,2.3rem);font-weight:800;letter-spacing:-.02em;margin-bottom:8px}
h1 span{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{color:var(--muted);margin-bottom:36px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:22px}
a.tcard{text-decoration:none;color:inherit;display:block}
.tcard{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;transition:transform .25s,border-color .25s}
.tcard:hover{transform:translateY(-4px);border-color:rgba(45,212,191,.4)}
.tcard .avatar{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-weight:800;font-size:1.1rem;color:#06202b;background:var(--grad);margin-bottom:16px}
.tcard h3{font-size:1.1rem;font-weight:800;margin-bottom:2px}
.tcard .loc{color:var(--muted);font-size:.84rem;margin-bottom:14px}
.tcard .skills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.tcard .skills span{font-size:.76rem;font-weight:600;color:var(--teal);background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.25);padding:4px 10px;border-radius:999px}
.tcard .meta{display:flex;justify-content:space-between;color:var(--muted);font-size:.84rem;border-top:1px solid var(--line);padding-top:14px}
.tcard .meta b{color:var(--ink);font-size:.95rem}
.tcard .viewp{margin-top:14px;font-size:.86rem;font-weight:700;color:var(--teal)}
/* Job cards */
a.jcard{text-decoration:none;color:inherit;display:block}
.jcard{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;transition:transform .25s,border-color .25s}
.jcard:hover{transform:translateY(-4px);border-color:rgba(45,212,191,.4)}
.jcard .jtop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:6px}
.jcard h3{font-size:1.1rem;font-weight:800}
.jcard .budget{white-space:nowrap;font-weight:800;color:var(--teal);font-size:.95rem}
.jcard .client{color:var(--muted);font-size:.84rem;margin-bottom:12px}
.jcard .desc{color:var(--muted);font-size:.9rem;line-height:1.55;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.jcard .skills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.jcard .skills span{font-size:.76rem;font-weight:600;color:var(--teal);background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.25);padding:4px 10px;border-radius:999px}
.jcard .meta{display:flex;justify-content:space-between;color:var(--muted);font-size:.82rem;border-top:1px solid var(--line);padding-top:14px}
/* Search bar */
.searchbar{display:flex;max-width:520px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:5px;margin-bottom:36px}
.searchbar input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:var(--ink);font:inherit;font-size:.95rem;padding:10px 18px}
.searchbar input::placeholder{color:#526074}
.searchbar button{border:none;cursor:pointer;font:inherit;font-weight:700;font-size:.9rem;color:#06202b;background:var(--grad);padding:10px 26px;border-radius:999px}
.center{flex:1;display:grid;place-items:center;text-align:center;padding:60px 6vw}
.panel{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:48px 44px;max-width:440px;box-shadow:0 30px 70px rgba(0,0,0,.45)}
.panel .mark{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;margin:0 auto 22px;background:rgba(45,212,191,.12);font-size:1.8rem}
.panel h1{font-size:1.5rem;margin-bottom:8px}
.panel p{color:var(--muted);font-size:.95rem;margin-bottom:26px}
.btn{display:inline-block;border:none;cursor:pointer;font:inherit;text-decoration:none;font-weight:800;font-size:.95rem;color:#06202b;background:var(--grad);padding:13px 30px;border-radius:12px;box-shadow:0 8px 26px rgba(45,212,191,.3);transition:filter .2s}
.btn:hover{filter:brightness(1.08)}
.btn.ghost{color:var(--muted);background:transparent;border:1px solid var(--line);box-shadow:none;margin-left:8px}
.btn.ghost:hover{color:var(--ink)}
.empty{text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:18px;padding:60px 20px}
footer{border-top:1px solid var(--line);padding:26px 6vw;text-align:center;color:var(--muted);font-size:.85rem}
/* Profile / detail pages */
.profile{display:grid;grid-template-columns:1.4fr 1fr;gap:26px;align-items:start}
.pcard{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:34px}
.phead{display:flex;align-items:center;gap:20px;margin-bottom:26px}
.phead .avatar{width:72px;height:72px;border-radius:20px;display:grid;place-items:center;font-weight:800;font-size:1.7rem;color:#06202b;background:var(--grad)}
.phead h2{font-size:1.5rem;font-weight:800}
.phead .loc{color:var(--muted);font-size:.92rem}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;margin-bottom:26px}
.fact{background:var(--field);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.fact small{display:block;color:var(--muted);font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
.fact b{font-size:1.05rem}
.skills-full{display:flex;flex-wrap:wrap;gap:8px}
.skills-full span{font-size:.84rem;font-weight:600;color:var(--teal);background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.25);padding:6px 14px;border-radius:999px}
.sec-label{font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:12px}
.longtext{color:var(--muted);font-size:.96rem;line-height:1.7;margin-bottom:26px;white-space:pre-line}
/* Forms */
.fgroup{margin-bottom:16px}
.fgroup label{display:block;font-size:.82rem;font-weight:700;color:var(--muted);margin-bottom:7px}
.fgroup input,.fgroup textarea{width:100%;font:inherit;font-size:.95rem;color:var(--ink);background:var(--field);border:1px solid var(--line-strong);border-radius:12px;padding:12px 15px;outline:none;transition:border-color .2s,box-shadow .2s}
.fgroup input:focus,.fgroup textarea:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(45,212,191,.18)}
.fgroup input[readonly]{color:var(--muted)}
.fgroup textarea{resize:vertical;min-height:120px}
.wide-btn{width:100%;text-align:center}
.form-narrow{max-width:640px;margin:0 auto}
.contact-info{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.contact-info div{display:flex;justify-content:space-between;font-size:.92rem;border-bottom:1px solid var(--line);padding-bottom:10px}
.contact-info span{color:var(--muted)}
/* Messages */
.msg{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px 26px;margin-bottom:16px}
.msg .mtop{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.msg .mtop b{font-size:1rem}
.msg .mtop small{color:var(--muted)}
.msg .memail{color:var(--teal);font-size:.85rem;font-weight:600;margin-bottom:12px}
.msg p{color:var(--muted);font-size:.94rem;line-height:1.6}
@media (max-width:860px){.profile{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav class="navbar">
    <a class="brand" href="/">Hustle<span>Hub</span></a>
    <ul class="nav-links">
        <li><a href="/">Home</a></li>
        ${rightNav}
    </ul>
</nav>
${body}
<footer>© 2026 HustleHub. All rights reserved.</footer>
</body>
</html>`;
}

function statusPage(res, code, icon, title, message, actions, user) {
    res.writeHead(code, { 'Content-Type': 'text/html' });
    res.end(page(title, `
<div class="center"><div class="panel">
    <div class="mark">${icon}</div>
    <h1>${esc(title)}</h1>
    <p>${esc(message)}</p>
    ${actions}
</div></div>`, user));
}

function skillTags(skills, limit) {
    const tags = String(skills || '').split(',').map(s => s.trim()).filter(Boolean);
    return (limit ? tags.slice(0, limit) : tags).map(s => `<span>${esc(s)}</span>`).join('');
}

function freelancerCards(freelancers) {
    return freelancers.map(f => {
        const initial = esc((f.name || '?').trim().charAt(0).toUpperCase());
        return `
<a class="tcard" href="/freelancer/${f._id}">
    <div class="avatar">${initial}</div>
    <h3>${esc(f.name)}</h3>
    <div class="loc">${esc(f.location || '—')}${f.state ? ' · ' + esc(f.state) : ''}</div>
    <div class="skills">${skillTags(f.skills, 4) || '<span>General</span>'}</div>
    <div class="meta">
        <div><b>$${esc(f.hourly_rate || '—')}</b>/hr</div>
        <div><b>${esc(String(f.experience || '0').match(/\d+/)?.[0] ?? '0')}</b> yrs exp</div>
    </div>
    <div class="viewp">View profile →</div>
</a>`;
    }).join('');
}

function jobCards(jobs) {
    return jobs.map(j => `
<a class="jcard" href="/job/${j._id}">
    <div class="jtop"><h3>${esc(j.title)}</h3><span class="budget">${esc(j.budget)}</span></div>
    <div class="client">Posted by ${esc(j.clientName)} · ${esc(j.location || 'Remote')}</div>
    <div class="desc">${esc(j.description)}</div>
    <div class="skills">${skillTags(j.skills, 4) || '<span>General</span>'}</div>
    <div class="meta"><span>${fmtDate(j.createdAt)}</span><span style="color:var(--teal);font-weight:700">View & apply →</span></div>
</a>`).join('');
}

// ---------- Static files ----------

const STATIC_EXT = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(__dirname, safe);
    const ext = path.extname(filePath).toLowerCase();

    if (!filePath.startsWith(__dirname) || !STATIC_EXT[ext] || !fs.existsSync(filePath)) {
        return false;
    }
    res.writeHead(200, { 'Content-Type': STATIC_EXT[ext] });
    fs.createReadStream(filePath).pipe(res);
    return true;
}

// ---------- Auth / signup ----------

async function handleSignupF(req, res) {
    const formdata = await readBody(req);
    const newFreelancer = await Freelancer.create({
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
    const user = { id: String(newFreelancer._id), type: 'freelancer', name: newFreelancer.name, email: newFreelancer.email };
    createSession(res, user);
    statusPage(res, 200, '🎉', 'Welcome aboard!',
        'Your freelancer profile is live and you are signed in. Start browsing jobs that match your skills.',
        `<a class="btn" href="/jobs">Find jobs</a><a class="btn ghost" href="/freelancer/${newFreelancer._id}">My profile</a>`, user);
}

async function handleSignupJ(req, res) {
    const formdata = await readBody(req);
    const newJobAssigner = await JobAssigner.create({
        name: formdata.get('fullname'),
        email: formdata.get('email'),
        password: formdata.get('password'),
    });
    const user = { id: String(newJobAssigner._id), type: 'client', name: newJobAssigner.name, email: newJobAssigner.email };
    createSession(res, user);
    statusPage(res, 200, '🤝', 'Account created!',
        'Your client account is ready and you are signed in. Post a job or browse freelancers.',
        `<a class="btn" href="/postjob">Post a job</a><a class="btn ghost" href="/view">Browse talent</a>`, user);
}

async function handleLogin(req, res) {
    const formdata = await readBody(req);
    const username = formdata.get('username') || '';
    const password = formdata.get('password') || '';

    let account = await Freelancer.findOne({ $or: [{ email: username }, { name: username }], password });
    let type = 'freelancer';
    if (!account) {
        account = await JobAssigner.findOne({ $or: [{ email: username }, { name: username }], password });
        type = 'client';
    }

    if (!account) {
        return statusPage(res, 401, '🔒', 'Sign in failed',
            'No account matches that username/email and password. Please check your details and try again.',
            `<a class="btn" href="/signin.html">Try again</a><a class="btn ghost" href="/signup.html">Create account</a>`);
    }

    const user = { id: String(account._id), type, name: account.name, email: account.email };
    createSession(res, user);
    // Freelancers land on the job board; clients land on the talent directory
    redirect(res, type === 'freelancer' ? '/jobs' : '/view');
}

// ---------- Freelancer directory (client-facing) ----------

async function handleView(req, res, user) {
    const query = new URLSearchParams(req.url.split('?')[1] || '').get('query') || '';
    const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const freelancers = await Freelancer.find(query ? { $or: [{ skills: rx }, { name: rx }, { location: rx }] } : {});
    const body = `
<main>
    <h1>Meet our <span>talent</span></h1>
    <p class="sub">${query ? `${freelancers.length} match${freelancers.length === 1 ? '' : 'es'} for “${esc(query)}”.` : `${freelancers.length} freelancer${freelancers.length === 1 ? '' : 's'} ready to work on your next project.`}</p>
    <form class="searchbar" action="/view" method="GET">
        <input type="text" name="query" value="${esc(query)}" placeholder="Search by skill, name, or location…">
        <button type="submit">Search</button>
    </form>
    ${freelancers.length
        ? `<div class="grid">${freelancerCards(freelancers)}</div>`
        : `<div class="empty">No freelancers match that search yet.</div>`}
</main>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('Browse Talent', body, user));
}

async function handleProfile(req, res, id, user) {
    if (!mongoose.isValidObjectId(id)) return notFound(res, user);
    const f = await Freelancer.findById(id);
    if (!f) return notFound(res, user);

    const initial = esc((f.name || '?').trim().charAt(0).toUpperCase());
    const years = esc(String(f.experience || '0').match(/\d+/)?.[0] ?? '0');

    const contactPanel = user
        ? `
<div class="pcard">
    <div class="sec-label">Contact details</div>
    <div class="contact-info">
        <div><span>Email</span><b>${esc(f.email || '—')}</b></div>
        <div><span>Mobile</span><b>${esc(f.mobile || '—')}</b></div>
    </div>
    <div class="sec-label">Send a hire request</div>
    <form action="/contact/${f._id}" method="POST">
        <div class="fgroup">
            <label>Your name</label>
            <input type="text" value="${esc(user.name)}" readonly>
        </div>
        <div class="fgroup">
            <label>Your email</label>
            <input type="text" value="${esc(user.email)}" readonly>
        </div>
        <div class="fgroup">
            <label for="message">Message</label>
            <textarea id="message" name="message" placeholder="Hi ${esc(f.name.split(' ')[0])}, I'd like to hire you for…" required></textarea>
        </div>
        <button class="btn wide-btn" type="submit">Send hire request</button>
    </form>
</div>`
        : `
<div class="pcard" style="text-align:center">
    <div class="sec-label">Want to hire ${esc(f.name.split(' ')[0])}?</div>
    <p style="color:var(--muted);font-size:.94rem;margin-bottom:22px">Sign in or create a free account to see contact details and send a hire request.</p>
    <a class="btn" href="/signin.html">Sign in</a>
    <a class="btn ghost" href="/signup.html">Join now</a>
</div>`;

    const body = `
<main>
    <div class="profile">
        <div class="pcard">
            <div class="phead">
                <div class="avatar">${initial}</div>
                <div>
                    <h2>${esc(f.name)}</h2>
                    <div class="loc">${esc(f.location || '—')}${f.state ? ' · ' + esc(f.state) : ''}</div>
                </div>
            </div>
            <div class="facts">
                <div class="fact"><small>Rate</small><b>$${esc(f.hourly_rate || '—')}/hr</b></div>
                <div class="fact"><small>Experience</small><b>${years} yrs</b></div>
                <div class="fact"><small>Age</small><b>${esc(f.age ?? '—')}</b></div>
                <div class="fact"><small>Gender</small><b>${esc(f.gender || '—')}</b></div>
            </div>
            <div class="sec-label">Skills</div>
            <div class="skills-full">${skillTags(f.skills) || '<span>General</span>'}</div>
        </div>
        ${contactPanel}
    </div>
</main>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(f.name, body, user));
}

async function handleContact(req, res, id, user) {
    if (!user) return redirect(res, '/signin.html');
    if (!mongoose.isValidObjectId(id)) return notFound(res, user);
    const f = await Freelancer.findById(id);
    if (!f) return notFound(res, user);

    const formdata = await readBody(req);
    const message = (formdata.get('message') || '').trim();
    if (!message) return redirect(res, `/freelancer/${id}`);

    await HireRequest.create({
        freelancer: f._id,
        freelancerName: f.name,
        fromId: user.id,
        fromType: user.type,
        fromName: user.name,
        fromEmail: user.email,
        message,
    });

    statusPage(res, 200, '✉️', 'Hire request sent!',
        `Your message was delivered to ${f.name}. They can reply to you at ${user.email}.`,
        `<a class="btn" href="/view">Browse more talent</a><a class="btn ghost" href="/messages">My messages</a>`, user);
}

// ---------- Job board (freelancer-facing) ----------

async function handleJobs(req, res, user) {
    const query = new URLSearchParams(req.url.split('?')[1] || '').get('query') || '';
    const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const jobs = await Job.find(query ? { $or: [{ title: rx }, { skills: rx }, { description: rx }, { location: rx }] } : {}).sort({ createdAt: -1 });
    const body = `
<main>
    <h1>Find your next <span>gig</span></h1>
    <p class="sub">${query ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} matching “${esc(query)}”.` : `${jobs.length} open job${jobs.length === 1 ? '' : 's'} posted by clients. Search by skill, title, or location.`}</p>
    <form class="searchbar" action="/jobs" method="GET">
        <input type="text" name="query" value="${esc(query)}" placeholder="Try “design”, “video editing”, “remote”…">
        <button type="submit">Search</button>
    </form>
    ${jobs.length
        ? `<div class="grid">${jobCards(jobs)}</div>`
        : `<div class="empty">No jobs match that search yet.${user && user.type === 'client' ? ` <a class="btn" style="margin-left:10px" href="/postjob">Post the first one</a>` : ''}</div>`}
</main>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('Find Jobs', body, user));
}

async function handleJobDetail(req, res, id, user) {
    if (!mongoose.isValidObjectId(id)) return notFound(res, user);
    const j = await Job.findById(id);
    if (!j) return notFound(res, user);

    let sidePanel;
    if (user && user.type === 'freelancer') {
        const already = await Application.findOne({ job: j._id, freelancerId: user.id });
        sidePanel = already
            ? `
<div class="pcard" style="text-align:center">
    <div class="sec-label">Application sent</div>
    <p style="color:var(--muted);font-size:.94rem;margin-bottom:22px">You applied to this job on ${fmtDate(already.createdAt)}. ${esc(j.clientName)} can reach you at ${esc(user.email)}.</p>
    <a class="btn" href="/jobs">Browse more jobs</a>
</div>`
            : `
<div class="pcard">
    <div class="sec-label">Apply for this job</div>
    <form action="/apply/${j._id}" method="POST">
        <div class="fgroup">
            <label>Your name</label>
            <input type="text" value="${esc(user.name)}" readonly>
        </div>
        <div class="fgroup">
            <label>Your email</label>
            <input type="text" value="${esc(user.email)}" readonly>
        </div>
        <div class="fgroup">
            <label for="message">Cover message</label>
            <textarea id="message" name="message" placeholder="Hi ${esc(j.clientName.split(' ')[0])}, I'm a great fit for this because…" required></textarea>
        </div>
        <button class="btn wide-btn" type="submit">Submit application</button>
    </form>
</div>`;
    } else if (user && user.id === j.clientId) {
        const applications = await Application.find({ job: j._id }).sort({ createdAt: -1 });
        sidePanel = `
<div class="pcard">
    <div class="sec-label">Applicants (${applications.length})</div>
    ${applications.length
        ? applications.map(a => `
    <div class="msg" style="padding:18px 20px">
        <div class="mtop"><b>${esc(a.freelancerName)}</b><small>${fmtDate(a.createdAt)}</small></div>
        <div class="memail">${esc(a.freelancerEmail)}</div>
        <p>${esc(a.message)}</p>
        <a class="btn ghost" style="margin:12px 0 0" href="/freelancer/${a.freelancerId}">View profile</a>
    </div>`).join('')
        : `<p style="color:var(--muted);font-size:.94rem">No applications yet — check back soon.</p>`}
</div>`;
    } else if (user) {
        sidePanel = `
<div class="pcard" style="text-align:center">
    <div class="sec-label">Client account</div>
    <p style="color:var(--muted);font-size:.94rem;margin-bottom:22px">Only freelancers can apply to jobs. Browse talent to hire for your own projects instead.</p>
    <a class="btn" href="/view">Browse talent</a>
</div>`;
    } else {
        sidePanel = `
<div class="pcard" style="text-align:center">
    <div class="sec-label">Interested in this job?</div>
    <p style="color:var(--muted);font-size:.94rem;margin-bottom:22px">Sign in with a freelancer account to apply.</p>
    <a class="btn" href="/signin.html">Sign in</a>
    <a class="btn ghost" href="/signupf.html">Join as freelancer</a>
</div>`;
    }

    const body = `
<main>
    <div class="profile">
        <div class="pcard">
            <div class="sec-label">Job · posted ${fmtDate(j.createdAt)}</div>
            <h1 style="margin-bottom:6px">${esc(j.title)}</h1>
            <div class="loc" style="color:var(--muted);margin-bottom:24px">Posted by <b style="color:var(--ink)">${esc(j.clientName)}</b> · ${esc(j.location || 'Remote')}</div>
            <div class="facts">
                <div class="fact"><small>Budget</small><b>${esc(j.budget)}</b></div>
                <div class="fact"><small>Location</small><b>${esc(j.location || 'Remote')}</b></div>
            </div>
            <div class="sec-label">Description</div>
            <div class="longtext">${esc(j.description)}</div>
            <div class="sec-label">Skills required</div>
            <div class="skills-full">${skillTags(j.skills) || '<span>General</span>'}</div>
        </div>
        ${sidePanel}
    </div>
</main>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(j.title, body, user));
}

async function handlePostJobForm(req, res, user) {
    if (!user) return redirect(res, '/signin.html');
    if (user.type !== 'client') {
        return statusPage(res, 403, '🚫', 'Clients only',
            'Only client accounts can post jobs. Sign in with a client account, or browse open jobs instead.',
            `<a class="btn" href="/jobs">Browse jobs</a><a class="btn ghost" href="/signupj.html">Create client account</a>`, user);
    }
    const body = `
<main>
    <div class="form-narrow">
        <h1>Post a <span>job</span></h1>
        <p class="sub">Describe what you need and let freelancers come to you.</p>
        <div class="pcard">
            <form action="/jobs" method="POST">
                <div class="fgroup">
                    <label for="title">Job title</label>
                    <input type="text" id="title" name="title" placeholder="e.g. Landing page designer for SaaS startup" required>
                </div>
                <div class="fgroup">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" placeholder="What does the project involve? What are the deliverables and timeline?" required></textarea>
                </div>
                <div class="fgroup">
                    <label for="skills">Skills required (comma-separated)</label>
                    <input type="text" id="skills" name="skills" placeholder="UI Design, Figma, Webflow" required>
                </div>
                <div class="fgroup">
                    <label for="budget">Budget</label>
                    <input type="text" id="budget" name="budget" placeholder="$40/hr or $500 fixed" required>
                </div>
                <div class="fgroup">
                    <label for="location">Location</label>
                    <input type="text" id="location" name="location" placeholder="Remote" value="Remote">
                </div>
                <button class="btn wide-btn" type="submit">Publish job</button>
            </form>
        </div>
    </div>
</main>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('Post a Job', body, user));
}

async function handleCreateJob(req, res, user) {
    if (!user || user.type !== 'client') return redirect(res, '/signin.html');
    const formdata = await readBody(req);
    const title = (formdata.get('title') || '').trim();
    const description = (formdata.get('description') || '').trim();
    if (!title || !description) return redirect(res, '/postjob');

    const job = await Job.create({
        title,
        description,
        skills: formdata.get('skills'),
        budget: formdata.get('budget'),
        location: formdata.get('location') || 'Remote',
        clientId: user.id,
        clientName: user.name,
    });
    statusPage(res, 200, '📢', 'Job published!',
        `“${title}” is now live on the job board. Applications will appear on the job page and in your messages.`,
        `<a class="btn" href="/job/${job._id}">View job</a><a class="btn ghost" href="/jobs">Job board</a>`, user);
}

async function handleApply(req, res, id, user) {
    if (!user) return redirect(res, '/signin.html');
    if (user.type !== 'freelancer') {
        return statusPage(res, 403, '🚫', 'Freelancers only',
            'Only freelancer accounts can apply to jobs.',
            `<a class="btn" href="/view">Browse talent instead</a>`, user);
    }
    if (!mongoose.isValidObjectId(id)) return notFound(res, user);
    const j = await Job.findById(id);
    if (!j) return notFound(res, user);

    const formdata = await readBody(req);
    const message = (formdata.get('message') || '').trim();
    if (!message) return redirect(res, `/job/${id}`);

    const already = await Application.findOne({ job: j._id, freelancerId: user.id });
    if (!already) {
        await Application.create({
            job: j._id,
            jobTitle: j.title,
            clientId: j.clientId,
            freelancerId: user.id,
            freelancerName: user.name,
            freelancerEmail: user.email,
            message,
        });
    }

    statusPage(res, 200, '🚀', 'Application sent!',
        `Your application for “${j.title}” was delivered to ${j.clientName}. They can reach you at ${user.email}.`,
        `<a class="btn" href="/jobs">Browse more jobs</a><a class="btn ghost" href="/messages">My messages</a>`, user);
}

// ---------- Messages ----------

async function handleMessages(req, res, user) {
    if (!user) return redirect(res, '/signin.html');

    let sections = '';

    if (user.type === 'freelancer') {
        const received = await HireRequest.find({ freelancer: user.id }).sort({ createdAt: -1 });
        const applied = await Application.find({ freelancerId: user.id }).sort({ createdAt: -1 });

        sections += `<div class="sec-label">Hire requests received</div>`;
        sections += received.length
            ? received.map(m => `
<div class="msg">
    <div class="mtop"><b>${esc(m.fromName)} <small>(${esc(m.fromType)})</small></b><small>${fmtDate(m.createdAt)}</small></div>
    <div class="memail">${esc(m.fromEmail)}</div>
    <p>${esc(m.message)}</p>
</div>`).join('')
            : `<div class="empty">No hire requests yet — they'll appear here when a client contacts you.</div>`;

        sections += `<div style="height:34px"></div><div class="sec-label">Jobs you applied to</div>`;
        sections += applied.length
            ? applied.map(a => `
<div class="msg">
    <div class="mtop"><b><a href="/job/${a.job}" style="color:var(--ink);text-decoration:none">${esc(a.jobTitle)}</a></b><small>${fmtDate(a.createdAt)}</small></div>
    <p>${esc(a.message)}</p>
</div>`).join('')
            : `<div class="empty">You haven't applied to any jobs yet. <a class="btn" style="margin-left:10px" href="/jobs">Find jobs</a></div>`;
    } else {
        const applications = await Application.find({ clientId: user.id }).sort({ createdAt: -1 });
        const sentRequests = await HireRequest.find({ fromId: user.id }).sort({ createdAt: -1 });

        sections += `<div class="sec-label">Applications to your jobs</div>`;
        sections += applications.length
            ? applications.map(a => `
<div class="msg">
    <div class="mtop"><b>${esc(a.freelancerName)} → ${esc(a.jobTitle)}</b><small>${fmtDate(a.createdAt)}</small></div>
    <div class="memail">${esc(a.freelancerEmail)}</div>
    <p>${esc(a.message)}</p>
    <a class="btn ghost" style="margin:12px 0 0" href="/freelancer/${a.freelancerId}">View profile</a>
</div>`).join('')
            : `<div class="empty">No applications yet. <a class="btn" style="margin-left:10px" href="/postjob">Post a job</a></div>`;

        sections += `<div style="height:34px"></div><div class="sec-label">Hire requests you sent</div>`;
        sections += sentRequests.length
            ? sentRequests.map(m => `
<div class="msg">
    <div class="mtop"><b>To: ${esc(m.freelancerName)}</b><small>${fmtDate(m.createdAt)}</small></div>
    <p>${esc(m.message)}</p>
</div>`).join('')
            : `<div class="empty">You haven't contacted any freelancers yet. <a class="btn" style="margin-left:10px" href="/view">Browse talent</a></div>`;
    }

    const body = `
<main>
    <h1>Your <span>messages</span></h1>
    <p class="sub">Signed in as ${esc(user.name)} (${esc(user.type)}).</p>
    ${sections}
</main>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page('Messages', body, user));
}

function notFound(res, user) {
    statusPage(res, 404, '🧭', 'Page not found',
        "The page you're looking for doesn't exist or has moved.",
        `<a class="btn" href="/">Back home</a><a class="btn ghost" href="/jobs">Browse jobs</a>`, user);
}

// ---------- Server ----------

const server = http.createServer(function (req, res) {
    const [route] = req.url.split('?');
    const user = getUser(req);

    const respond = promise => promise.catch(err => {
        console.error('SERVER ERROR:', err);
        statusPage(res, 500, '⚠️', 'Something went wrong',
            'An unexpected error occurred. Please try again in a moment.',
            `<a class="btn" href="/">Home</a>`, user);
    });

    const profileMatch = route.match(/^\/freelancer\/([a-f0-9]+)$/i);
    const contactMatch = route.match(/^\/contact\/([a-f0-9]+)$/i);
    const jobMatch = route.match(/^\/job\/([a-f0-9]+)$/i);
    const applyMatch = route.match(/^\/apply\/([a-f0-9]+)$/i);

    if (route === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(__dirname, 'first.html')).pipe(res);
    } else if (route === '/signupf' && req.method === 'POST') {
        respond(handleSignupF(req, res));
    } else if (route === '/signupj' && req.method === 'POST') {
        respond(handleSignupJ(req, res));
    } else if (route === '/login' && req.method === 'POST') {
        respond(handleLogin(req, res));
    } else if (route === '/logout' && req.method === 'GET') {
        destroySession(req, res);
        redirect(res, '/');
    } else if (profileMatch && req.method === 'GET') {
        respond(handleProfile(req, res, profileMatch[1], user));
    } else if (contactMatch && req.method === 'POST') {
        respond(handleContact(req, res, contactMatch[1], user));
    } else if (jobMatch && req.method === 'GET') {
        respond(handleJobDetail(req, res, jobMatch[1], user));
    } else if (applyMatch && req.method === 'POST') {
        respond(handleApply(req, res, applyMatch[1], user));
    } else if (route === '/jobs' && req.method === 'GET') {
        respond(handleJobs(req, res, user));
    } else if (route === '/jobs' && req.method === 'POST') {
        respond(handleCreateJob(req, res, user));
    } else if (route === '/postjob' && req.method === 'GET') {
        respond(handlePostJobForm(req, res, user));
    } else if (route === '/messages' && req.method === 'GET') {
        respond(handleMessages(req, res, user));
    } else if (route === '/view' && req.method === 'GET') {
        respond(handleView(req, res, user));
    } else if (route === '/search' && req.method === 'GET') {
        // Legacy landing-page search → talent directory
        redirect(res, '/view' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : ''));
    } else if (req.method === 'GET' && serveStatic(req, res)) {
        // static file served
    } else {
        notFound(res, user);
    }
});

server.listen(3000, function () {
    console.log('Server started at http://127.0.0.1:3000');
});
