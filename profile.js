// profile.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// 🔹 Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBevDhtRFYh-z-F4vSQuUb6kGOrbFmSHcw",
    authDomain: "versahelp-sp.firebaseapp.com",
    projectId: "versahelp-sp",
    storageBucket: "versahelp-sp.appspot.com",
    messagingSenderId: "1069850501427",
    appId: "1:1069850501427:web:8531a8051d70fb82381e46",
    measurementId: "G-7CR4B6RR06"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Wait for user to be logged in
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const uid = user.uid;
    document.getElementById("user-email").innerText = user.email;

    const userRef = doc(db, "users", uid);

    // 🔹 Real-time profile listener
    onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById("user-name-display").innerText = data.name || "Guest";
            document.getElementById("update-name").value = data.name || "";
            document.getElementById("update-phone").value = data.phone || "";
            if (data.photoURL) {
                document.getElementById("user-pic").src = data.photoURL;
            }
        }
    });

    // 🔹 Real-time orders
    const ordersRef = collection(db, "orders");
    const ordersQuery = query(ordersRef, where("userId", "==", uid));
    onSnapshot(ordersQuery, (querySnap) => {
        const orderList = document.getElementById("order-list");
        orderList.innerHTML = "";
        if (querySnap.empty) {
            orderList.innerHTML = "<p>No orders found.</p>";
        } else {
            querySnap.forEach(docSnap => {
                const order = docSnap.data();
                const div = document.createElement("div");
                div.classList.add("order-item");
                div.innerHTML = `<strong>${order.service}</strong> - ${order.date.toDate().toLocaleString()}<br>Status: ${order.status}`;
                orderList.appendChild(div);
            });
        }
    });

    // 🔹 Real-time feedback
    const feedbackRef = collection(db, "feedback");
    const feedbackQuery = query(feedbackRef, where("userId", "==", uid));
    onSnapshot(feedbackQuery, (querySnap) => {
        const feedbackList = document.getElementById("feedback-list");
        feedbackList.innerHTML = "";
        if (querySnap.empty) {
            feedbackList.innerHTML = "<p>No feedback submitted yet.</p>";
        } else {
            querySnap.forEach(docSnap => {
                const fb = docSnap.data();
                const div = document.createElement("div");
                div.classList.add("order-item");
                div.innerHTML = `${fb.feedback} <br><small>${fb.createdAt.toDate().toLocaleString()}</small>`;
                feedbackList.appendChild(div);
            });
        }
    });

    // 🔹 Update Profile
    document.getElementById("update-profile-btn").addEventListener("click", async () => {
        const name = document.getElementById("update-name").value;
        const phone = document.getElementById("update-phone").value;
        await updateDoc(userRef, { name, phone });
        alert("Profile updated!");
    });

    // 🔹 Submit Feedback
    document.getElementById("feedback-btn").addEventListener("click", async () => {
        const feedback = document.getElementById("feedback-text").value;
        if (!feedback.trim()) return alert("Please write feedback first.");
        await addDoc(collection(db, "feedback"), {
            userId: uid,
            feedback,
            createdAt: new Date()
        });
        document.getElementById("feedback-text").value = "";
        alert("Feedback submitted!");
    });

    // 🔹 Upload Profile Picture
    document.getElementById("upload-pic-btn").addEventListener("click", async () => {
        const fileInput = document.getElementById("profile-pic-input");
        if (!fileInput.files[0]) return alert("Please select a file.");
        const file = fileInput.files[0];
        const storageRef = ref(storage, `profile_pics/${uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        await updateDoc(userRef, { photoURL });
        alert("Profile picture updated!");
    });

    // 🔹 Logout
    document.getElementById("logout-btn").addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });
});
