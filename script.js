// Sayfa geçiş fonksiyonları
// Oturum kontrolü fonksiyonları
function isLoggedIn() {
    return localStorage.getItem('loggedUser') ? true : false;
}
function requireLogin() {
    if (!isLoggedIn()) {
        showLogin();
        return false;
    }
    return true;
}
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');
const testUploadSection = document.getElementById('test-upload-section');
const contactSection = document.getElementById('contact-section');

function hideAllSections() {
    homeSection.style.display = 'none';
    testListSection.style.display = 'none';
    testSection.style.display = 'none';
    aboutSection.style.display = 'none';
    registerSection.style.display = 'none';
    loginSection.style.display = 'none';
    testUploadSection.style.display = 'none';
    contactSection.style.display = 'none';
}

function showRegister() {
    hideAllSections();
    registerSection.style.display = 'block';
}
function showLogin() {
    hideAllSections();
    loginSection.style.display = 'block';
}
function showTestUpload() {
    if (!requireLogin()) return;
    hideAllSections();
    testUploadSection.style.display = 'block';
    renderQuestionsUpload();
}
function showContact() {
    hideAllSections();
    contactSection.style.display = 'block';
}
// Mevcut fonksiyonları güncelle
function showHome() {
    hideAllSections();
    homeSection.style.display = 'block';
}
function showTestList() {
    if (!requireLogin()) return;
    hideAllSections();
    testListSection.style.display = 'block';
    loadTestList();
}
function showTest() {
    hideAllSections();
    testSection.style.display = 'block';
    testTitle.textContent = tests[currentTestIndex].title;
    testContainer.innerHTML = '';
    resultContainer.innerHTML = '';
    submitBtn.disabled = false;
    tests[currentTestIndex].questions.forEach((q, i) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'question';
        qDiv.innerHTML = `<strong>${i+1}. ${q.question}</strong>`;
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        q.options.forEach((opt, j) => {
            const id = `q${i}_opt${j}`;
            optionsDiv.innerHTML += `
                <label>
                    <input type="radio" name="q${i}" value="${j}" id="${id}"> ${opt}
                </label>
            `;
        });
        qDiv.appendChild(optionsDiv);
        testContainer.appendChild(qDiv);
    });
}
function showAbout() {
    hideAllSections();
    aboutSection.style.display = 'block';
}

// window fonksiyonları
window.showRegister = showRegister;
window.showLogin = showLogin;
window.showTestUpload = showTestUpload;
window.showContact = showContact;
window.showTestList = showTestList;
window.showAbout = showAbout;

// Üye olma
document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const fullname = document.getElementById('reg-fullname').value;
    const city = document.getElementById('reg-city').value;
    const district = document.getElementById('reg-district').value;
    const school = document.getElementById('reg-school').value;
    const phone = document.getElementById('reg-phone').value;
    const timezone = document.getElementById('reg-timezone').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    if (!fullname || !city || !district || !email || !password) {
        document.getElementById('register-message').textContent = 'Lütfen tüm zorunlu alanları doldurun!';
        return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        document.getElementById('register-message').textContent = 'Bu eposta ile zaten kayıt olunmuş!';
        return;
    }
    users.push({fullname, city, district, school, phone, timezone, email, password});
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('register-message').textContent = 'Kayıt başarılı!';
    setTimeout(showLogin, 1200);
};

// Giriş yapma
document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email && u.password === password)) {
        localStorage.setItem('loggedUser', email);
        document.getElementById('login-message').textContent = 'Giriş başarılı!';
        setTimeout(showHome, 1200);
    } else {
        document.getElementById('login-message').textContent = 'E-posta veya şifre yanlış!';
    }
};

