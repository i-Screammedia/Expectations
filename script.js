const STORAGE_KEY = 'aidt-expectation-comments-v1';

function isGoogleFormConfigured() {
  const config = typeof GOOGLE_FORM_CONFIG !== 'undefined' ? GOOGLE_FORM_CONFIG : null;
  if (!config?.enabled || !config.actionUrl) return false;

  const hasPlaceholder =
    config.actionUrl.includes('REPLACE') ||
    Object.values(config.entries || {}).some(
      (entryId) => !entryId || String(entryId).includes('REPLACE')
    );

  return !hasPlaceholder;
}

function buildGoogleFormBody(data) {
  const { entries } = GOOGLE_FORM_CONFIG;
  const params = new URLSearchParams();

  params.append(entries.office, data.office);
  params.append(entries.school, data.school);
  params.append(entries.name, data.name);
  params.append(entries.phone, data.phone);
  params.append(entries.feature, data.featureLabel);
  params.append(entries.comment, data.comment);

  if (entries.consent && entries.consentValue) {
    params.append(entries.consent, entries.consentValue);
  }
  if (entries.redirectAck && entries.redirectAckValue) {
    params.append(entries.redirectAck, entries.redirectAckValue);
  }

  return params;
}

function formatPhoneForGoogle(phone) {
  const digits = normalizePhone(phone);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone.trim();
}

