// Seed script — populates the database with sample freelancers and clients.
// Run with: node seed.js
const mongoose = require('mongoose');

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

const freelancers = [
    // Design
    { name: 'Ishita Rao', email: 'ishita.rao@example.com', password: 'pass1234', age: 26, mobile: '9812004501', gender: 'Female', state: 'Karnataka', skills: 'UI Design, Figma, Design Systems', experience: '4', location: 'Bengaluru', hourly_rate: '35' },
    { name: 'Marco Alves', email: 'marco.alves@example.com', password: 'pass1234', age: 31, mobile: '9812004502', gender: 'Male', state: 'Goa', skills: 'Brand Design, Logo Design, Illustration', experience: '7', location: 'Panaji', hourly_rate: '45' },
    { name: 'Sofia Mendes', email: 'sofia.mendes@example.com', password: 'pass1234', age: 24, mobile: '9812004503', gender: 'Female', state: 'Maharashtra', skills: 'UX Research, Wireframing, Prototyping', experience: '2', location: 'Remote', hourly_rate: '28' },

    // Writing
    { name: 'Rohan Kulkarni', email: 'rohan.k@example.com', password: 'pass1234', age: 29, mobile: '9812004504', gender: 'Male', state: 'Maharashtra', skills: 'Copywriting, Blog Writing, SEO Writing', experience: '5', location: 'Pune', hourly_rate: '22' },
    { name: 'Ananya Iyer', email: 'ananya.iyer@example.com', password: 'pass1234', age: 27, mobile: '9812004505', gender: 'Female', state: 'Tamil Nadu', skills: 'Technical Writing, Documentation, Editing', experience: '4', location: 'Chennai', hourly_rate: '30' },
    { name: 'James Whitfield', email: 'james.w@example.com', password: 'pass1234', age: 35, mobile: '9812004506', gender: 'Male', state: 'Kerala', skills: 'Ghostwriting, Storytelling, Scriptwriting', experience: '9', location: 'Remote', hourly_rate: '40' },

    // Marketing
    { name: 'Priyanka Desai', email: 'priyanka.d@example.com', password: 'pass1234', age: 30, mobile: '9812004507', gender: 'Female', state: 'Gujarat', skills: 'Digital Marketing, Google Ads, Analytics', experience: '6', location: 'Ahmedabad', hourly_rate: '32' },
    { name: 'Kabir Singh', email: 'kabir.singh@example.com', password: 'pass1234', age: 25, mobile: '9812004508', gender: 'Male', state: 'Delhi', skills: 'Social Media Marketing, Content Strategy, Instagram Growth', experience: '3', location: 'New Delhi', hourly_rate: '25' },
    { name: 'Elena Petrova', email: 'elena.p@example.com', password: 'pass1234', age: 33, mobile: '9812004509', gender: 'Female', state: 'Goa', skills: 'Email Marketing, SEO, Growth Marketing', experience: '8', location: 'Remote', hourly_rate: '38' },

    // Video
    { name: 'Arjun Nair', email: 'arjun.nair@example.com', password: 'pass1234', age: 28, mobile: '9812004510', gender: 'Male', state: 'Kerala', skills: 'Video Editing, Premiere Pro, Color Grading', experience: '5', location: 'Kochi', hourly_rate: '30' },
    { name: 'Mei Tanaka', email: 'mei.tanaka@example.com', password: 'pass1234', age: 26, mobile: '9812004511', gender: 'Female', state: 'Maharashtra', skills: 'Motion Graphics, After Effects, Animation', experience: '4', location: 'Mumbai', hourly_rate: '36' },
    { name: 'Dev Malhotra', email: 'dev.m@example.com', password: 'pass1234', age: 23, mobile: '9812004512', gender: 'Male', state: 'Punjab', skills: 'Videography, YouTube Editing, Short-form Video', experience: '2', location: 'Chandigarh', hourly_rate: '20' },

    // Other roles
    { name: 'Fatima Sheikh', email: 'fatima.s@example.com', password: 'pass1234', age: 32, mobile: '9812004513', gender: 'Female', state: 'Telangana', skills: 'Data Analysis, Python, Power BI', experience: '6', location: 'Hyderabad', hourly_rate: '42' },
    { name: 'Lucas Fernandes', email: 'lucas.f@example.com', password: 'pass1234', age: 29, mobile: '9812004514', gender: 'Male', state: 'Goa', skills: 'Mobile Development, Flutter, Firebase', experience: '5', location: 'Margao', hourly_rate: '38' },
    { name: 'Grace Okafor', email: 'grace.o@example.com', password: 'pass1234', age: 34, mobile: '9812004515', gender: 'Female', state: 'Karnataka', skills: 'Virtual Assistant, Project Management, Customer Support', experience: '7', location: 'Remote', hourly_rate: '18' },
    { name: 'Vikram Reddy', email: 'vikram.r@example.com', password: 'pass1234', age: 38, mobile: '9812004516', gender: 'Male', state: 'Andhra Pradesh', skills: 'Accounting, Bookkeeping, Tally', experience: '12', location: 'Vijayawada', hourly_rate: '26' },
    { name: 'Natasha Gomes', email: 'natasha.g@example.com', password: 'pass1234', age: 27, mobile: '9812004517', gender: 'Female', state: 'Goa', skills: 'Voice Over, Audio Editing, Podcast Production', experience: '4', location: 'Remote', hourly_rate: '33' },
    { name: 'Harsh Patel', email: 'harsh.p@example.com', password: 'pass1234', age: 24, mobile: '9812004518', gender: 'Male', state: 'Gujarat', skills: 'Web Development, WordPress, Shopify', experience: '3', location: 'Surat', hourly_rate: '24' },
];

