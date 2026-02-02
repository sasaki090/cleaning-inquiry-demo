/**
 * B社用 清掃問い合わせフォーム
 */

// ==========================================
// ⚠️ B社用GAS WebアプリURLに変更
// ==========================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxFxkyqU-j4UQ9tMk2Qjp4l5ko0PGEkkdFOMRHmqdjQJuzlw0VJA6CMsX4irvB3FFCH/exec';

// DOM要素
const form = document.getElementById('contact-form');
const cleaningOptions = document.getElementById('cleaning-options');
const submitBtn = document.getElementById('submit-btn');
const successMessage = document.getElementById('success-message');
const resetBtn = document.getElementById('reset-btn');

// 初期化
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadCleaningOptions();
    setupFormValidation();
    setupEventListeners();
}

const CLEANING_OPTIONS = [
    { name: 'エアコン', enabled: true },
    { name: '水回り', enabled: true },
    { name: '空室・引っ越し前後', enabled: true },
    { name: '定期清掃', enabled: true },
    { name: 'その他', enabled: true }
];

async function loadCleaningOptions() {
    renderOptions(CLEANING_OPTIONS);
}

function renderOptions(options) {
    const enabledOptions = options.filter(opt => opt.enabled);

    if (enabledOptions.length === 0) {
        cleaningOptions.innerHTML = `
      <div class="error-message">
        現在選択可能な清掃内容がありません
      </div>
    `;
        return;
    }

    cleaningOptions.innerHTML = enabledOptions.map((opt, index) => `
    <label class="checkbox-item" for="option-${index}">
      <input 
        type="checkbox" 
        id="option-${index}" 
        name="cleaning" 
        value="${opt.name}"
      >
      <span class="checkbox-label">${opt.name}</span>
    </label>
  `).join('');

    cleaningOptions.querySelectorAll('.checkbox-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            item.classList.toggle('checked', checkbox.checked);
            validateForm();
        });
    });

    submitBtn.disabled = false;
}

function setupFormValidation() {
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });
}

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const checkedOptions = form.querySelectorAll('input[name="cleaning"]:checked');

    const isValid = name && phone && address && checkedOptions.length > 0;
    submitBtn.disabled = !isValid;
}

function setupEventListeners() {
    form.addEventListener('submit', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
}

async function handleSubmit(e) {
    e.preventDefault();

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';

    try {
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            cleaning: Array.from(form.querySelectorAll('input[name="cleaning"]:checked'))
                .map(cb => cb.value)
                .join(', '),
            notes: document.getElementById('notes').value.trim()
        };

        if (GAS_URL === 'YOUR_B_COMPANY_GAS_URL_HERE') {
            console.log('📤 B社送信データ（デモ）:', formData);
            await new Promise(r => setTimeout(r, 1000));
            showSuccess();
            return;
        }

        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        showSuccess();

    } catch (error) {
        console.error('送信エラー:', error);
        alert('送信に失敗しました。もう一度お試しください。');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function showSuccess() {
    successMessage.style.display = 'flex';
}

function handleReset() {
    successMessage.style.display = 'none';
    form.reset();
    cleaningOptions.querySelectorAll('.checkbox-item').forEach(item => {
        item.classList.remove('checked');
    });
    validateForm();
}
