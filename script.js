// Initialize Appwrite SDK
const { Client, Account, Databases, Storage, ID } = Appwrite;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('6ad7e4d6003c3d578dd6'); 

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = '6ad7e4f8000773fc5f89';       
const COLLECTION_ID = 'events';                   
const BUCKET_ID = 'event-images'; 

// --- ROUTE PROTECTION CHECK (Events page requires login) ---
const currentPage = window.location.pathname.split('/').pop();

if (currentPage === 'events.html') {
    window.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('events-container');
        const authWarning = document.getElementById('auth-warning');
        try {
            await account.get(); 
            // Authenticated: load events
            loadEvents();
        } catch (error) {
            // Not authenticated: Show clear fallback warning instead of blank page
            if (container) container.style.display = 'none';
            if (authWarning) authWarning.style.display = 'block';
        }
    });
}

// --- ADMIN GATE PROTECTION (`admin123`) ---
document.addEventListener('DOMContentLoaded', () => {
    const adminGate = document.getElementById('admin-gate');
    const adminContent = document.getElementById('admin-content');
    const adminPassForm = document.getElementById('admin-pass-form');

    if (adminPassForm) {
        adminPassForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passcode = document.getElementById('admin-passcode').value;
            if (passcode === 'admin123') {
                if (adminGate) adminGate.style.display = 'none';
                if (adminContent) adminContent.style.display = 'block';
                loadAdminEvents();
            } else {
                alert('Incorrect passcode! Access denied.');
            }
        });
    }
});


// --- AUTHENTICATION & FORM SWITCHING ---
document.addEventListener('DOMContentLoaded', () => {
    const showSignup = document.getElementById('show-signup');
    const showSignin = document.getElementById('show-signin');
    const signinSection = document.getElementById('signin-section');
    const signupSection = document.getElementById('signup-section');

    if (showSignup && showSignin && signinSection && signupSection) {
        showSignup.onclick = function(e) {
            e.preventDefault();
            signinSection.style.display = 'none';
            signupSection.style.display = 'block';
        };

        showSignin.onclick = function(e) {
            e.preventDefault();
            signupSection.style.display = 'none';
            signinSection.style.display = 'block';
        };
    }
});

// Register User (Enforcing @students.nust.ac.zw format)
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        // Strict email domain verification
        if (!email.toLowerCase().endsWith('@students.nust.ac.zw')) {
            alert('Registration Error: You must register using a valid NUST student email format ending with @students.nust.ac.zw');
            return;
        }

        try {
            await account.create(ID.unique(), email, password, name);
            await account.createEmailPasswordSession(email, password);
            alert('Account created successfully! Welcome to NUST Events.');
            window.location.href = 'events.html';
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });
}

// Sign In User
const signinForm = document.getElementById('signin-form');
if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        if (!email.toLowerCase().endsWith('@students.nust.ac.zw')) {
            alert('Login Error: Please use your @students.nust.ac.zw student email address.');
            return;
        }

        try {
            await account.createEmailPasswordSession(email, password);
            alert('Signed in successfully!');
            window.location.href = 'events.html';
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
}

// Session Check on Login Page
window.addEventListener('DOMContentLoaded', async () => {
    const signinSection = document.getElementById('signin-section');
    const signupSection = document.getElementById('signup-section');
    const userProfile = document.getElementById('user-profile');

    try {
        const user = await account.get();
        if (signinSection && signupSection && userProfile) {
            signinSection.style.display = 'none';
            signupSection.style.display = 'none';
            userProfile.style.display = 'block';
            document.getElementById('profile-name').innerText = user.name;
        }
    } catch (error) {
        // Not logged in
    }
});

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await account.deleteSession('current');
            alert('Signed out successfully.');
            window.location.href = 'index.html';
        } catch (error) {
            alert('Logout error: ' + error.message);
        }
    });
};


// --- DATABASE & STORAGE CRUD LOGIC ---