async function submitToGoogleForm(data) {
  if (!isGoogleFormConfigured()) {
    return {
      ok: false,
      error: new Error('Google Form 연동 설정이 완료되지 않았습니다.'),
    };
  }

  try {
    await fetch(GOOGLE_FORM_CONFIG.actionUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: buildGoogleFormBody(data).toString(),
    });

    // no-cors 응답은 읽을 수 없지만, 네트워크 오류가 없으면 전송 성공으로 처리합니다.
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function setSubmitLoading(isLoading) {
  if (!submitBtn) return;

  submitBtn.disabled = isLoading || !(consentCheck?.checked && getSelectedFeature());
  submitBtn.classList.toggle('is-loading', isLoading);
  submitBtn.textContent = isLoading ? '등록 중...' : '기대평 등록';
}

const FEATURE_LABELS = {
  'feature-1': '수학 익힘책 메뉴 신설',
  'feature-2': '단원평가 2세트 및 재응시',
  'feature-3': '친절하고 보기 쉬운 학습 리포트',
  'feature-4': '수학 기초 학습용 교구 및 게임 콘텐츠',
  'feature-5': '다양해진 펫&직업군 아바타',
  'feature-6': '21종 다양한 수학 교구 보드',
};

const FEATURE_DETAILS = {
  'feature-1': {
    tag: '#수학 익힘',
    icon: '📒',
    title: '수학 익힘책 메뉴 신설',
    body: `
      <p>수학 익힘책 학습을 위한 전용 메뉴가 새롭게 추가됩니다.</p>
      <strong>주요 업데이트</strong>
      <p>· 익힘책 단원·차시별 메뉴 구성</p>
      <p>· 교과 연계 익힘 문제 바로 접근</p>
      <p>· 학생 학습 현황 연동</p>
      <strong>기대 효과</strong>
      <p>익힘책 학습을 더 체계적으로 관리하고 수업에 활용할 수 있습니다.</p>
    `,
  },
  'feature-2': {
    tag: '#평가 문항',
    icon: '📝',
    title: '단원평가 2세트 및 재응시',
    image: 'evaluation.png',
    imageAlt: '단원평가 2세트 및 재응시 소개 이미지',
    body: `
      <p>단원평가 문항이 2세트로 제공되고, 재응시 기능이 개선됩니다.</p>
      <strong>주요 업데이트</strong>
      <p>· 단원평가 2세트 출제 지원</p>
      <p>· 학생 재응시 기회 설정 기능</p>
      <p>· 평가 결과 분석 강화</p>
      <strong>기대 효과</strong>
      <p>다양한 평가로 학습 성취도를 더 정확하게 확인할 수 있습니다.</p>
    `,
  },
  'feature-3': {
    tag: '#맞춤 대시보드',
    icon: '📊',
    title: '친절하고 보기 쉬운 학습 리포트',
    images: [
      { src: 'dashboard.png', alt: '맞춤 대시보드 학습 리포트 소개 1' },
      { src: 'dashboard01.png', alt: '맞춤 대시보드 학습 리포트 소개 2' },
    ],
    body: `
      <p>학생·학급 학습 현황을 한눈에 볼 수 있는 맞춤 대시보드가 개선됩니다.</p>
      <strong>주요 업데이트</strong>
      <p>· 직관적인 학습 리포트 UI</p>
      <p>· 학급·개인별 성취도 시각화</p>
      <p>· 취약 영역 한눈에 파악</p>
      <strong>기대 효과</strong>
      <p>복잡한 데이터를 쉽게 이해하고 수업에 바로 활용할 수 있습니다.</p>
    `,
  },
  'feature-4': {
    tag: '#수학 게임',
    icon: '🎮',
    title: '수학 기초 학습용 교구 및 게임 콘텐츠',
    images: [
      { src: 'game.png', alt: '수학 기초 학습용 교구 및 게임 콘텐츠 소개 1' },
      { src: 'basic.png', alt: '수학 기초 학습용 교구 및 게임 콘텐츠 소개 2' },
    ],
    body: `
      <p>수학 기초 학습을 돕는 교구형 콘텐츠와 게임이 추가됩니다.</p>
      <strong>주요 업데이트</strong>
      <p>· 수학 기초 개념 학습용 교구 콘텐츠</p>
      <p>· 게임형 학습 활동 제공</p>
      <p>· 학생 참여 유도형 인터랙션</p>
      <strong>기대 효과</strong>
      <p>재미있는 학습 경험으로 수학에 대한 흥미를 높일 수 있습니다.</p>
    `,
  },
  'feature-5': {
    tag: '#아바타 꾸미기',
    icon: '🎨',
    title: '다양해진 펫&직업군 아바타',
    images: [
      { src: 'avatar.png', alt: '다양해진 펫&직업군 아바타 소개 1' },
      { src: 'avatar01.png', alt: '다양해진 펫&직업군 아바타 소개 2' },
    ],
    body: `
      <p>학생 아바타 꾸미기 기능이 확장되어 더 다양한 펫과 직업군 아바타를 제공합니다.</p>
      <strong>주요 업데이트</strong>
      <p>· 새로운 펫 아바타 추가</p>
      <p>· 다양한 직업군 테마 아바타</p>
      <p>· 학습 보상과 연계된 꾸미기 요소</p>
      <strong>기대 효과</strong>
      <p>학생들의 학습 동기와 참여도를 자연스럽게 높일 수 있습니다.</p>
    `,
  },
  'feature-6': {
    tag: '#수학 교구',
    icon: '🧮',
    title: '21종 다양한 수학 교구 보드',
    image: 'mathboard.png',
    imageAlt: '21종 다양한 수학 교구 보드 소개 이미지',
    body: `
      <p>수업과 자기주도 학습에 활용할 수 있는 21종의 수학 교구 보드가 제공됩니다.</p>
      <strong>주요 업데이트</strong>
      <p>· 21종 다양한 수학 교구 보드 제공</p>
      <p>· 눈으로 보고 직접 조작하는 수학 학습 지원</p>
      <p>· 수업·보충 학습에 바로 활용 가능</p>
      <strong>기대 효과</strong>
      <p>추상적인 수학 개념을 시각적으로 이해하도록 도와 수업 효과를 높일 수 있습니다.</p>
    `,
  },
  'feature-convenience': {
    title: '수업 환경 개선 및 편의 기능 고도화',
    showcase: [
      {
        title: '대시보드 PDF 저장',
        src: 'dashboard02.png',
        alt: '대시보드 PDF 저장 기능 소개',
      },
      {
        title: '과제, 문제지 만들기(5,6학년 한정 기능)시 차시 중복 선택 가능',
        src: 'makeevaluation.png',
        alt: '과제·문제지 만들기 차시 중복 선택 기능 소개',
      },
      {
        title: '모니터링 화면 기능 개선',
        src: 'monitoring.png',
        alt: '모니터링 화면 기능 개선 소개',
      },
      {
        title: '총괄 평가 신설',
        src: 'summative assessment.png',
        alt: '총괄 평가 신설 소개',
      },
      {
        title: '다양한 수업 도구 연동',
        src: 'Teaching materials.png',
        alt: '다양한 수업 도구 연동 소개',
      },
      {
        title: '안내 영상 및 매뉴얼 제공',
        src: 'FAQ.png',
        alt: '안내 영상 및 매뉴얼 제공 소개',
      },
    ],
  },
};

// ── 모바일 햄버거 메뉴 ──
const hamburger = document.querySelector('.top-nav__hamburger');
const menu = document.querySelector('.top-nav__menu');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── DOM refs ──
const consentCheck = document.getElementById('consentCheck');
const consentAccordion = document.getElementById('consentAccordion');
const consentDetail = document.getElementById('consentDetail');
const reviewForm = document.getElementById('reviewForm');
const reviewFormFields = document.getElementById('reviewFormFields');
const submitBtn = document.getElementById('submitBtn');
const commentList = document.getElementById('commentList');
const liveCount = document.getElementById('liveCount');
const featureInputs = document.querySelectorAll('input[name="feature"]');

const formInputs = reviewForm
  ? [...reviewForm.querySelectorAll('.text-input')]
  : [];

function getSelectedFeature() {
  const checked = document.querySelector('input[name="feature"]:checked');
  return checked ? checked.value : null;
}

function getSelectedFeatureLabel() {
  const key = getSelectedFeature();
  return key ? (FEATURE_LABELS[key] ?? '') : '';
}

function updateCommentPrefix() {
  const prefix = document.getElementById('commentPrefix');
  const prefixText = document.getElementById('commentPrefixText');
  const compose = document.getElementById('commentCompose');
  const label = getSelectedFeatureLabel();

  if (!prefix || !prefixText || !compose) return;

  if (label) {
    prefixText.textContent = label;
    prefix.hidden = false;
    compose.classList.add('has-prefix');
  } else {
    prefixText.textContent = '';
    prefix.hidden = true;
    compose.classList.remove('has-prefix');
  }
}

// ── 개인정보 동의 아코디언 ──
if (consentAccordion && consentDetail) {
  consentAccordion.addEventListener('click', () => {
    const expanded = consentAccordion.getAttribute('aria-expanded') === 'true';
    consentAccordion.setAttribute('aria-expanded', String(!expanded));
    consentDetail.hidden = expanded;
  });
}

// ── STEP 1 선택 + 동의 → STEP 2 폼 활성화 ──
function setFormEnabled(enabled) {
  formInputs.forEach((input) => {
    input.disabled = !enabled;
    if (enabled && input.id === 'comment') {
      input.placeholder = '선택한 기능명 아래에 기대평을 이어서 작성해 주세요.';
    } else if (!enabled && input.id === 'comment') {
      input.placeholder =
        'STEP 1에서 기능을 선택하고, 개인정보 수집·이용에 동의하시면 입력할 수 있어요.';
    }
  });

  if (submitBtn) submitBtn.disabled = !enabled;
  if (reviewForm) reviewForm.classList.toggle('is-enabled', enabled);

  const compose = document.getElementById('commentCompose');
  if (compose) compose.classList.toggle('is-enabled', enabled);

  const step2Block = document.getElementById('step2');
  if (step2Block) step2Block.classList.toggle('is-active', enabled);

  const step2Status = document.getElementById('step2Status');
  if (step2Status) {
    step2Status.classList.toggle('step-status--locked', !enabled);
    step2Status.classList.toggle('step-status--ready', enabled);
    step2Status.textContent = enabled
      ? '작성란이 활성화되었습니다. 아래에서 기대평을 입력해 주세요.'
      : 'STEP 1 기능 선택 및 개인정보 동의 후 작성 가능합니다.';
  }
}

function updateFormState() {
  const consent = consentCheck?.checked ?? false;
  const featureSelected = getSelectedFeature() !== null;
  updateCommentPrefix();
  setFormEnabled(consent && featureSelected);

  const consentBlock = document.querySelector('.consent-block');
  if (consentBlock) consentBlock.classList.toggle('is-complete', consent);
}

if (consentCheck) {
  consentCheck.addEventListener('change', updateFormState);
}

featureInputs.forEach((input) => {
  input.addEventListener('change', updateFormState);
});

// ── 유틸 ──
function maskName(name) {
  const trimmed = name.trim();
  if (!trimmed) return '익**';
  if (trimmed.length === 1) return `${trimmed}*`;
  return `${trimmed[0]}**`;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

function loadComments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComments(comments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

function updateLiveCount(count) {
  if (liveCount) liveCount.textContent = `실시간 ${count}개`;
}

function renderComments() {
  if (!commentList) return;

  const comments = loadComments().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  updateLiveCount(comments.length);
  commentList.innerHTML = '';

  comments.forEach((item) => {
    const featureLabel = item.featureLabel || FEATURE_LABELS[item.feature] || '';
    const featureTag = featureLabel
      ? `<span class="comment-card__feature">${escapeHtml(featureLabel)}</span>`
      : '';

    let bodyText = item.comment || '';
    if (featureLabel && bodyText.startsWith(featureLabel)) {
      bodyText = bodyText.slice(featureLabel.length).replace(/^\n+/, '');
    }

    const li = document.createElement('li');
    li.innerHTML = `
      <article class="comment-card">
        <header class="comment-card__header">
          <span class="comment-card__author">${escapeHtml(item.maskedName)}</span>
          <time class="comment-card__date" datetime="${item.date}">${item.date}</time>
        </header>
        ${featureTag}
        <p class="comment-card__body">${escapeHtml(bodyText)}</p>
      </article>
    `;
    commentList.appendChild(li);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showFormMessage(type, text) {
  const existing = reviewForm.querySelector('.form-message');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.className = `form-message form-message--${type}`;
  msg.textContent = text;
  reviewFormFields.insertAdjacentElement('afterend', msg);

  if (type === 'success') {
    setTimeout(() => msg.remove(), 4000);
  }
}

// ── 폼 제출 ──
if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedFeature = getSelectedFeature();
    if (!selectedFeature) {
      showFormMessage('error', 'STEP 1에서 기대 기능을 1개 선택해 주세요.');
      document.getElementById('step1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!consentCheck?.checked) {
      showFormMessage('error', '개인정보 수집·이용에 동의해 주세요.');
      return;
    }

    const honeypot = reviewForm.querySelector('[name="website"]');
    if (honeypot?.value) return;

    const office = document.getElementById('office').value.trim();
    const school = document.getElementById('school').value.trim();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const userComment = document.getElementById('comment').value.trim();
    const featureLabel = getSelectedFeatureLabel();
    const phoneDigits = normalizePhone(phone);

    if (!office || !school || !name || !phone || !userComment) {
      showFormMessage('error', '모든 항목을 입력해 주세요.');
      return;
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      showFormMessage('error', '연락처 형식을 확인해 주세요. (예: 010-0000-0000)');
      return;
    }

    if (userComment.length < 10) {
      showFormMessage('error', '기대평 본문은 10자 이상 작성해 주세요.');
      return;
    }

    const comments = loadComments();
    const alreadyJoined = comments.some(
      (c) => normalizePhone(c.phone) === phoneDigits
    );

    if (alreadyJoined) {
      showFormMessage('error', '이미 참여하셨습니다. 1인 1회만 참여 가능합니다.');
      return;
    }

    const submission = {
      office,
      school,
      name,
      phone: formatPhoneForGoogle(phone),
      featureLabel,
      comment: userComment,
    };

    setSubmitLoading(true);

    const googleResult = await submitToGoogleForm(submission);

    setSubmitLoading(false);

    if (!googleResult.ok) {
      showFormMessage(
        'error',
        googleResult.error?.message?.includes('설정')
          ? '설문 연동 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.'
          : '기대평 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      );
      return;
    }

    const now = new Date();
    comments.push({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      office,
      school,
      name,
      phone: phoneDigits,
      feature: selectedFeature,
      featureLabel,
      comment: userComment,
      maskedName: maskName(name),
      date: formatDate(now),
      createdAt: now.toISOString(),
    });

    saveComments(comments);
    renderComments();

    reviewForm.reset();
    consentCheck.checked = false;
    featureInputs.forEach((input) => {
      input.checked = false;
    });
    updateFormState();

    showFormMessage('success', '기대평이 등록되었습니다. 소중한 참여 감사합니다!');
    commentList?.closest('.comment-list-block')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ── 초기화 ──
updateFormState();
renderComments();

// ── 작성 예시 토글 ──
const exampleToggle1 = document.getElementById('exampleToggle1');
const exampleFull1 = document.getElementById('exampleFull1');
const examplePreview = document.querySelector('.example-card__preview');

if (exampleToggle1 && exampleFull1) {
  exampleToggle1.addEventListener('click', () => {
    const expanded = exampleToggle1.getAttribute('aria-expanded') === 'true';
    exampleToggle1.setAttribute('aria-expanded', String(!expanded));
    exampleFull1.hidden = expanded;
    if (examplePreview) examplePreview.hidden = !expanded;
    exampleToggle1.textContent = expanded ? '전체 보기 ▼' : '가리기 ▲';
  });
}

const exampleMoreToggle = document.getElementById('exampleMoreToggle');
const exampleMore = document.getElementById('exampleMore');

if (exampleMoreToggle && exampleMore) {
  exampleMoreToggle.addEventListener('click', () => {
    const expanded = exampleMoreToggle.getAttribute('aria-expanded') === 'true';
    exampleMoreToggle.setAttribute('aria-expanded', String(!expanded));
    exampleMore.hidden = expanded;
    exampleMoreToggle.textContent = expanded ? '예시 더보기 ▼' : '가리기 ▲';
  });
}

// ── 기능 상세 팝업 ──
const featureModal = document.getElementById('featureModal');
const featureModalBackdrop = document.getElementById('featureModalBackdrop');
const featureModalClose = document.getElementById('featureModalClose');
const featureModalTag = document.getElementById('featureModalTag');
const featureModalIcon = document.getElementById('featureModalIcon');
const featureModalTitle = document.getElementById('featureModalTitle');
const featureModalBody = document.getElementById('featureModalBody');
const featureModalMedia = document.getElementById('featureModalMedia');
const imageLightbox = document.getElementById('imageLightbox');
const imageLightboxBackdrop = document.getElementById('imageLightboxBackdrop');
const imageLightboxClose = document.getElementById('imageLightboxClose');
const imageLightboxImage = document.getElementById('imageLightboxImage');
const imageLightboxCaption = document.getElementById('imageLightboxCaption');
let lastFocusedElement = null;
let lightboxLastFocusedElement = null;

function openImageLightbox(src, alt) {
  if (!imageLightbox || !imageLightboxImage) return;

  lightboxLastFocusedElement = document.activeElement;
  imageLightboxImage.src = src;
  imageLightboxImage.alt = alt;
  if (imageLightboxCaption) {
    imageLightboxCaption.textContent = alt;
  }

  imageLightbox.hidden = false;
  imageLightbox.setAttribute('aria-hidden', 'false');
  imageLightboxClose?.focus();
}

function closeImageLightbox() {
  if (!imageLightbox) return;

  imageLightbox.hidden = true;
  imageLightbox.setAttribute('aria-hidden', 'true');
  if (imageLightboxImage) {
    imageLightboxImage.src = '';
  }
  lightboxLastFocusedElement?.focus();
}

function getFeatureImages(detail) {
  if (detail.images?.length) return detail.images;
  if (detail.image) {
    return [{ src: detail.image, alt: detail.imageAlt || detail.title }];
  }
  return [];
}

function bindFeatureModalZoomButtons() {
  if (!featureModalMedia) return;

  featureModalMedia.querySelectorAll('[data-lightbox-src]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openImageLightbox(btn.dataset.lightboxSrc, btn.dataset.lightboxAlt);
    });
  });
}

function renderFeatureModalShowcase(detail) {
  const items = detail.showcase || [];

  if (!items.length || !featureModalMedia) {
    featureModalMedia.innerHTML = '';
    featureModalMedia.hidden = true;
    featureModalMedia.classList.remove('feature-modal__media--showcase');
    return;
  }

  featureModalMedia.classList.add('feature-modal__media--showcase');
  featureModalMedia.innerHTML = `
    <div class="feature-modal__showcase">
      ${items
        .map(
          (item, index) => `
        <article class="feature-modal__showcase-card">
          <p class="feature-modal__showcase-title">${escapeHtml(item.title)}</p>
          <button
            type="button"
            class="feature-modal__zoom-btn"
            data-lightbox-src="${item.src}"
            data-lightbox-alt="${escapeHtml(item.alt || item.title)}"
            aria-label="${escapeHtml(item.title)} 이미지 크게 보기"
          >
            <img src="${item.src}" alt="${escapeHtml(item.alt || item.title)}" class="feature-modal__image" />
            <span class="feature-modal__zoom-hint">클릭하여 확대</span>
          </button>
        </article>
      `
        )
        .join('')}
    </div>
  `;
  featureModalMedia.hidden = false;
  bindFeatureModalZoomButtons();
}

function renderFeatureModalMedia(detail) {
  const images = getFeatureImages(detail);

  if (!featureModalMedia) return;

  featureModalMedia.classList.remove('feature-modal__media--showcase');

  if (!images.length) {
    featureModalMedia.innerHTML = '';
    featureModalMedia.hidden = true;
    return;
  }

  const gridClass = images.length > 1 ? ' feature-modal__media-grid' : '';

  featureModalMedia.innerHTML = `
    <div class="feature-modal__media-inner${gridClass}">
      ${images
        .map(
          (img, index) => `
        <button
          type="button"
          class="feature-modal__zoom-btn"
          data-lightbox-src="${img.src}"
          data-lightbox-alt="${escapeHtml(img.alt || detail.title)}"
          aria-label="이미지 ${index + 1} 크게 보기"
        >
          <img src="${img.src}" alt="${escapeHtml(img.alt || detail.title)}" class="feature-modal__image" />
          <span class="feature-modal__zoom-hint">클릭하여 확대</span>
        </button>
      `
        )
        .join('')}
    </div>
  `;
  featureModalMedia.hidden = false;
  bindFeatureModalZoomButtons();
}

function openFeatureModal(featureId) {
  const detail = FEATURE_DETAILS[featureId];
  if (!detail || !featureModal) return;

  closeImageLightbox();
  lastFocusedElement = document.activeElement;
  featureModalTag.textContent = detail.tag || '';
  featureModalIcon.textContent = detail.icon || '';
  featureModalTitle.textContent = detail.title;

  const header = featureModal.querySelector('.feature-modal__header');
  const hasShowcase = Boolean(detail.showcase?.length);
  header?.classList.toggle('feature-modal__header--title-only', hasShowcase);

  const dialog = featureModal.querySelector('.feature-modal__dialog');
  dialog?.classList.toggle('feature-modal__dialog--wide', hasShowcase);

  if (hasShowcase) {
    featureModalBody.innerHTML = '';
    featureModalBody.hidden = true;
    renderFeatureModalShowcase(detail);
  } else {
    featureModalBody.hidden = false;
    featureModalBody.innerHTML = detail.body || '';
    renderFeatureModalMedia(detail);
  }

  featureModal.hidden = false;
  featureModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  featureModalClose?.focus();
}

function closeFeatureModal() {
  if (!featureModal) return;

  closeImageLightbox();
  featureModal.hidden = true;
  featureModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  const dialog = featureModal.querySelector('.feature-modal__dialog');
  dialog?.classList.remove('feature-modal__dialog--wide');
  featureModal.querySelector('.feature-modal__header')?.classList.remove('feature-modal__header--title-only');
  if (featureModalBody) featureModalBody.hidden = false;

  lastFocusedElement?.focus();
}

document.querySelectorAll('.feature-detail-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openFeatureModal(btn.dataset.feature);
  });
});

featureModalClose?.addEventListener('click', closeFeatureModal);
featureModalBackdrop?.addEventListener('click', closeFeatureModal);

imageLightboxClose?.addEventListener('click', closeImageLightbox);
imageLightboxBackdrop?.addEventListener('click', closeImageLightbox);
imageLightboxImage?.addEventListener('click', closeImageLightbox);

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  if (imageLightbox && !imageLightbox.hidden) {
    closeImageLightbox();
    return;
  }

  if (featureModal && !featureModal.hidden) {
    closeFeatureModal();
  }
});
