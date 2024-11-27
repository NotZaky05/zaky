$(document).on("contextmenu", "img", function(event) {
  event.preventDefault();
});

// Toggle menu
function toggleMenu() {
  $('.wrap_line').toggleClass('active');
  $('nav').toggleClass('hidden');
}

// Menambahkan event listener untuk menutup menu saat item navigasi diklik
$('.nav_link').on('click', function () {
  $('nav').addClass('hidden');
  $('.wrap_line').removeClass('active');
});

// Active link
const activeLink = () => {
  const sections = $('section');
  const navLinks = $('.nav_link');

  const currentSection = [...sections].reverse().find(section =>
    $(window).scrollTop() >= $(section).offset().top - 60
  )?.id || "home";

  navLinks.each(function () {
    $(this).toggleClass("act", $(this).attr('href').includes(currentSection));
  });
};

$(window).on('scroll', activeLink);

// Typewriter
const write = "Hi, I'm";

function typeWriter(element, write, speed = 150) {
  let i = 0;
  const intervalId = setInterval(() => {
    $(element).html($(element).html() + write.charAt(i));
    i++;
    if (i === write.length) clearInterval(intervalId);
  }, speed);
}

typeWriter($('#write'), write);

// Animated text
const text = document.querySelector('#animated-text');
if (text) {
  initializeTextAnimation(text);
}

function initializeTextAnimation(element) {
  const chars = element.textContent.split('');
  const fragment = chars
    .map((char, i) => 
      `<span class="split-char${char === ' ' ? ' split-space' : ''}" style="--i:${i}">${char}</span>`
    )
    .join('');

  element.innerHTML = fragment;

  let isTouch = false;
  let lastInteractedElement = null;

  function handleInteraction(targetElement) {
    if (!targetElement?.classList.contains('split-char')) return;
    if (targetElement === lastInteractedElement) return;
    lastInteractedElement = targetElement;

    const chars = element.querySelectorAll('.split-char');
    const index = Array.from(chars).indexOf(targetElement);

    chars.forEach(char => {
      char.classList.remove('hover', 'hover-prev', 'hover-prev-2', 'hover-next', 'hover-next-2');
    });

    targetElement.classList.add('hover');
    chars[index - 1]?.classList.add('hover-prev');
    chars[index - 2]?.classList.add('hover-prev-2');
    chars[index + 1]?.classList.add('hover-next');
    chars[index + 2]?.classList.add('hover-next-2');
  }

  function clearEffects() {
    lastInteractedElement = null;
    element.querySelectorAll('.split-char').forEach(char => {
      char.classList.remove('hover', 'hover-prev', 'hover-prev-2', 'hover-next', 'hover-next-2');
    });
  }

  // Mouse events
  element.addEventListener('mouseover', (e) => {
    if (isTouch || !e.target.classList.contains('split-char')) return;
    handleInteraction(e.target);
  });

  element.addEventListener('mouseout', (e) => {
    if (isTouch) return;
    if (!e.relatedTarget?.closest('#animated-text')) {
      clearEffects();
    }
  });

  // Touch events
  element.addEventListener('touchstart', (e) => {
    isTouch = true;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    handleInteraction(target);
  });

  element.addEventListener('touchmove', (e) => {
    if (!isTouch) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    handleInteraction(target);
  });

  const touchEndHandler = () => {
    if (!isTouch) return;
    setTimeout(clearEffects, 100);
  };

  element.addEventListener('touchend', touchEndHandler);
  element.addEventListener('touchcancel', touchEndHandler);

  // Reset touch flag on mouse movement
  window.addEventListener('mousemove', () => {
    if (isTouch) isTouch = false;
  });
}

const slider = document.querySelector('.slider');
const prevSlide = document.querySelector('#prev');
const nextSlide = document.querySelector('#next');

nextSlide.onclick = () => {
  slider.append(slider.querySelector('.slide-item:first-child'));
}
prevSlide.onclick = () => {
  slider.prepend(slider.querySelector('.slide-item:last-child'));
}

const trailer = document.getElementById("trailer");

const animateTrailer = (e, interacting) => {
  const x = e.clientX - trailer.offsetWidth / 2,
        y = e.clientY - trailer.offsetHeight / 2;
  
  const keyframes = {
    transform: `translate(${x}px, ${y}px) scale(${interacting ? 8 : 1})`
  }
  
  trailer.animate(keyframes, { 
    duration: 800, 
    fill: "forwards" 
  });
}

// Tampilkan trailer saat mouse bergerak
document.addEventListener("mousemove", (e) => {
  trailer.style.opacity = 1; 
  animateTrailer(e, false);
});

// Sembunyikan trailer saat mouse keluar dari layar
document.addEventListener("mouseleave", () => {
  trailer.style.opacity = 0; 
});

 document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('contactForm');
            const toast = document.getElementById('toast');

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Network response was not ok.');
                }).then(data => {
                    // Show toast
                    toast.classList.remove('opacity-0', 'translate-y-2');
                    toast.classList.add('opacity-100', 'translate-y-0');

                    // Hide toast after 3 seconds
                    setTimeout(function() {
                        toast.classList.remove('opacity-100', 'translate-y-0');
                        toast.classList.add('opacity-0', 'translate-y-2');
                    }, 3000);

                    // Reset form
                    form.reset();
                }).catch(error => {
                    console.error('Error:', error);
                    alert('There was a problem sending your message. Please try again later.');
                });
            });
        });