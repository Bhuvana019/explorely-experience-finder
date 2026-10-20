/**
 * AUTHENTICATION & PROFILE SCRIPT
 * Manages Login, Registration, Profile Editing, and User Session
 */

(function () {
  'use strict';

  // Toggle Password Visibility
  function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? '👁️‍🗨️' : '👁️';
      });
    });
  }

  // Login Page Logic
  function setupLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    // Demo fill button
    const demoBtn = document.getElementById('btn-demo-credentials');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        document.getElementById('login-email').value = 'ananya@explorely.com';
        document.getElementById('login-password').value = 'explorely2026';
        window.showToast('Demo credentials filled!');
      });
    }

    // Already logged in -> skip the login page
    if (window.ExplorelyAPI.getToken()) {
      window.location.href = window.ExplorelyAPI.getNextUrl('explore.html');
      return;
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        window.showToast('Please enter both email and password.', 'error');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const user = await window.ExplorelyAPI.login(email, password);
        window.showToast(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          window.location.href = window.ExplorelyAPI.getNextUrl('explore.html');
        }, 500);
      } catch (err) {
        window.showToast(err.message || 'Login failed.', 'error');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Register Page Logic
  function setupRegisterPage() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    if (window.ExplorelyAPI.getToken()) {
      window.location.href = window.ExplorelyAPI.getNextUrl('explore.html');
      return;
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;

      if (!name || !email || !password) {
        window.showToast('Please complete all registration fields.', 'error');
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        window.showToast('Please enter a valid email address.', 'error');
        return;
      }

      if (password.length < 8) {
        window.showToast('Password must be at least 8 characters.', 'error');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        await window.ExplorelyAPI.register(name, email, password);
        window.showToast('Account created successfully! Welcome to Explorely.');
        setTimeout(() => {
          window.location.href = window.ExplorelyAPI.getNextUrl('explore.html');
        }, 500);
      } catch (err) {
        window.showToast(err.message || 'Registration failed.', 'error');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Profile Page Logic
  async function setupProfilePage() {
    const profileWrap = document.getElementById('profile-content-wrap');
    if (!profileWrap) return;

    // Profile requires a logged-in user when the live backend is in use
    if (window.ExplorelyAPI.requiresLogin()) {
      window.ExplorelyAPI.redirectToLogin('Please log in to view your profile.');
      return;
    }
    if (window.ExplorelyAPI.getToken()) {
      await window.ExplorelyAPI.refreshCurrentUser();
      if (!window.ExplorelyAPI.getToken()) {
        window.ExplorelyAPI.redirectToLogin('Your session has expired. Please log in again.');
        return;
      }
    }
    const user = window.ExplorelyAPI.getCurrentUser();
    const savedExp = await window.ExplorelyAPI.getSavedExperiences();
    const savedRest = await window.ExplorelyAPI.getSavedRestaurants();
    const allReviews = JSON.parse(localStorage.getItem('explorely_reviews_data') || '[]');
    const userReviews = allReviews.filter(r => r.user_name && r.user_name.toLowerCase().includes(user.name.toLowerCase()));

    // Populate profile elements
    const nameEl = document.getElementById('profile-user-name');
    if (nameEl) nameEl.textContent = user.name;

    const emailEl = document.getElementById('profile-user-email');
    if (emailEl) emailEl.textContent = user.email;

    const avatarEl = document.getElementById('profile-user-avatar');
    if (avatarEl) avatarEl.textContent = user.avatar || user.name.substring(0, 2).toUpperCase();

    const bioEl = document.getElementById('profile-user-bio');
    if (bioEl) bioEl.textContent = user.bio || 'Curated Indian travel explorer.';

    const countSavesEl = document.getElementById('profile-count-saves');
    if (countSavesEl) countSavesEl.textContent = savedExp.length + savedRest.length;

    const countReviewsEl = document.getElementById('profile-count-reviews');
    if (countReviewsEl) countReviewsEl.textContent = userReviews.length > 0 ? userReviews.length : '3';

    // Edit Profile Modal
    const editBtn = document.getElementById('btn-edit-profile');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        let modal = document.getElementById('edit-profile-modal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'edit-profile-modal';
          modal.className = 'modal-backdrop';
          modal.innerHTML = `
            <div class="modal-card">
              <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').classList.remove('open')">&times;</button>
              <h3 style="font-size:20px;font-weight:700;margin-bottom:1rem;">Edit Profile</h3>
              <div class="auth-form">
                <div class="input-field-group">
                  <label class="input-label">Full Name</label>
                  <input type="text" id="edit-name-input" class="input-control" value="${user.name}">
                </div>
                <div class="input-field-group">
                  <label class="input-label">Bio</label>
                  <textarea id="edit-bio-input" class="input-control" rows="3">${user.bio || ''}</textarea>
                </div>
                <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;">
                  <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').classList.remove('open')">Cancel</button>
                  <button class="btn btn-primary" id="btn-save-profile-changes">Save Changes</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modal);

          modal.querySelector('#btn-save-profile-changes').addEventListener('click', () => {
            const newName = modal.querySelector('#edit-name-input').value.trim();
            const newBio = modal.querySelector('#edit-bio-input').value.trim();
            window.ExplorelyAPI.updateUser({ name: newName, bio: newBio });
            modal.classList.remove('open');
            window.showToast('Profile updated successfully!');
            setupProfilePage();
          });
        }
        modal.classList.add('open');
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('btn-user-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
          window.ExplorelyAPI.logout();
          window.showToast('You have been logged out.');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 400);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupPasswordToggles();
    setupLoginPage();
    setupRegisterPage();
    setupProfilePage();
  });

})();
