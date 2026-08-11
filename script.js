/* ==========================================================================
   KRYSSEN GROWTH STUDIO — DIRECT RESPONSE INTERACTIVE LOGIC
   Diagnostic Delineated Problem vs Solution & Strategy Drawer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(other => other.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 2. Delineated Diagnostic Tool (Problem vs Solution Split)
  const diagCards = document.querySelectorAll('.diag-option-card');
  const probTitle = document.getElementById('diag-problem-title');
  const probDesc = document.getElementById('diag-problem-desc');
  const solTitle = document.getElementById('diag-solution-title');
  const solDesc = document.getElementById('diag-solution-desc');

  const diagData = {
    icp: {
      probTitle: "The Revenue Leak: ICP Mismatch",
      probDesc: "Your budget is being burned across broad audiences who lack urgent commercial pain or buying authority.",
      solTitle: "The 45-Day Fix: 1-Buyer Restraint",
      solDesc: "We isolate one named decision-maker profile with validated purchasing urgency before funding distribution."
    },
    offer: {
      probTitle: "The Revenue Leak: Offer Resistance",
      probDesc: "Prospects understand your product features but fail to see why buying right now is financially mandatory.",
      solTitle: "The 45-Day Fix: Direct Outcome Positioning",
      solDesc: "We re-architect your core offer around a high-value commercial outcome that compels immediate action."
    },
    motion: {
      probTitle: "The Revenue Leak: Channel Sprawl",
      probDesc: "Growth capital is split thin across 4+ unproven channels (SEO, Ads, Content, Outbound) without channel focus.",
      solTitle: "The 45-Day Fix: Single Distribution Pathway",
      solDesc: "We pause channel noise and engineer one high-converting acquisition motion to prove commercial repeatability."
    },
    followup: {
      probTitle: "The Revenue Leak: Qualification Fall-off",
      probDesc: "Mismatched leads book calls but fail to show up, or sales reps take 4+ days to follow up with qualified prospects.",
      solTitle: "The 45-Day Fix: Automated Qualification Gate",
      solDesc: "We install an automated qualification system that filters out tire-kickers and routes hot buyers directly to your sales lead."
    }
  };

  diagCards.forEach(card => {
    card.addEventListener('click', () => {
      diagCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const key = card.dataset.diagKey;
      if (diagData[key]) {
        probTitle.textContent = diagData[key].probTitle;
        probDesc.textContent = diagData[key].probDesc;
        solTitle.textContent = diagData[key].solTitle;
        solDesc.textContent = diagData[key].solDesc;
      }
    });
  });

  // 3. Strategy Call Modal / Drawer Management
  const modalOverlay = document.getElementById('strategy-modal');
  const openModalBtns = document.querySelectorAll('.js-open-modal');
  const closeModalBtn = document.getElementById('modal-close-btn');
  const bookingForm = document.getElementById('strategy-booking-form');
  const formStep1 = document.getElementById('form-step-1');
  const formStep2 = document.getElementById('form-step-2');
  const formSuccess = document.getElementById('form-success');
  const btnNextStep = document.getElementById('btn-next-step');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  if (btnNextStep) {
    btnNextStep.addEventListener('click', () => {
      const companyName = document.getElementById('modal-company').value;
      const acv = document.getElementById('modal-acv').value;

      if (!companyName || !acv) {
        alert('Please complete company name and target annual customer value to proceed.');
        return;
      }

      formStep1.style.display = 'none';
      formStep2.style.display = 'block';
      document.getElementById('step-dot-1').classList.remove('active');
      document.getElementById('step-dot-2').classList.add('active');
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('modal-email').value;
      if (!email) {
        alert('Please enter a valid work email.');
        return;
      }

      formStep2.style.display = 'none';
      formSuccess.style.display = 'block';
      document.getElementById('step-dot-2').classList.remove('active');
      document.getElementById('step-dot-3').classList.add('active');
    });
  }

  // 4. Hero Visual Output Matrix Simulation
  const schematicSteps = document.querySelectorAll('.schematic-step');
  const matrixPills = document.querySelectorAll('.matrix-pill');

  schematicSteps.forEach((step, index) => {
    step.addEventListener('mouseenter', () => {
      matrixPills.forEach(p => p.classList.remove('active'));
      if (index === 0 || index === 1) {
        matrixPills[0].classList.add('active');
      } else if (index === 2 || index === 3) {
        matrixPills[1].classList.add('active');
      } else {
        matrixPills[2].classList.add('active');
      }
    });
  });
});
