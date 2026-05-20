/* ═══════════════════════════════════════════════════════
   AAC — AI Academic Assistant Chatbot
   JavaScript  ·  Pure Vanilla JS  ·  No Libraries
   ═══════════════════════════════════════════════════════ */

'use strict';

// ─── STATE ────────────────────────────────────────────────
const state = {
  currentUser: null,
  chatMessages: [],
  chatHistory: [],
  uploadedFiles: [],
  kbEntries: [],
  questionCount: 0,
  fileCount: 0,
};

// ─── MOCK DB (localStorage) ───────────────────────────────
const DB = {
  users: [
    { id: 1, name: 'Ahmed Hassan', email: 'student@demo.com', password: 'demo123', role: 'student' },
    { id: 2, name: 'Administrator', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  ],

  save() {
    const saved = JSON.parse(localStorage.getItem('aac_users') || 'null');
    if (!saved) localStorage.setItem('aac_users', JSON.stringify(this.users));
  },

  load() {
    const saved = JSON.parse(localStorage.getItem('aac_users') || 'null');
    if (saved) this.users = saved;
  },

  addUser(user) {
    this.users.push(user);
    localStorage.setItem('aac_users', JSON.stringify(this.users));
  },

  findUser(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getStudents() {
    return this.users.filter(u => u.role === 'student');
  }
};

// ─── AI RESPONSES (simulated NLP) ─────────────────────────
const AI_KNOWLEDGE = {
  'machine learning': 'Machine Learning (ML) is a subset of AI that enables systems to learn automatically from data without being explicitly programmed. It includes three main types: **Supervised Learning** (labeled data, e.g., classification/regression), **Unsupervised Learning** (unlabeled data, e.g., clustering), and **Reinforcement Learning** (reward-based). Key algorithms include Decision Trees, Random Forests, SVMs, and Neural Networks.',
  'gradient descent': 'Gradient Descent is an optimization algorithm used to minimize a loss/cost function. It works by iteratively moving parameters in the direction of the negative gradient (steepest descent). Variants include: Batch GD (uses all data), Stochastic GD (one sample), and Mini-batch GD (subset). Learning rate α controls the step size — too large causes oscillation, too small slows convergence.',
  'neural network': 'Neural Networks are computing systems inspired by the biological neural networks in human brains. They consist of: **Input Layer** (receives data), **Hidden Layers** (learn features), and **Output Layer** (prediction). Each neuron applies a weight, bias, and activation function (ReLU, Sigmoid, Tanh). Training uses backpropagation + gradient descent.',
  'osi model': 'The OSI (Open Systems Interconnection) model is a conceptual 7-layer framework for network communication: 1. **Physical** (bits/cables), 2. **Data Link** (frames/MAC), 3. **Network** (packets/IP), 4. **Transport** (segments/TCP-UDP), 5. **Session** (connection management), 6. **Presentation** (encryption/encoding), 7. **Application** (HTTP/FTP/DNS). Mnemonic: "Please Do Not Throw Sausage Pizza Away".',
  'tcp': 'TCP (Transmission Control Protocol) provides **reliable, ordered, connection-oriented** communication. The 3-way handshake: (1) SYN — client sends synchronize, (2) SYN-ACK — server acknowledges, (3) ACK — client confirms. TCP ensures data integrity via sequence numbers, acknowledgments, and retransmission on packet loss. Port range: 0–65535.',
  'big o': 'Big O notation describes the **time/space complexity** of an algorithm as input size n grows. Common complexities: O(1) constant, O(log n) logarithmic (binary search), O(n) linear (loop), O(n log n) linearithmic (merge sort), O(n²) quadratic (bubble sort), O(2ⁿ) exponential. Always analyze worst-case unless specified otherwise.',
  'binary search': 'Binary Search is an efficient O(log n) algorithm that finds an element in a **sorted array** by repeatedly halving the search space. Compare the middle element: if equal → found; if target < mid → search left half; if target > mid → search right half. Much faster than linear search O(n) for large datasets.',
  'data structure': 'Common data structures: **Array** (O(1) access, O(n) insert), **Linked List** (O(1) insert, O(n) search), **Stack** (LIFO, push/pop), **Queue** (FIFO, enqueue/dequeue), **Hash Table** (O(1) avg operations), **Binary Tree** (hierarchical storage), **Graph** (nodes + edges). Choose based on your operation frequency requirements.',
  'recursion': 'Recursion is a technique where a function calls itself to solve smaller subproblems. Every recursive function needs: (1) **Base Case** — termination condition, (2) **Recursive Case** — function calling itself with reduced input. Examples: factorial(n) = n × factorial(n-1), Fibonacci, tree traversal. Stack overflow occurs if base case is missing.',
  'database': 'A Database Management System (DBMS) organizes and manages structured data. Key concepts: **Tables** (relations), **Primary Key** (unique identifier), **Foreign Key** (references another table), **SQL** (Structured Query Language for CRUD: SELECT, INSERT, UPDATE, DELETE), **Normalization** (reducing redundancy via 1NF→2NF→3NF), **ACID** properties (Atomicity, Consistency, Isolation, Durability).',
  'sorting': 'Sorting algorithms ranked by efficiency: **Bubble Sort** O(n²) — simple but slow; **Selection Sort** O(n²); **Insertion Sort** O(n²) best O(n) for nearly sorted; **Merge Sort** O(n log n) stable; **Quick Sort** O(n log n) avg, O(n²) worst; **Heap Sort** O(n log n). For most practical uses, Quick Sort or Merge Sort is preferred.',
  'operating system': 'An Operating System (OS) manages hardware and provides services for programs. Key components: **Process Management** (scheduling: FCFS, SJF, Round Robin), **Memory Management** (paging, segmentation, virtual memory), **File System** (FAT32, NTFS, ext4), **I/O Management**, and **Security**. Examples: Windows, Linux, macOS.',
  'polymorphism': 'Polymorphism (OOP) means "many forms." Types: (1) **Compile-time/Static** — Method Overloading (same name, different parameters), (2) **Runtime/Dynamic** — Method Overriding (subclass redefines parent method). Enables flexibility and code reuse. Core to OOP alongside Encapsulation, Inheritance, and Abstraction.',
  'default': null
};

function getAIResponse(question) {
  const q = question.toLowerCase();
  for (const [key, response] of Object.entries(AI_KNOWLEDGE)) {
    if (key !== 'default' && q.includes(key)) {
      return response;
    }
  }
  // Generic smart response
  const generics = [
    `That's a great academic question! In the context of **${question}**, this topic is fundamental to your BSAI curriculum. The core concepts involve understanding the underlying principles, their practical applications, and how they connect to real-world systems. I recommend reviewing your lecture slides and consulting standard references like your course textbook for detailed formulas and examples.`,
    `Excellent question about **${question}**! This is an important concept in computer science and AI. The key is to understand both the theoretical foundations and practical implementations. Break it down into smaller concepts, understand each component, and then see how they integrate. Would you like me to explain any specific aspect in more detail?`,
    `**${question}** is a core topic you'll encounter throughout your BSAI degree. The fundamental idea revolves around structured problem-solving, algorithm design, and systematic analysis. Focus on understanding the "why" behind concepts, not just the "how" — this will help you in both assignments and exams.`,
  ];
  return generics[Math.floor(Math.random() * generics.length)];
}

// ─── CANVAS PARTICLES ─────────────────────────────────────
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.1,
  }));

  // Floating orbs
  const orbs = [
    { x: 0.15, y: 0.3, r: 220, color: 'rgba(124,106,245,0.07)' },
    { x: 0.85, y: 0.6, r: 180, color: 'rgba(232,121,249,0.05)' },
    { x: 0.5, y: 0.8, r: 150, color: 'rgba(56,189,248,0.04)' },
  ];

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.008;

    // Draw orbs
    orbs.forEach((orb, i) => {
      const ox = orb.x * canvas.width + Math.sin(t + i) * 30;
      const oy = orb.y * canvas.height + Math.cos(t * 0.7 + i) * 20;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${p.alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,106,245,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// ─── CURSOR ──────────────────────────────────────────────
function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.addEventListener('mousedown', () => {
    dot.style.transform = 'translate(-50%,-50%) scale(0.6)';
    ring.style.width = '20px'; ring.style.height = '20px';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.width = '32px'; ring.style.height = '32px';
  });

  // Hover effect on interactive elements
  document.querySelectorAll('button, a, input, textarea, .s-chip, .kb-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '50px'; ring.style.height = '50px';
      ring.style.borderColor = 'rgba(167,139,250,0.8)';
      dot.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '32px'; ring.style.height = '32px';
      ring.style.borderColor = 'rgba(167,139,250,0.5)';
      dot.style.opacity = '1';
    });
  });
}

