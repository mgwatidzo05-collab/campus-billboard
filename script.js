// Default Sample Event Data (8 Events)
const defaultEvents = [
    {
        id: 1,
        title: "Annual Tech Hackathon 2026",
        category: "Academic",
        date: "2026-11-10",
        location: "Computer Lab 3, Science Block",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        description: "Join fellow students for 12 hours of coding, innovation, and pizza! Prizes to be won. Bring your laptops, chargers, and plenty of creative energy. Mentors will be available throughout the day to help debug code, brainstorm architectural ideas, and guide teams from start to finish."
    },
    {
        id: 2,
        title: "Inter-Faculty Football Finals",
        category: "Sports",
        date: "2026-11-14",
        location: "Main Sports Complex Field",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
        description: "Come support Computer Science as they face Engineering in the final match of the season. Food trucks, live student commentary, and refreshing drinks will be available at the sidelines. Let's bring home the faculty trophy and show our team spirit!"
    },
    {
        id: 3,
        title: "Welcome Freshers Social Mixer",
        category: "Social",
        date: "2026-11-18",
        location: "Student Union Building",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
        description: "Meet new friends, enjoy great music from our student DJ guild, and grab some free snacks at our welcome party. A fantastic opportunity to connect with senior students, learn about campus clubs, and unwind after classes."
    },
    {
        id: 4,
        title: "Resume & LinkedIn Masterclass",
        category: "Workshops",
        date: "2026-11-22",
        location: "Auditorium Hall B",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
        description: "Learn how to build an industry-ready resume and optimize your LinkedIn profile from career experts and alumni recruiters. Bring your current resume on a flash drive or laptop for live one-on-one critique sessions and optimization tips."
    },
    {
        id: 5,
        title: "AI & Machine Learning Seminar",
        category: "Academic",
        date: "2026-11-25",
        location: "Lecture Theatre 1",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
        description: "Explore the fundamentals of modern Artificial Intelligence and Large Language Models. Guest speaker Dr. Elena Vance will discuss ethical considerations in AI development and career pathways in data science."
    },
    {
        id: 6,
        title: "Campus Open Mic & Acoustic Night",
        category: "Social",
        date: "2026-12-02",
        location: "University Coffee Lounge",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        description: "Show off your musical talents, poetry readings, or stand-up comedy routines! Sign-ups begin at 5:00 PM at the venue. Hot chocolate and pastries will be served."
    },
    {
        id: 7,
        title: "Inter-Hall Basketball Tournament",
        category: "Sports",
        date: "2026-12-08",
        location: "Indoor Gymnasium",
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
        description: "Cheer on your residence hall teams as they battle it out for the inter-hall basketball championship cup. Free entry and noisy noisemakers encouraged!"
    },
    {
        id: 8,
        title: "UI/UX Design Systems Workshop",
        category: "Workshops",
        date: "2026-12-15",
        location: "Design Lab 2",
        image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80",
        description: "Learn how to build scalable design systems in Figma. We will cover component states, auto-layout best practices, and tokens for modern web and mobile developers."
    }
];

// --- LOAD & AUTO-EXPIRATION LOGIC ---
let rawEvents = JSON.parse(localStorage.getItem('campusEvents'));

if (!rawEvents) {
    rawEvents = defaultEvents;
    localStorage.setItem('campusEvents', JSON.stringify(defaultEvents));
}

const today = new Date();
today.setHours(0, 0, 0, 0);

let events = rawEvents.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
});

localStorage.setItem('campusEvents', JSON.stringify(events));