const clients = [
    { name: 'Meera Kapoor', email: 'meera@brightlabs.example.com', password: 'pass1234' },
    { name: 'Daniel Costa', email: 'daniel@costa.media.example.com', password: 'pass1234' },
    { name: 'Shreya Bhatt', email: 'shreya@pixelforge.example.com', password: 'pass1234' },
    { name: 'Omar Farouk', email: 'omar@novatech.example.com', password: 'pass1234' },
    { name: 'Rachel Lim', email: 'rachel@limventures.example.com', password: 'pass1234' },
];

// Jobs are matched to their poster by client email at seed time
const jobs = [
    { clientEmail: 'meera@brightlabs.example.com', title: 'Landing page designer for SaaS startup', description: 'We are launching a B2B analytics tool and need a conversion-focused landing page. You will own the design in Figma, including a hero section, feature highlights, pricing table, and mobile layouts. Brand guidelines exist; deliverables in 2 weeks.', skills: 'UI Design, Figma, Web Design', budget: '$40/hr', location: 'Remote' },
    { clientEmail: 'meera@brightlabs.example.com', title: 'Explainer animation for product launch', description: 'Need a 60-90 second animated explainer video for our product launch. Script is ready; you handle storyboarding, motion graphics, and sound sync. Style reference: clean, flat illustration with smooth transitions.', skills: 'Motion Graphics, After Effects, Animation', budget: '$800 fixed', location: 'Remote' },
    { clientEmail: 'shreya@pixelforge.example.com', title: 'Brand identity for coffee startup', description: 'Early-stage specialty coffee brand needs a full identity package: logo, color palette, typography, packaging concepts for two SKUs, and a simple brand book. We love warm, editorial looks over corporate minimalism.', skills: 'Brand Design, Logo Design, Illustration', budget: '$1,200 fixed', location: 'Remote' },
    { clientEmail: 'shreya@pixelforge.example.com', title: 'UX audit and wireframes for mobile app', description: 'Our fitness app has poor onboarding retention. Looking for a UX researcher to audit the current flow, run 5 user interviews, and deliver annotated wireframes for an improved onboarding journey.', skills: 'UX Research, Wireframing, Prototyping', budget: '$35/hr', location: 'Remote' },
    { clientEmail: 'omar@novatech.example.com', title: 'Technical writer for developer docs', description: 'NovaTech is rewriting its API documentation. You will produce quickstart guides, endpoint references, and tutorials for our REST API. Familiarity with developer tooling and Markdown-based doc systems required.', skills: 'Technical Writing, Documentation, API', budget: '$30/hr', location: 'Remote' },
    { clientEmail: 'omar@novatech.example.com', title: 'Power BI dashboard for sales data', description: 'Build an executive dashboard from our sales CRM export: pipeline health, rep performance, and monthly trends. Data cleaning in Python welcome. One-time build with a handover call.', skills: 'Power BI, Data Analysis, Python', budget: '$600 fixed', location: 'Hyderabad or Remote' },
    { clientEmail: 'daniel@costa.media.example.com', title: 'YouTube editor for weekly tech channel', description: 'Ongoing role: edit one 12-15 minute video per week. Fast cuts, motion titles, color grading, and thumbnail collaboration. Raw footage delivered every Monday; final cut due Thursday.', skills: 'Video Editing, Premiere Pro, YouTube', budget: '$25/hr', location: 'Remote' },
    { clientEmail: 'daniel@costa.media.example.com', title: 'Social media manager for media brand', description: 'Manage Instagram and X for a growing media brand: content calendar, daily posts, community engagement, and monthly analytics reports. Bring ideas for short-form video repurposing.', skills: 'Social Media Marketing, Content Strategy, Instagram Growth', budget: '$28/hr', location: 'Remote' },
    { clientEmail: 'rachel@limventures.example.com', title: 'Shopify store setup and theme customization', description: 'Launch a Shopify store for a home-goods brand: theme customization, 30 product uploads, payment and shipping configuration, and basic SEO. Prior Shopify launches a must — share links.', skills: 'Shopify, Web Development, SEO', budget: '$900 fixed', location: 'Remote' },
    { clientEmail: 'rachel@limventures.example.com', title: 'Google Ads specialist for lead generation', description: 'Set up and optimize Google Ads campaigns for a B2B services firm. Deliverables: keyword research, campaign structure, ad copy, conversion tracking, and a weekly optimization retainer.', skills: 'Google Ads, Digital Marketing, Analytics', budget: '$35/hr', location: 'Remote' },
    { clientEmail: 'rachel@limventures.example.com', title: 'Blog writer for finance newsletter', description: 'Write two 1,500-word articles per week on personal finance and investing for a newsletter with 40k subscribers. Clear, jargon-free writing with sourced data. Long-term engagement for the right writer.', skills: 'Blog Writing, Copywriting, SEO Writing, Finance', budget: '$22/hr', location: 'Remote' },
];