// ─── PAGE ROUTING ─────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) page.classList.add('active');
  window.scrollTo(0, 0);

  // Init canvas on landing
  if (id === 'landing') {
    setTimeout(initCanvas, 50);
  }
}

// ─── AUTH ─────────────────────────────────────────────────
function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const cpass = document.getElementById('reg-cpass').value;
  const msgEl = document.getElementById('reg-msg');

  msgEl.className = 'form-msg';
  if (!name || !email || !pass || !cpass) {
    return showMsg(msgEl, 'error', 'Please fill in all fields.');
  }
  if (!email.includes('@')) {
    return showMsg(msgEl, 'error', 'Enter a valid email address.');
  }
  if (pass.length < 6) {
    return showMsg(msgEl, 'error', 'Password must be at least 6 characters.');
  }
  if (pass !== cpass) {
    return showMsg(msgEl, 'error', 'Passwords do not match.');
  }
  if (DB.findUser(email)) {
    return showMsg(msgEl, 'error', 'An account with this email already exists.');
  }

  const newUser = {
    id: Date.now(),
    name, email, password: pass, role: 'student',
    joined: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  };
  DB.addUser(newUser);
  showMsg(msgEl, 'success', '✓ Account created! Redirecting...');
  setTimeout(() => loginUser(newUser), 1000);
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const msgEl = document.getElementById('login-msg');

  msgEl.className = 'form-msg';
  if (!email || !pass) {
    return showMsg(msgEl, 'error', 'Please enter your email and password.');
  }
  const user = DB.findUser(email);
  if (!user || user.password !== pass) {
    return showMsg(msgEl, 'error', 'Invalid email or password.');
  }
  showMsg(msgEl, 'success', '✓ Welcome back! Loading dashboard...');
  setTimeout(() => loginUser(user), 700);
}