// Test yükleme
let uploadQuestions = [];
function renderQuestionsUpload() {
    const container = document.getElementById('questions-upload');
    container.innerHTML = '';
    uploadQuestions.forEach((q, idx) => {
        let div = document.createElement('div');
        div.className = 'question-upload';
        // Fotoğraf inputu
        let inputImgLabel = document.createElement('label');
        inputImgLabel.className = 'custom-file-label';
        inputImgLabel.innerHTML = '<span>Fotoğraf Seç</span>';
        let inputImg = document.createElement('input');
        inputImg.type = 'file';
        inputImg.accept = 'image/*';
        inputImg.className = 'question-image-input';
        inputImg.style.display = 'none';
        inputImgLabel.appendChild(inputImg);
        inputImgLabel.onclick = () => inputImg.click();
        div.appendChild(inputImgLabel);
        let imgPrev = document.createElement('img');
        imgPrev.className = 'question-image-preview';
        imgPrev.style.display = q.image ? 'block' : 'none';
        if (q.image) imgPrev.src = q.image;
        div.appendChild(imgPrev);
        inputImg.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    uploadQuestions[idx].image = ev.target.result;
                    imgPrev.src = uploadQuestions[idx].image;
                    imgPrev.style.display = 'block';
                    inputImg.value = '';
                };
                reader.readAsDataURL(file);
            }
        };
        div.appendChild(document.createElement('br'));
        // Sadece şık seçimi (A, B, C, D)
        const labels = ['A', 'B', 'C', 'D'];
        let selectAns = document.createElement('select');
        selectAns.onchange = e => updateAnswer(idx,e.target.value);
        for (let i = 0; i < 4; i++) {
            let opt = document.createElement('option');
            opt.value = i;
            opt.textContent = labels[i];
            if (q.answer==i) opt.selected = true;
            selectAns.appendChild(opt);
        }
        div.appendChild(document.createTextNode('Doğru şık: '));
        div.appendChild(selectAns);
        // Sil butonu
        let btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.textContent = 'Sil';
        btnDel.onclick = () => removeQuestion(idx);
        div.appendChild(btnDel);
        container.appendChild(div);
        container.appendChild(document.createElement('hr'));
    });
}
document.getElementById('add-question-btn').onclick = function() {
    uploadQuestions.push({question:'',options:['','','',''],answer:0,image:null});
    renderQuestionsUpload();
};
window.updateQuestion = function(idx, val) {
    uploadQuestions[idx].question = val;
};
window.updateOption = function(idx, optIdx, val) {
    uploadQuestions[idx].options[optIdx] = val;
};
window.updateAnswer = function(idx, val) {
    uploadQuestions[idx].answer = parseInt(val);
};
window.removeQuestion = function(idx) {
    uploadQuestions.splice(idx,1);
    renderQuestionsUpload();
};
document.getElementById('test-upload-form').onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('test-title-input').value;
    if (!title || uploadQuestions.length === 0) {
        document.getElementById('upload-message').textContent = 'Başlık ve en az bir soru gerekli!';
        return;
    }
    for (let q of uploadQuestions) {
        if (!q.image) {
            document.getElementById('upload-message').textContent = 'Her soru için fotoğraf eklenmeli!';
            return;
        }
    }
    let userTests = JSON.parse(localStorage.getItem('userTests') || '[]');
    userTests.push({title,questions:JSON.parse(JSON.stringify(uploadQuestions))});
    localStorage.setItem('userTests', JSON.stringify(userTests));
    uploadQuestions = [];
    renderQuestionsUpload();
    document.getElementById('test-title-input').value = '';
    document.getElementById('upload-message').textContent = 'Test başarıyla yayınlandı!';
    setTimeout(showTestList, 1200);
};

// Test yayınlama fonksiyonunda test linki oluşturma ve gösterme
document.getElementById('test-upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('test-title-input').value.trim();
    // Soruları ve cevapları topla (örnek kod, kendi yapına göre uyarlayabilirsin)
    const questions = []; // ...soruları burada topla...
    // Testi localStorage'a kaydet
    let tests = JSON.parse(localStorage.getItem('tests') || '[]');
    // Teste benzersiz bir id ver
    const testId = 'test-' + Date.now();
    tests.push({ id: testId, title, questions });
    localStorage.setItem('tests', JSON.stringify(tests));
    // Link oluştur
    const link = `${window.location.origin}${window.location.pathname}?test=${testId}`;
    document.getElementById('upload-message').innerHTML = `
        Test başarıyla yayınlandı!<br>
        <input type="text" value="${link}" id="test-link" readonly style="width:80%;margin:8px 0;">
        <button onclick="navigator.clipboard.writeText(document.getElementById('test-link').value)">Bağlantıyı Kopyala</button>
        <br>Bu bağlantıyı paylaşarak başkalarının testinizi çözmesini sağlayabilirsiniz.
    `;
    this.reset();
});

