import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth,sendPasswordResetEmail, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDm_Fljlgv35w4FuVC-wxM9-jooPmpW_K0",
    authDomain: "xogo-test.firebaseapp.com",
    projectId: "xogo-test",
    storageBucket: "xogo-test.appspot.com",
    messagingSenderId: "1035672669052",
    appId: "1:1035672669052:web:c2a9d42b03acc8ffc8b2f9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to log in user
function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errorMessage = document.getElementById("loginErrorMessage");

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Clear any previous error message
            errorMessage.classList.add('hidden');
            errorMessage.innerText = '';

            // User successfully logged in
            const user = userCredential.user;
            console.log("User logged in:", user);

            // Hide login form and show user data
            document.getElementById("loginUI").classList.add('hidden');
            document.getElementById("userData").classList.remove('hidden');
            document.getElementById("userTasks").classList.remove('hidden');
            document.getElementById("logoutButton").classList.remove('hidden');

            // Fetch user data and tasks
            fetchUserData(user.uid);
            fetchUserTasks(user.uid);
        })
        .catch((error) => {
            // Show error message if login fails
            errorMessage.classList.remove('hidden');
            errorMessage.innerText = "Invalid email or password. Please try again.";
            console.error("Error logging in:", error);
        });
}

// Function to log out user
function logout() {
    signOut(auth).then(() => {
        // Show login form
        document.getElementById("loginUI").classList.remove('hidden');

        // Hide user data, tasks, and logout button
        document.getElementById("userData").classList.add('hidden');
        document.getElementById("userTasks").classList.add('hidden');
        document.getElementById("logoutButton").classList.add('hidden');
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
}

// Function to fetch user data
async function fetchUserData(uid) {
    const q = query(collection(db, "profiles"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const userDataDisplay = document.getElementById("dataTable");
    userDataDisplay.innerHTML = ''; // Clear previous data

    const table = document.createElement("table");
    table.border = "1";

    const header = table.createTHead();
    const headerRow = header.insertRow(0);
    const headers = ["Profile Name", "Settings 1", "Settings 2", "Created Time"];
    headers.forEach((headerText, index) => {
        const cell = headerRow.insertCell(index);
        cell.outerHTML = `<th>${headerText}</th>`;
    });

    const tbody = table.createTBody();
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = tbody.insertRow();
        row.insertCell(0).innerText = data.profile_name;
        row.insertCell(1).innerText = data.settings1;
        row.insertCell(2).innerText = data.settings2;
        row.insertCell(3).innerText = new Date(data.created_time.seconds * 1000).toLocaleString();
    });

    userDataDisplay.appendChild(table);
}

// Function to fetch user tasks
async function fetchUserTasks(uid) {
    const q = query(collection(db, "tasks"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const userTasksDisplay = document.getElementById("tasksTable");
    userTasksDisplay.innerHTML = ''; // Clear previous data

    // Create table
    const table = document.createElement("table");
    table.border = "1";

    // Create table header
    const header = table.createTHead();
    const headerRow = header.insertRow(0);
    const headers = ["Task", "Category", "Completed", "Notes", "Timestamp"];
    headers.forEach((headerText, index) => {
        const cell = headerRow.insertCell(index);
        cell.outerHTML = `<th>${headerText}</th>`;
    });

    // Create table body
    const tbody = table.createTBody();

    // Populate table with user tasks
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = tbody.insertRow();

        // Editable task field
        const taskCell = row.insertCell(0);
        taskCell.innerText = data.task;
        taskCell.contentEditable = true;  // Make the cell editable
        taskCell.addEventListener('blur', () => saveField(doc.id, 'task', taskCell.innerText));  // Save on losing focus

        // Non-editable category field
        const categoryCell = row.insertCell(1);
        categoryCell.innerText = data.category;

        // Editable completed field (checkbox)
        const completedCell = row.insertCell(2);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = data.completed;
        checkbox.addEventListener('change', () => saveField(doc.id, 'completed', checkbox.checked));  // Save when checkbox changes
        completedCell.appendChild(checkbox);

        // Editable notes field
        const notesCell = row.insertCell(3);
        notesCell.innerText = data.notes || "";
        notesCell.contentEditable = true;  // Make the cell editable
        notesCell.addEventListener('blur', () => saveField(doc.id, 'notes', notesCell.innerText));  // Save on losing focus

        // Timestamp field (non-editable)
        const timestampCell = row.insertCell(4);
        timestampCell.innerText = new Date(data.timestamp.seconds * 1000).toLocaleString();
    });

    // Append table to userTasksDisplay
    userTasksDisplay.appendChild(table);
}

// Function to save updated fields back to Firestore
async function saveField(docId, field, newValue) {
    const taskRef = doc(db, "tasks", docId);

    try {
        await updateDoc(taskRef, {
            [field]: newValue
        });
        console.log(`Updated ${field} to ${newValue}`);
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

// Function to show registration form
function showRegistration() {
    document.getElementById("loginUI").classList.add('hidden');
    document.getElementById("registerUI").classList.remove('hidden');
}

// Function to register new users
// Function to register new users
function register() {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const registerErrorMessage = document.getElementById("registerErrorMessage");

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Clear any previous error message
            registerErrorMessage.classList.add('hidden');
            registerErrorMessage.innerText = '';

            // User registered successfully
            const user = userCredential.user;
            console.log("User registered:", user);

            // Show success message (optional)
            alert("Registration successful! Please log in.");

            // Hide registration form and show login form
            document.getElementById("registerUI").classList.add('hidden');
            document.getElementById("loginUI").classList.remove('hidden');
        })
        .catch((error) => {
            // Show error message if registration fails
            registerErrorMessage.classList.remove('hidden');
            registerErrorMessage.innerText = error.message;
            console.error("Error registering:", error);
        });
}

// Function to show forgot password form
function showForgotPassword() {
    document.getElementById("loginUI").classList.add('hidden');
    document.getElementById("forgotPasswordUI").classList.remove('hidden');
}

// Function to show login form
function showLogin() {
    document.getElementById("forgotPasswordUI").classList.add('hidden');
    document.getElementById("loginUI").classList.remove('hidden');
}

// Function to reset the password
function resetPassword() {
    const email = document.getElementById("forgotPasswordEmail").value;
    const forgotPasswordMessage = document.getElementById("forgotPasswordMessage");

    sendPasswordResetEmail(auth, email)
        .then(() => {
            // Show success message
            forgotPasswordMessage.classList.remove('hidden');
            forgotPasswordMessage.innerText = "Password reset link sent! Check your email.";
        })
        .catch((error) => {
            // Show error message
            forgotPasswordMessage.classList.remove('hidden');
            forgotPasswordMessage.innerText = error.message;
            console.error("Error sending password reset email:", error);
        });
}



// Expose functions globally
window.login = login;
window.fetchUserData = fetchUserData;
window.fetchUserTasks = fetchUserTasks;
window.logout = logout;
window.showRegistration = showRegistration;
window.register = register;
window.resetPassword = resetPassword;
window.showLogin = showLogin;
window.showForgotPassword = showForgotPassword;