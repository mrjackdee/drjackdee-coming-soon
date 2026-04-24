(function () {
  document.documentElement.classList.add("js");

  const revealItems = document.querySelectorAll(".reveal");
  const form = document.getElementById("notify-form");
  const status = document.getElementById("notify-status");
  const emailInput = document.getElementById("notify-email");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const delay = entry.target.dataset.reveal || "0";
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -48px 0px"
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  function revealVisibleItems() {
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94) {
        item.classList.add("is-visible");
      }
    });
  }

  revealVisibleItems();
  window.addEventListener("load", revealVisibleItems, { once: true });

  if (!form || !status || !emailInput) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const endpoint = form.dataset.endpoint.trim();

    if (!email) {
      status.textContent = "Please enter an email address.";
      return;
    }

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            source: "drjackdee-coming-soon"
          })
        });

        if (!response.ok) {
          throw new Error("Unable to submit the form.");
        }

        emailInput.value = "";
        status.textContent = "Thanks. You're on the launch notification list.";
        return;
      } catch (error) {
        status.textContent =
          "The signup endpoint is not available right now. Please try again shortly.";
        return;
      }
    }

    const subject = encodeURIComponent("DrJackDee.com launch notification");
    const body = encodeURIComponent(
      `Please notify me at ${email} when DrJackDee.com launches.`
    );

    window.location.href = `mailto:advisory@donoraglobal.com?subject=${subject}&body=${body}`;
    status.textContent =
      "Your email app is opening with a pre-addressed launch request.";
  });
})();