// --- AUTO-INJECT MODAL HTML ---
if (!document.getElementById('event-modal')) {
    const modalHTML = `
        <div id="event-modal" class="modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; padding:1rem;">
            <div class="modal-content" style="background:white; padding:2rem; border-radius:12px; max-width:550px; width:100%; max-height:90vh; overflow-y:auto; position:relative; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
                <span class="close-modal" style="position:absolute; top:1rem; right:1.2rem; font-size:1.8rem; cursor:pointer; color:#64748b; font-weight:bold;">&times;</span>
                <div id="modal-body"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}


// --- HOME PAGE LOGIC ---
const eventsContainer = document.getElementById('events-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const dateFilter = document.getElementById('date-filter');

const modal = document.getElementById('event-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = modal.querySelector('.close-modal');

if (eventsContainer) {
    function renderEvents(eventsToDisplay) {
        eventsContainer.innerHTML = '';

        if (eventsToDisplay.length === 0) {
            eventsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No upcoming events found.</p>';
            return;
        }

        eventsToDisplay.forEach(event => {
            const card = document.createElement('div');
            card.classList.add('event-card');

            let imageHTML = event.image ? `<img src="${event.image}" alt="${event.title}">` : '';

            const formattedDate = new Date(event.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });

            const shortDesc = event.description.length > 80 ? event.description.substring(0, 80) + '...' : event.description;

            card.innerHTML = `
                ${imageHTML}
                <span class="event-category">${event.category}</span>
                <h3>${event.title}</h3>
                <p class="event-date">📅 ${formattedDate}</p>
                <p class="event-location">📍 ${event.location}</p>
                <p class="event-desc">${shortDesc}</p>
                <p style="font-size: 0.85rem; color: #0284c7; margin-top: 0.75rem; font-weight: 600;">Click to read full details &rarr;</p>
            `;

            card.onclick = function() {
                openModal(event);
            };

            eventsContainer.appendChild(card);
        });
    }

    function openModal(event) {
        const formattedDate = new Date(event.date).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

        modalBody.innerHTML = `
            ${event.image ? `<img src="${event.image}" class="modal-img" alt="${event.title}">` : ''}
            <span class="event-category">${event.category}</span>
            <h2 style="margin-top: 0.5rem; color: #0f172a;">${event.title}</h2>
            <p style="font-size: 0.95rem; color: #64748b; margin-top: 0.4rem;">📅 <strong>Date:</strong> ${formattedDate}</p>
            <p style="font-size: 0.95rem; color: #64748b; margin-top: 0.2rem;">📍 <strong>Location:</strong> ${event.location}</p>
            <p style="margin-top: 1rem; line-height: 1.6; color: #334155; white-space: pre-line;">${event.description}</p>
        `;

        modal.style.display = 'flex';
    }

    closeModal.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    function filterEvents() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedDateRange = dateFilter.value;

        const filtered = events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm) || 
                                  event.description.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;

            let matchesDate = true;
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            const diffTime = eventDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (selectedDateRange === 'this-week') {
                matchesDate = diffDays >= 0 && diffDays <= 7;
            } else if (selectedDateRange === 'next-week') {
                matchesDate = diffDays > 7 && diffDays <= 14;
            } else if (selectedDateRange === 'this-month') {
                matchesDate = eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
            } else if (selectedDateRange === 'next-month') {
                const targetMonth = (today.getMonth() + 1) % 12;
                const targetYear = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
                matchesDate = eventDate.getMonth() === targetMonth && eventDate.getFullYear() === targetYear;
            }

            return matchesSearch && matchesCategory && matchesDate;
        });

        renderEvents(filtered);
    }

    searchInput.addEventListener('input', filterEvents);
    categoryFilter.addEventListener('change', filterEvents);
    dateFilter.addEventListener('change', filterEvents);

    renderEvents(events);
}


// --- ADMIN PORTAL LOGIC (`submit.html`) ---
const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const eventForm = document.getElementById('event-form');
const manageEventsContainer = document.getElementById('manage-events-container');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

let editingEventId = null; // Track if we are editing an event

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const passwordInput = document.getElementById('admin-passcode').value;

        if (passwordInput === 'admin123') {
            loginSection.style.display = 'none';
            adminDashboard.style.display = 'block';
            renderManagementList();
        } else {
            alert('Incorrect Admin Password!');
        }
    });
}

function renderManagementList() {
    if (!manageEventsContainer) return;
    manageEventsContainer.innerHTML = '';

    if (events.length === 0) {
        manageEventsContainer.innerHTML = '<p style="color: #64748b;">No events to manage.</p>';
        return;
    }

    events.forEach(event => {
        const item = document.createElement('div');
        item.classList.add('manage-item');

        const formattedDate = new Date(event.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        item.innerHTML = `
            <div class="manage-item-info">
                <h4>${event.title}</h4>
                <p>📅 ${formattedDate} • 📍 ${event.location}</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="edit-btn" onclick="editEvent(${event.id})" style="background-color: #e0f2fe; color: #0369a1; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; cursor: pointer;">Edit</button>
                <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        `;

        manageEventsContainer.appendChild(item);
    });
}

// Function to populate form with event details for editing
window.editEvent = function(id) {
    const eventToEdit = events.find(ev => ev.id === id);
    if (!eventToEdit) return;

    // Fill form fields
    document.getElementById('event-title').value = eventToEdit.title;
    document.getElementById('event-category').value = eventToEdit.category;
    document.getElementById('event-date').value = eventToEdit.date;
    document.getElementById('event-location').value = eventToEdit.location;
    document.getElementById('event-desc').value = eventToEdit.description;

    // Switch state to editing mode
    editingEventId = id;
    submitBtn.innerText = "Update Event";
    cancelBtn.style.display = "block";

    // Scroll smoothly up to the form
    eventForm.scrollIntoView({ behavior: 'smooth' });
};

// Cancel Edit Mode
if (cancelBtn) {
    cancelBtn.onclick = function() {
        editingEventId = null;
        eventForm.reset();
        submitBtn.innerText = "Publish Event";
        cancelBtn.style.display = "none";
    };
}

window.deleteEvent = function(id) {
    if (confirm("Are you sure you want to delete this event?")) {
        events = events.filter(event => event.id !== id);
        localStorage.setItem('campusEvents', JSON.stringify(events));
        renderManagementList();
        alert('Event deleted successfully.');
    }
};

if (eventForm) {
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const imageInput = document.getElementById('event-image');
        const defaultImg = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80";

        function saveEventData(imageUrl) {
            if (editingEventId) {
                // UPDATE EXISTING EVENT
                events = events.map(ev => {
                    if (ev.id === editingEventId) {
                        return {
                            ...ev,
                            title: document.getElementById('event-title').value,
                            category: document.getElementById('event-category').value,
                            date: document.getElementById('event-date').value,
                            location: document.getElementById('event-location').value,
                            // Keep old image if no new file was chosen
                            image: (imageInput.files && imageInput.files[0]) ? imageUrl : ev.image,
                            description: document.getElementById('event-desc').value
                        };
                    }
                    return ev;
                });

                localStorage.setItem('campusEvents', JSON.stringify(events));
                alert('Event updated successfully!');
                
                // Reset editing state
                editingEventId = null;
                submitBtn.innerText = "Publish Event";
                cancelBtn.style.display = "none";
                eventForm.reset();
                renderManagementList();

            } else {
                // CREATE NEW EVENT
                const newEvent = {
                    id: Date.now(),
                    title: document.getElementById('event-title').value,
                    category: document.getElementById('event-category').value,
                    date: document.getElementById('event-date').value,
                    location: document.getElementById('event-location').value,
                    image: imageUrl,
                    description: document.getElementById('event-desc').value
                };

                events.unshift(newEvent);
                localStorage.setItem('campusEvents', JSON.stringify(events));

                alert('Event published successfully!');
                eventForm.reset();
                window.location.href = 'index.html';
            }
        }

        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                saveEventData(uploadEvent.target.result);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            saveEventData(defaultImg);
        }
    });
}