// Sayfa yüklenince test parametresi varsa ilgili testi göster
window.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const testId = params.get('test');
    if (testId) {
        let tests = JSON.parse(localStorage.getItem('tests') || '[]');
        const test = tests.find(t => t.id === testId);
        if (test) {
            // Testi çözme ekranına yönlendir
            showTest(test);
        }
    }
});

// İletişim formu
document.getElementById('contact-form').onsubmit = function(e) {
    e.preventDefault();
    document.getElementById('contact-message-result').textContent = 'Mesajınız iletildi!';
    setTimeout(()=>{
        document.getElementById('contact-message-result').textContent = '';
        showHome();
    }, 1500);
};

let defaultTests = [
    {
        title: "Genel Kültür Testi",
        questions: [
            {
                question: "Türkiye'nin başkenti neresidir?",
                options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
                answer: 1
            },
            {
                question: "En büyük gezegen hangisidir?",
                options: ["Mars", "Venüs", "Jüpiter", "Dünya"],
                answer: 2
            },
            {
                question: "Su kaç derecede kaynar?",
                options: ["50°C", "100°C", "150°C", "200°C"],
                answer: 1
            }
        ]
    },
    {
        title: "Matematik Testi",
        questions: [
            {
                question: "5 + 7 kaçtır?",
                options: ["10", "11", "12", "13"],
                answer: 2
            },
            {
                question: "Bir üçgenin iç açıları toplamı kaç derecedir?",
                options: ["90", "180", "270", "360"],
                answer: 1
            },
            {
                question: "9 x 6 kaçtır?",
                options: ["54", "45", "36", "63"],
                answer: 0
            }
        ]
    }
];

let currentTestIndex = 0;
let testTimer = null;
let timerSeconds = 0;

const testContainer = document.getElementById('test-container');
const submitBtn = document.getElementById('submit-btn');
const resultContainer = document.getElementById('result-container');
const testTitle = document.getElementById('test-title');
const testListSection = document.getElementById('test-list-section');
const testList = document.getElementById('test-list');
const testSection = document.getElementById('test-section');
const aboutSection = document.getElementById('about-section');
const testSecBtn = document.getElementById('testSecBtn');
const hakkindaBtn = document.getElementById('hakkindaBtn');
const homeSection = document.getElementById('home-section');

function showHome() {
    homeSection.style.display = 'block';
    testListSection.style.display = 'none';
    testSection.style.display = 'none';
    aboutSection.style.display = 'none';
}

function getAllTests() {
    let userTests = JSON.parse(localStorage.getItem('userTests') || '[]');
    return [...defaultTests, ...userTests];
}
function loadTestList() {
    testList.innerHTML = '';
    const allTests = getAllTests();
    allTests.forEach((test, idx) => {
        const li = document.createElement('li');
        li.textContent = test.title;
        li.style.position = 'relative';
        li.onclick = () => {
            currentTestIndex = idx;
            showTest();
        };
        // Sadece kullanıcıya ait testlerde sil butonu göster
        let userTests = JSON.parse(localStorage.getItem('userTests') || '[]');
        if (idx >= defaultTests.length) {
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Sil';
            delBtn.style.position = 'absolute';
            delBtn.style.right = '8px';
            delBtn.style.top = '50%';
            delBtn.style.transform = 'translateY(-50%)';
            delBtn.style.background = '#e53935';
            delBtn.style.color = '#fff';
            delBtn.style.border = 'none';
            delBtn.style.borderRadius = '5px';
            delBtn.style.padding = '4px 12px';
            delBtn.style.cursor = 'pointer';
            delBtn.onclick = function(e) {
                e.stopPropagation();
                userTests.splice(idx - defaultTests.length, 1);
                localStorage.setItem('userTests', JSON.stringify(userTests));
                loadTestList();
            };
            li.appendChild(delBtn);
        }
        testList.appendChild(li);
    });
}

function renderTestList() {
    const testList = document.getElementById('test-list');
    testList.innerHTML = '';
    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    tests.forEach(test => {
        const li = document.createElement('li');
        li.className = 'test-list-item';
        li.innerHTML = `
            <span>${test.title}</span>
            <button class="copy-link-btn" title="Linki Kopyala" onclick="copyTestLink('${test.id}')">
                <svg width="20" height="20" style="vertical-align:middle"><rect width="20" height="20" rx="4" fill="#1976d2"/><text x="10" y="15" text-anchor="middle" fill="#fff" font-size="12">🔗</text></svg>
            </button>
            <button class="delete-test-btn" title="Testi Sil" onclick="deleteTest('${test.id}')">🗑️</button>
        `;
        testList.appendChild(li);
    });
}

