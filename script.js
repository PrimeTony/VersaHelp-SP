// navbar toggle
function openNav() {
    document.getElementById("side-nav").style.width = "250px";
    document.body.classList.add("side-nav-open");
}

function closeNav() {
    document.getElementById("side-nav").style.width = "0";
    document.body.classList.remove("side-nav-open");
}



const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.2 });

document.addEventListener("DOMContentLoaded", () => {
    let slideIndex = 0;
    const slides = document.querySelectorAll(".gallery-slide");

    function showSlides(n) {
        slides.forEach(slide => slide.style.display = "none");
        slideIndex = (n + slides.length) % slides.length;
        slides[slideIndex].style.display = "block";
    }

    showSlides(slideIndex); // Show first slide immediately

    function nextSlide() { showSlides(slideIndex + 1); }
    function prevSlide() { showSlides(slideIndex - 1); }

    let slideInterval = setInterval(nextSlide, 5000);

    document.querySelector(".next").addEventListener("click", () => { nextSlide(); resetInterval(); });
    document.querySelector(".prev").addEventListener("click", () => { prevSlide(); resetInterval(); });

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
});

//Move button slightly when scrolling to avoid overlap
window.addEventListener("scroll", () => {
  const switchBtn = document.querySelector(".switch-btn");
  const scrollY = window.scrollY;

  // When scrolling past 100px, raise the button slightly
  if (scrollY > 100) {
    switchBtn.style.bottom = "40px";  // float higher
  } else {
    switchBtn.style.bottom = "20px";  // default
  }
});
