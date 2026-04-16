// navbar toggle
function openNav() {
    if (document.body.classList.contains("side-nav-open")) {
        closeNav();
        return;
    }
    document.body.classList.add("side-nav-open");
    const menuTrigger = document.querySelector(".hamburger");
    if (menuTrigger) menuTrigger.setAttribute("aria-expanded", "true");
}

function closeNav() {
    document.body.classList.remove("side-nav-open");
    const menuTrigger = document.querySelector(".hamburger");
    if (menuTrigger) menuTrigger.setAttribute("aria-expanded", "false");
}

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});

window.addEventListener("pageshow", () => {
    window.scrollTo(0, 0);
});



const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.2 });

document.addEventListener("DOMContentLoaded", () => {
    if (!window.versahelpDb && window.firebase && window.versahelpFirebaseConfig) {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.versahelpFirebaseConfig);
        }
        window.versahelpDb = firebase.firestore();
    }

    document.querySelectorAll(".feature-card, .tech-card").forEach((card) => {
        scrollObserver.observe(card);
    });

    let slideIndex = 0;
    const slides = document.querySelectorAll(".gallery-slide");
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    function showSlides(n) {
        if (!slides.length) return;
        slides.forEach(slide => {
            slide.style.display = "none";
            const video = slide.querySelector("video");
            if (video) video.pause();
        });
        slideIndex = (n + slides.length) % slides.length;
        slides[slideIndex].style.display = "block";
        const activeVideo = slides[slideIndex].querySelector("video");
        if (activeVideo) {
            activeVideo.currentTime = 0;
            activeVideo.play().catch(() => {});
        }
    }

    showSlides(slideIndex); // Show first slide immediately

    function nextSlide() { showSlides(slideIndex + 1); }
    function prevSlide() { showSlides(slideIndex - 1); }

    let slideInterval;
    if (slides.length) {
        slideInterval = setInterval(nextSlide, 5000);
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => { nextSlide(); resetInterval(); });
    }
    if (prevBtn) {
        prevBtn.addEventListener("click", () => { prevSlide(); resetInterval(); });
    }

    function resetInterval() {
        if (!slides.length) return;
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    const consultationForm = document.getElementById("consultationForm");
    const consultationStatus = document.getElementById("consultationStatus");
    if (consultationForm) {
        consultationForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!consultationForm.checkValidity()) {
                consultationForm.reportValidity();
                if (consultationStatus) {
                    consultationStatus.textContent = "Please complete all required fields and consent to be contacted.";
                    consultationStatus.style.color = "#ff9b9b";
                }
                return;
            }

            const db = window.versahelpDb;
            if (!db) {
                if (consultationStatus) {
                    consultationStatus.textContent = "Submission service is not ready. Please refresh and try again.";
                    consultationStatus.style.color = "#ff9b9b";
                }
                return;
            }

            const submitBtn = consultationForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            const payload = {
                firstName: consultationForm.firstName.value.trim(),
                lastName: consultationForm.lastName.value.trim(),
                email: consultationForm.email.value.trim(),
                cellphone: consultationForm.cellphone.value.trim(),
                serviceType: consultationForm.serviceType.value,
                organisation: consultationForm.organisation.value.trim() || null,
                additionalInfo: consultationForm.additionalInfo.value.trim() || null,
                consentToContact: consultationForm.consentToContact.checked,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            };

            try {
                const docRef = await db.collection("technologyConsultations").add(payload);
                console.log("[DEBUG] technologyConsultations doc created:", docRef.id);

                const notifyEmail = (window.versahelpNotificationEmail || "").trim();
                if (notifyEmail.includes("@")) {
                    const serviceLabelMap = {
                        "tech-support": "Tech Support",
                        "web-development": "Web Development",
                        "mobile-app-development": "Mobile App Development",
                        "devops-services": "DevOps Services",
                    };
                    const serviceLabel = serviceLabelMap[payload.serviceType] || payload.serviceType;

                    try {
                        await db.collection("mail").add({
                            to: [notifyEmail],
                            message: {
                                subject: `New Technology Consultation (${serviceLabel})`,
                                text: [
                                    `Document ID: ${docRef.id}`,
                                    `Name: ${payload.firstName} ${payload.lastName}`,
                                    `Email: ${payload.email}`,
                                    `Cellphone: ${payload.cellphone}`,
                                    `Service: ${serviceLabel}`,
                                    `Organisation: ${payload.organisation || "N/A"}`,
                                    `Additional Info: ${payload.additionalInfo || "N/A"}`,
                                ].join("\n"),
                            },
                        });
                        console.log("[DEBUG] Trigger Email doc created in mail collection.");
                    } catch (mailError) {
                        console.warn("[DEBUG] Could not create mail doc for extension trigger:", mailError);
                    }
                }

                if (consultationStatus) {
                    consultationStatus.textContent = "Thank you. Your consultation request has been captured. We will contact you soon.";
                    consultationStatus.style.color = "#8bd3ff";
                }
                consultationForm.reset();
            } catch (error) {
                if (consultationStatus) {
                    consultationStatus.textContent = "Could not submit your request right now. Please try again.";
                    consultationStatus.style.color = "#ff9b9b";
                }
                console.error("Consultation submit error:", error);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

});

//Move button slightly when scrolling to avoid overlap
window.addEventListener("scroll", () => {
    if (document.body.classList.contains("side-nav-open")) {
        closeNav();
    }

  const switchBtn = document.querySelector(".switch-btn");
    if (!switchBtn) return;
  const scrollY = window.scrollY;

  // When scrolling past 100px, raise the button slightly
  if (scrollY > 100) {
    switchBtn.style.bottom = "40px";  // float higher
  } else {
    switchBtn.style.bottom = "20px";  // default
  }
});