function formatDate(dateString) {
    if (!dateString) return 'TBA';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Seed Dummy Data if Database is Empty
async function seedDummyDataIfEmpty(events) {
    if (events.length > 0) return; 

    const dummyEvents = [
        {
            title: "NUST Annual Tech Hackathon 2026",
            category: "Tech / Innovation",
            date: new Date(Date.now() + 86400000 * 3).toISOString(),
            location: "Computer Science Lab 1",
            description: "Join fellow developers to build localized software solutions and win exciting prizes.",
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80"
        },
        {
            title: "AI & Machine Learning Seminar",
            category: "Academic",
            date: new Date(Date.now() + 86400000 * 7).toISOString(),
            location: "Main Auditorium",
            description: "An intensive seminar exploring modern neural networks and AI applications in Africa.",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80"
        },
        {
            title: "NUST SRC Welcome Music Jam",
            category: "Social",
            date: new Date(Date.now() + 86400000 * 12).toISOString(),
            location: "University Student Square",
            description: "Unwind after classes with live performances, games, and food stalls.",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80"
        },
        {
            title: "Inter-Faculty Basketball Championship",
            category: "Sports",
            date: new Date(Date.now() + 86400000 * 15).toISOString(),
            location: "NUST Sports Arena",
            description: "Come support the Computer Science and Engineering teams as they battle for the trophy.",
            image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80"
        },
        {
            title: "Career & Internship Expo 2026",
            category: "Career",
            date: new Date(Date.now() + 86400000 * 20).toISOString(),
            location: "Great Hall",
            description: "Network with top corporate tech firms, banks, and engineering enterprises looking for interns.",
            image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80"
        },
        {
            title: "Cybersecurity Capture The Flag (CTF)",
            category: "Tech / Competitions",
            date: new Date(Date.now() + 86400000 * 25).toISOString(),
            location: "Network Lab 3",
            description: "Test your ethical hacking and vulnerability assessment skills in this fast-paced competition.",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80"
        }
    ];

    try {
        for (let item of dummyEvents) {
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), item);
        }
        window.location.reload(); 
    } catch (e) {
        console.error("Auto-seeding error:", e);
    }
}

// Fetch & Display Events (On events.html)
async function loadEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        let events = response.documents;

        if (events.length === 0) {
            await seedDummyDataIfEmpty(events);
            return;
        }

        container.innerHTML = '';
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <img src="${event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80'}" alt="${event.title} event banner" loading="lazy">
                <span class="event-category">${event.category}</span>
                <h3>${event.title}</h3>
                <p class="event-date">📅 ${formatDate(event.date)}</p>
                <p class="event-location">📍 ${event.location}</p>
                <p class="event-desc">${event.description}</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
}

// Create Event with Gallery File Upload & Date Validation (Admin Page)
const eventForm = document.getElementById('event-form');
if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('event-title').value;
        const category = document.getElementById('event-category').value;
        const dateInput = document.getElementById('event-date').value;
        const location = document.getElementById('event-location').value;
        const description = document.getElementById('event-desc').value;
        const imageFile = document.getElementById('event-image-file').files[0];

        // Form Validation: Ensure date is not in the past
        const selectedDate = new Date(dateInput);
        if (selectedDate < new Date()) {
            alert('Validation Error: Event date cannot be set in the past.');
            return;
        }

        const formattedDate = selectedDate.toISOString();

        try {
            // 1. Upload image file to Appwrite Storage Bucket
            const uploadedFile = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                imageFile
            );

            // 2. Get the public file view URL from Appwrite Storage
            const imageUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);

            // 3. Save event document along with the image URL to the database
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                title, 
                category, 
                date: formattedDate, 
                location, 
                description, 
                image: imageUrl
            });

            alert('Event and gallery image published successfully!');
            eventForm.reset();
            loadAdminEvents();
        } catch (error) {
            alert('Failed to publish: ' + error.message);
        }
    });
}

// Load & Delete Events (Admin Management View)
async function loadAdminEvents() {
    const container = document.getElementById('admin-events-container');
    if (!container) return;

    try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        const events = response.documents;

        container.innerHTML = events.length === 0 ? '<p>No events available to manage.</p>' : '';
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <span class="event-category">${event.category}</span>
                <h3>${event.title}</h3>
                <p class="event-date">📅 ${formatDate(event.date)}</p>
                <div style="padding: 1rem 1.2rem;">
                    <button class="delete-btn" onclick="deleteEvent('${event.$id}')">Delete Event</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading admin view:', error);
    }
}

// Delete Function (CRUD - Delete)
window.deleteEvent = async function(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
        alert('Event deleted successfully.');
        loadAdminEvents();
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
}