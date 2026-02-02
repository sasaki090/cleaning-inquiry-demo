/**
 * 清掃問い合わせフォーム
 * 
 * 使い方:
 * 1. GAS_URLを実際のGoogle Apps ScriptのWebアプリURLに変更してください
 */

// ==========================================
// ⚠️ ここを実際のGAS WebアプリURLに変更
// ==========================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbynaCroXjZVBxTzDwIon4yJPvGk9vs45OD1GIo-NBRS0r91mZCOe-dOfFX9TR7ytCBcfw/exec';

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

/**
 * 清掃オプション設定
 * ここで選択肢のON/OFFを管理します
 * enabled: true → 表示, false → 非表示
 */
const CLEANING_OPTIONS = [
  { name: 'エアコン', enabled: true },
  { name: '水回り', enabled: true },
  { name: '空室・引っ越し前後', enabled: true },
  { name: '定期清掃', enabled: true },
  { name: 'その他', enabled: true }
];

/**
 * 清掃オプションを読み込み
 */
async function loadCleaningOptions() {
  renderOptions(CLEANING_OPTIONS);
}

/**
 * オプションをレンダリング
 */
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

  // チェックボックスのスタイリング
  cleaningOptions.querySelectorAll('.checkbox-item').forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      item.classList.toggle('checked', checkbox.checked);
      validateForm();
    });
  });

  submitBtn.disabled = false;
}

/**
 * フォームバリデーション設定
 */
function setupFormValidation() {
  const inputs = form.querySelectorAll('input[required]');
  inputs.forEach(input => {
    input.addEventListener('input', validateForm);
  });
}

/**
 * フォームの有効性をチェック
 */
function validateForm() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const checkedOptions = form.querySelectorAll('input[name="cleaning"]:checked');

  const isValid = name && phone && address && checkedOptions.length > 0;
  submitBtn.disabled = !isValid;
}

/**
 * イベントリスナー設定
 */
function setupEventListeners() {
  form.addEventListener('submit', handleSubmit);
  resetBtn.addEventListener('click', handleReset);
}

/**
 * フォーム送信処理
 */
async function handleSubmit(e) {
  e.preventDefault();

  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  // ローディング状態
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

    // デモモード
    if (GAS_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
      console.log('📤 送信データ（デモ）:', formData);
      await new Promise(r => setTimeout(r, 1000)); // 擬似遅延
      showSuccess();
      return;
    }

    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // GASはCORS制限があるため
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    // no-corsモードではレスポンスを読めないため、成功として扱う
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

/**
 * 成功メッセージ表示
 */
function showSuccess() {
  successMessage.style.display = 'flex';
}

/**
 * フォームリセット
 */
function handleReset() {
  successMessage.style.display = 'none';
  form.reset();
  cleaningOptions.querySelectorAll('.checkbox-item').forEach(item => {
    item.classList.remove('checked');
  });
  validateForm();
}