async function seed() {
    await mongoose.connect('mongodb://127.0.0.1:27017/project');
    console.log('DATABASE CONNECTED');

    // Skip records whose email already exists so re-running doesn't duplicate
    let addedF = 0;
    for (const f of freelancers) {
        const exists = await Freelancer.findOne({ email: f.email });
        if (!exists) { await Freelancer.create(f); addedF++; }
    }

    let addedC = 0;
    for (const c of clients) {
        const exists = await JobAssigner.findOne({ email: c.email });
        if (!exists) { await JobAssigner.create(c); addedC++; }
    }

    let addedJ = 0;
    for (const j of jobs) {
        const exists = await Job.findOne({ title: j.title });
        if (!exists) {
            const client = await JobAssigner.findOne({ email: j.clientEmail });
            if (!client) continue;
            const { clientEmail, ...jobData } = j;
            await Job.create({ ...jobData, clientId: String(client._id), clientName: client.name });
            addedJ++;
        }
    }

    const totalF = await Freelancer.countDocuments();
    const totalC = await JobAssigner.countDocuments();
    const totalJ = await Job.countDocuments();
    console.log(`Added ${addedF} freelancers (total: ${totalF})`);
    console.log(`Added ${addedC} clients (total: ${totalC})`);
    console.log(`Added ${addedJ} jobs (total: ${totalJ})`);

    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