function demoLogin(role) {
  if (role === 'student') {
    document.getElementById('login-email').value = 'student@demo.com';
    document.getElementById('login-pass').value = 'demo123';
  } else {
    document.getElementById('login-email').value = 'admin@demo.com';
    document.getElementById('login-pass').value = 'admin123';
  }
  setTimeout(doLogin, 200);
}

function loginUser(user) {
  state.currentUser = user;
  document.getElementById('login-msg').textContent = '';

  if (user.role === 'admin') {
    showPage('admin-dashboard');
    initAdminDashboard();
  } else {
    showPage('student-dashboard');
    initStudentDashboard();
  }
}

function doLogout() {
  state.currentUser = null;
  state.chatMessages = [];
  state.questionCount = 0;
  document.getElementById('chat-window').innerHTML = '';
  showPage('landing');
  showToast('You have been logged out.');
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ─── STUDENT DASHBOARD INIT ───────────────────────────────
function initStudentDashboard() {
  const user = state.currentUser;
  document.getElementById('sb-user-name').textContent = user.name;
  document.getElementById('cw-name').textContent = user.name.split(' ')[0];

  // Profile
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('pf-name').value = user.name;
  document.getElementById('pf-email').value = user.email;
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('profile-avatar').textContent = initials;

  // Reset chat to welcome screen
  const chatWin = document.getElementById('chat-window');
  chatWin.innerHTML = `
    <div class="chat-welcome">
      <div class="cw-icon">◈</div>
      <h3>Hello, ${user.name.split(' ')[0]}!</h3>
      <p>I'm your AI Academic Assistant. Ask me about any academic topic, subject, or concept.</p>
      <div class="suggestion-chips">
        <button class="s-chip" onclick="sendSuggestion(this)">Explain Machine Learning basics</button>
        <button class="s-chip" onclick="sendSuggestion(this)">What is the OSI model?</button>
        <button class="s-chip" onclick="sendSuggestion(this)">Summarize Big O notation</button>
        <button class="s-chip" onclick="sendSuggestion(this)">How does TCP/IP work?</button>
      </div>
    </div>`;

  // Switch to chat tab
  const chatLink = document.querySelector('#student-dashboard .sb-link');
  if (chatLink) switchTab(chatLink, 'chat-tab', 'student-dashboard');

  renderHistory();
}

// ─── ADMIN DASHBOARD INIT ─────────────────────────────────
function initAdminDashboard() {
  renderUsersTable();
  document.getElementById('asg-users').textContent = DB.getStudents().length;
}

// ─── SIDEBAR TOGGLE ───────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}
function toggleAdminSidebar() {
  document.getElementById('admin-sidebar').classList.toggle('collapsed');
}

// ─── TAB SWITCHING ────────────────────────────────────────
function switchTab(linkEl, tabId, dashId) {
  // Update link active states
  document.querySelectorAll(`#${dashId} .sb-link`).forEach(l => l.classList.remove('active'));
  linkEl.classList.add('active');

  // Show target tab
  document.querySelectorAll(`#${dashId} .tab-content`).forEach(t => t.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');

  return false;
}

// ─── CHAT ─────────────────────────────────────────────────
function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';

  // Remove welcome screen if present
  const welcome = document.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  appendMessage('user', text);
  state.questionCount++;
  document.getElementById('stat-questions').textContent = state.questionCount;

  // Save to history
  const historyEntry = { id: Date.now(), question: text, time: new Date() };
  state.chatMessages.push(historyEntry);

  // Show typing
  showTyping();

  // Simulate AI response delay
  const delay = 800 + Math.random() * 800;
  setTimeout(() => {
    hideTyping();
    const response = getAIResponse(text);
    appendMessage('bot', response);

    // Save complete exchange to history
    historyEntry.response = response;
    state.chatHistory.push(historyEntry);
    renderHistory();
  }, delay);
}

function sendSuggestion(btn) {
  const text = btn.textContent;
  document.getElementById('chat-input').value = text;
  sendMessage();
}

function appendMessage(role, text) {
  const chatWin = document.getElementById('chat-window');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${role === 'user' ? 'user-msg' : ''}`;

  const user = state.currentUser;
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Format bold text
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  if (role === 'bot') {
    msg.innerHTML = `
      <div class="msg-avatar bot-avatar">◈</div>
      <div>
        <div class="msg-bubble bot-bubble">${formatted}</div>
        <div class="msg-time">${now}</div>
      </div>`;
  } else {
    msg.innerHTML = `
      <div class="msg-avatar user-avatar">${initials}</div>
      <div>
        <div class="msg-bubble user-bubble">${text}</div>
        <div class="msg-time">${now}</div>
      </div>`;
  }

  chatWin.appendChild(msg);
  chatWin.scrollTop = chatWin.scrollHeight;
}

function showTyping() {
  const chatWin = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = 'chat-msg'; div.id = 'typing-bubble';
  div.innerHTML = `
    <div class="msg-avatar bot-avatar">◈</div>
    <div class="msg-bubble bot-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  chatWin.appendChild(div);
  chatWin.scrollTop = chatWin.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typing-bubble');
  if (t) t.remove();
}

function clearChat() {
  const chatWin = document.getElementById('chat-window');
  const user = state.currentUser;
  chatWin.innerHTML = `
    <div class="chat-welcome">
      <div class="cw-icon">◈</div>
      <h3>Hello, ${user ? user.name.split(' ')[0] : 'there'}!</h3>
      <p>I'm your AI Academic Assistant. Ask me about any academic topic, subject, or concept.</p>
      <div class="suggestion-chips">
        <button class="s-chip" onclick="sendSuggestion(this)">Explain Machine Learning basics</button>
        <button class="s-chip" onclick="sendSuggestion(this)">What is the OSI model?</button>
        <button class="s-chip" onclick="sendSuggestion(this)">Summarize Big O notation</button>
        <button class="s-chip" onclick="sendSuggestion(this)">How does TCP/IP work?</button>
      </div>
    </div>`;
  showToast('New chat started.');
}

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function handleChatFileAttach(input) {
  if (input.files[0]) {
    showToast(`Attached: ${input.files[0].name}`);
  }
}

// ─── CHAT HISTORY ─────────────────────────────────────────
function renderHistory() {
  const list = document.getElementById('history-list');
  if (state.chatHistory.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        <div class="he-icon">🕓</div>
        <p>Your chat history will appear here after your first conversation.</p>
      </div>`;
    return;
  }

  list.innerHTML = state.chatHistory.map(h => `
    <div class="history-card" data-id="${h.id}">
      <div class="hc-meta">
        <span class="hc-date">${new Date(h.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="hc-q">${escHtml(h.question)}</div>
      <div class="hc-a">${(h.response || '').replace(/\*\*(.*?)\*\*/g, '$1')}</div>
    </div>`).reverse().join('');
}

function filterHistory(query) {
  const cards = document.querySelectorAll('.history-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
  });
}

// ─── FILE UPLOAD & SUMMARIZATION ──────────────────────────
let currentFile = null;

function dropFile(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
  document.getElementById('upload-zone').classList.remove('dragover');
}
function dragOver(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.add('dragover');
}
function dragLeave() {
  document.getElementById('upload-zone').classList.remove('dragover');
}
function handleFileUpload(input) {
  if (input.files[0]) processFile(input.files[0]);
}

function processFile(file) {
  if (!file.name.match(/\.(pdf|txt)$/i)) {
    showToast('Only PDF and TXT files are supported.');
    return;
  }
  currentFile = file;
  document.getElementById('fp-name').textContent = file.name;
  document.getElementById('fp-size').textContent = formatFileSize(file.size);
  document.getElementById('file-preview').classList.remove('hidden');
  document.getElementById('summary-output').classList.add('hidden');
}

function removeFile() {
  currentFile = null;
  document.getElementById('file-preview').classList.add('hidden');
  document.getElementById('summary-output').classList.add('hidden');
  document.getElementById('file-upload').value = '';
}

function summarizeFile() {
  if (!currentFile) return;
  const soBody = document.getElementById('so-body');
  const summaryOut = document.getElementById('summary-output');
  summaryOut.classList.remove('hidden');
  soBody.innerHTML = '<div style="display:flex;gap:6px;align-items:center;color:var(--text-mute)"><div style="width:14px;height:14px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div> Analyzing your notes...</div>';

  setTimeout(() => {
    const summaries = [
      `This document covers foundational concepts in **computer science and artificial intelligence**. Key topics include algorithm design, data structures, and computational complexity theory. The notes discuss **Big O notation** for analyzing algorithm efficiency, various sorting and searching techniques, and object-oriented programming principles including inheritance, polymorphism, and encapsulation.

The material also explores **machine learning fundamentals**: supervised vs. unsupervised learning, neural network architectures, and training methodologies including gradient descent optimization. Network communication is discussed via the OSI model's 7-layer architecture and TCP/IP protocol operations.

**Key takeaways:** (1) Algorithm efficiency is measured in time and space complexity. (2) ML models learn patterns from data rather than explicit programming. (3) Network communication relies on layered protocol stacks for reliability and abstraction.`,

      `The uploaded notes contain lecture material on **database management systems and software engineering**. Core topics include relational database design (normalization to 3NF), SQL query optimization, and ACID transaction properties.

Software engineering concepts cover the SDLC (Software Development Life Cycle), including requirements analysis, design patterns (MVC, Singleton, Observer), testing methodologies (unit, integration, system testing), and agile development principles.

**Summary Points:** Entity-Relationship diagrams model database schemas. Indexes improve query performance. Agile focuses on iterative delivery and customer collaboration. Design patterns solve recurring software design problems.`,

      `Your notes summarize **artificial intelligence and deep learning** topics. Covered material includes search algorithms (BFS, DFS, A*), knowledge representation, expert systems, and natural language processing fundamentals.

Deep learning sections explain **Convolutional Neural Networks (CNNs)** for image processing, **Recurrent Neural Networks (RNNs/LSTMs)** for sequential data, and transformer architectures. Training techniques include dropout regularization, batch normalization, and learning rate scheduling.

**Key insights:** CNNs excel at spatial feature extraction. LSTMs handle long-range dependencies in sequences. Transformers use self-attention to process all tokens simultaneously, enabling parallelization.`,
    ];
    soBody.innerHTML = summaries[Math.floor(Math.random() * summaries.length)].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Add to uploads list
    addToUploadedList(currentFile);
    state.fileCount++;
    document.getElementById('stat-files').textContent = state.fileCount;
    showToast('Summary generated successfully!');
  }, 2000);
}

function addToUploadedList(file) {
  const list = document.getElementById('uploaded-list');
  const emptyEl = list.querySelector('.ul-empty');
  if (emptyEl) emptyEl.remove();

  const item = document.createElement('div');
  item.className = 'ul-item';
  item.innerHTML = `
    <span>📄</span>
    <span class="ul-item-name">${escHtml(file.name)}</span>
    <span class="ul-item-date">${new Date().toLocaleDateString()}</span>`;
  list.appendChild(item);
}

function copySummary() {
  const text = document.getElementById('so-body').textContent;
  navigator.clipboard.writeText(text).then(() => showToast('Summary copied to clipboard!'));
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ─── PROFILE ──────────────────────────────────────────────
function saveProfile() {
  const name = document.getElementById('pf-name').value.trim();
  if (!name) return showToast('Name cannot be empty.');
  state.currentUser.name = name;
  document.getElementById('profile-name').textContent = name;
  document.getElementById('sb-user-name').textContent = name;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('profile-avatar').textContent = initials;
  showToast('Profile updated successfully!');
}

// ─── ADMIN: USER MANAGEMENT ───────────────────────────────
function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  const students = DB.getStudents();
  tbody.innerHTML = students.map(u => `
    <tr>
      <td>${escHtml(u.name)}</td>
      <td>${escHtml(u.email)}</td>
      <td><span class="badge ${u.active === false ? 'inactive' : 'active'}">${u.active === false ? 'Inactive' : 'Active'}</span></td>
      <td>${u.joined || 'Jan 2024'}</td>
      <td>
        <button class="tbl-btn" onclick="toggleUserStatus(this)">${u.active === false ? 'Activate' : 'Deactivate'}</button>
        <button class="tbl-btn danger" onclick="deleteUser(this)">Delete</button>
      </td>
    </tr>`).join('');
  document.getElementById('asg-users').textContent = students.length;
}

function toggleUserStatus(btn) {
  const row = btn.closest('tr');
  const badge = row.querySelector('.badge');
  if (badge.classList.contains('active')) {
    badge.classList.replace('active', 'inactive');
    badge.textContent = 'Inactive';
    btn.textContent = 'Activate';
    showToast('User deactivated.');
  } else {
    badge.classList.replace('inactive', 'active');
    badge.textContent = 'Active';
    btn.textContent = 'Deactivate';
    showToast('User activated.');
  }
}

function deleteUser(btn) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  btn.closest('tr').remove();
  const count = document.querySelectorAll('#users-tbody tr').length;
  document.getElementById('asg-users').textContent = count;
  showToast('User deleted successfully.');
}

function openAddUserModal() {
  document.getElementById('au-name').value = '';
  document.getElementById('au-email').value = '';
  openModal('adduser-modal');
}

function addUser() {
  const name = document.getElementById('au-name').value.trim();
  const email = document.getElementById('au-email').value.trim();
  if (!name || !email) return showToast('Please fill in all fields.');

  const tbody = document.getElementById('users-tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${escHtml(name)}</td>
    <td>${escHtml(email)}</td>
    <td><span class="badge active">Active</span></td>
    <td>${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
    <td>
      <button class="tbl-btn" onclick="toggleUserStatus(this)">Deactivate</button>
      <button class="tbl-btn danger" onclick="deleteUser(this)">Delete</button>
    </td>`;
  tbody.appendChild(row);
  const count = document.querySelectorAll('#users-tbody tr').length;
  document.getElementById('asg-users').textContent = count;
  closeModal();
  showToast(`Student ${name} added successfully.`);
}

// ─── ADMIN: KNOWLEDGE BASE ────────────────────────────────
let editingKB = null;

function openKBModal() {
  editingKB = null;
  document.getElementById('kb-modal-title').textContent = 'Add Knowledge Entry';
  document.getElementById('kb-title').value = '';
  document.getElementById('kb-cat').value = '';
  document.getElementById('kb-content').value = '';
  openModal('kb-modal');
}

function editKB(btn) {
  editingKB = btn.closest('.kb-card');
  document.getElementById('kb-modal-title').textContent = 'Edit Knowledge Entry';
  document.getElementById('kb-title').value = editingKB.querySelector('h4').textContent;
  document.getElementById('kb-cat').value = editingKB.querySelector('.kb-cat').textContent;
  document.getElementById('kb-content').value = editingKB.querySelector('p').textContent;
  openModal('kb-modal');
}

function saveKBEntry() {
  const title = document.getElementById('kb-title').value.trim();
  const cat = document.getElementById('kb-cat').value.trim();
  const content = document.getElementById('kb-content').value.trim();
  if (!title || !cat || !content) return showToast('Please fill in all fields.');

  if (editingKB) {
    editingKB.querySelector('h4').textContent = title;
    editingKB.querySelector('.kb-cat').textContent = cat;
    editingKB.querySelector('p').textContent = content;
    showToast('Entry updated successfully.');
  } else {
    const card = document.createElement('div');
    card.className = 'kb-card';
    card.innerHTML = `
      <div class="kb-cat">${escHtml(cat)}</div>
      <h4>${escHtml(title)}</h4>
      <p>${escHtml(content)}</p>
      <div class="kb-actions">
        <button onclick="editKB(this)">Edit</button>
        <button class="danger" onclick="deleteKB(this)">Delete</button>
      </div>`;
    document.getElementById('kb-grid').appendChild(card);
    const count = document.querySelectorAll('.kb-card').length;
    document.getElementById('asg-kb').textContent = count;
    showToast('Knowledge entry added.');
  }
  closeModal();
}

function deleteKB(btn) {
  if (!confirm('Delete this knowledge entry?')) return;
  btn.closest('.kb-card').remove();
  const count = document.querySelectorAll('.kb-card').length;
  document.getElementById('asg-kb').textContent = count;
  showToast('Entry deleted.');
}

// ─── ADMIN: LOGS ──────────────────────────────────────────
function filterLogs(query) {
  document.querySelectorAll('.log-item').forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query.toLowerCase()) ? '' : 'none';
  });
}
function filterLogsByDate() {}

// ─── MODALS ───────────────────────────────────────────────
function openModal(id) {
  document.getElementById('modal-overlay').classList.add('show');
  document.getElementById(id).classList.add('show');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

// ─── TOAST ────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── HELPERS ──────────────────────────────────────────────
function showMsg(el, type, msg) {
  el.textContent = msg;
  el.className = `form-msg ${type}`;
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  DB.load();
  DB.save();
  showPage('landing');
  initCursor();
  initCanvas();

  // Enter key on auth forms
  document.getElementById('login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('reg-cpass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doRegister();
  });
});