function copyTestLink(testId) {
    const link = `${window.location.origin}${window.location.pathname}?test=${testId}`;
    navigator.clipboard.writeText(link);
    alert("Test bağlantısı kopyalandı!");
}

function deleteTest(testId) {
    let tests = JSON.parse(localStorage.getItem('tests') || '[]');
    tests = tests.filter(t => t.id !== testId);
    localStorage.setItem('tests', JSON.stringify(tests));
    renderTestList();
}

// Testi gösterme
function showTest() {
    homeSection.style.display = 'none';
    testListSection.style.display = 'none';
    aboutSection.style.display = 'none';
    testSection.style.display = 'block';
    const allTests = getAllTests();
    testTitle.textContent = allTests[currentTestIndex].title;
    testContainer.innerHTML = '';
    resultContainer.innerHTML = '';
    submitBtn.disabled = false;
    // Süreyi başlat
    timerSeconds = 120 * 60;
    updateTimer();
    if (testTimer) clearInterval(testTimer);
    testTimer = setInterval(() => {
        timerSeconds--;
        updateTimer();
        if (timerSeconds <= 0) {
            clearInterval(testTimer);
            submitBtn.disabled = true;
            showResult(true);
        }
    }, 1000);
    const labels = ['A', 'B', 'C', 'D'];
    allTests[currentTestIndex].questions.forEach((q, i) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'question';
        let html = '';
        if (q.image) {
            html += `<img src='${q.image}' class='question-image-preview clickable-image' alt='Soru görseli'><br>`;
        }
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        q.options.forEach((opt, j) => {
            const id = `q${i}_opt${j}`;
            optionsDiv.innerHTML += `
                <label>
                    <input type="radio" name="q${i}" value="${j}" id="${id}"> <b>${labels[j]}</b>)
                </label>
            `;
        });
        qDiv.innerHTML = html;
        qDiv.appendChild(optionsDiv);
        testContainer.appendChild(qDiv);
    });
    // Büyütülebilir görsel için event ekle
    setTimeout(() => {
        document.querySelectorAll('.clickable-image').forEach(function(img) {
            img.onclick = function() {
                showImageModal(img.src);
            };
        });
    }, 100);
// Süre göstergesi
function updateTimer() {
    const timerDiv = document.getElementById('timer-container');
    if (!timerDiv) return;
    let dk = Math.floor(timerSeconds / 60);
    let sn = timerSeconds % 60;
    timerDiv.textContent = `Kalan Süre: ${dk.toString().padStart(2,'0')}:${sn.toString().padStart(2,'0')}`;
    if (timerSeconds <= 0) {
        timerDiv.textContent = 'Süre doldu!';
    }
}
}

// Görsel modalı
function showImageModal(src) {
    let modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `<div class='image-modal-content'><img src='${src}'><span class='image-modal-close'>&times;</span></div>`;
    document.body.appendChild(modal);
    document.querySelector('.image-modal-close').onclick = function() {
        modal.remove();
    };
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
}

function showResult() {
    const allTests = getAllTests();
    let correct = 0;
    let total = allTests[currentTestIndex].questions.length;
    allTests[currentTestIndex].questions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && parseInt(selected.value) === q.answer) {
            correct++;
        }
    });
    resultContainer.innerHTML = `<b>Doğru: ${correct}</b> / <b>Toplam: ${total}</b>`;
    submitBtn.disabled = true;
    if (testTimer) clearInterval(testTimer);
}

function showTestList() {
    homeSection.style.display = 'none';
    testSection.style.display = 'none';
    aboutSection.style.display = 'none';
    testListSection.style.display = 'block';
    loadTestList();
}

function showAbout() {
    homeSection.style.display = 'none';
    testSection.style.display = 'none';
    testListSection.style.display = 'none';
    aboutSection.style.display = 'block';
}

testSecBtn.addEventListener('click', showTestList);
hakkindaBtn.addEventListener('click', showAbout);
submitBtn.addEventListener('click', showResult);

// Ana sayfa kutularından tıklama için window fonksiyonları
window.showTestList = showTestList;
window.showAbout = showAbout;

window.onload = showHome;
