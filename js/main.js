(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });


    // Auto-close the mobile hamburger menu on scroll, so it doesn't
    // stay expanded over the page content while the user scrolls.
    var navbarCollapseEl = document.getElementById('navbarCollapse');
    if (navbarCollapseEl) {
        var closeMobileNavOnScroll = function () {
            if (navbarCollapseEl.classList.contains('show') && typeof bootstrap !== 'undefined') {
                var collapseInstance = bootstrap.Collapse.getOrCreateInstance(navbarCollapseEl);
                collapseInstance.hide();
            }
        };
        window.addEventListener('scroll', closeMobileNavOnScroll, { passive: true });
    }
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Skills
    $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Project carousel
    $(".project-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        nav: false,
        dots: true,
        dotsData: true,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });

    
})(jQuery);

// Note: the logo now stays as a single, higher-resolution image at all
// screen sizes and is scaled purely with CSS (see #logo-img rules in
// style.css). Swapping to the 32x32 favicon on mobile previously made
// the logo blurry/pixelated once stretched into the nav brand area.

// Newsletter signup: client-side validation + confirmation (no backend attached yet)
function handleNewsletterSignup(form) {
    var input = form.querySelector('input[name="email"]');
    var message = form.querySelector('.newsletter-message');
    var email = input.value.trim();
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        message.textContent = 'Please enter a valid email address.';
        message.classList.remove('text-success');
        message.classList.add('text-danger');
        return false;
    }

    message.textContent = "Thanks for signing up! We'll be in touch.";
    message.classList.remove('text-danger');
    message.classList.add('text-success');
    input.value = '';
    return false; // prevent page reload; hook up a real endpoint here when available
}

// Quote + contact forms: validated client-side, then delivered by email to
// gearcyborg@gmail.com via FormSubmit (https://formsubmit.co), a no-backend form service.
// NOTE: the very first submission triggers a one-time activation email from FormSubmit
// to the inbox below; click "Activate Form" in it and all later submissions arrive normally.
var CG_FORM_ENDPOINT = 'https://formsubmit.co/ajax/gearcyborg@gmail.com';

function cgSendForm(form, messageEl, subject, successText) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var emailInput = form.querySelector('input[name="email"]');
    var button = form.querySelector('button[type="submit"]');

    function show(text, ok) {
        messageEl.textContent = text;
        messageEl.classList.toggle('text-success', ok);
        messageEl.classList.toggle('text-danger', !ok);
    }

    if (!emailPattern.test(emailInput.value.trim())) {
        show('Please enter a valid email address.', false);
        return false;
    }

    var payload = {};
    new FormData(form).forEach(function (value, key) { payload[key] = value; });
    payload._subject = subject + ' - ' + (payload.name || 'Website visitor');
    payload._replyto = payload.email;
    payload._template = 'table';
    payload._captcha = 'false';

    var originalLabel = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Sending...';
    show('', true);

    fetch(CG_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (r) {
            if (r.ok && String(r.data.success) === 'true') {
                show(successText, true);
                form.reset();
            } else {
                throw new Error('send failed');
            }
        })
        .catch(function () {
            show("Sorry, we couldn't send your message right now. Please email gearcyborg@gmail.com, call +254 717 474 848, or WhatsApp us directly.", false);
        })
        .then(function () {
            button.disabled = false;
            button.innerHTML = originalLabel;
        });

    return false;
}

function handleQuoteSubmit(form) {
    return cgSendForm(
        form,
        form.querySelector('.quote-message'),
        'New quote request',
        "Thanks \u2014 we've received your request and will get back to you within one business day. For a faster reply, feel free to call or WhatsApp us directly."
    );
}

function handleContactSubmit(form) {
    return cgSendForm(
        form,
        form.querySelector('.contact-message'),
        'New contact message',
        "Thanks for reaching out \u2014 we'll get back to you shortly."
    );
}
