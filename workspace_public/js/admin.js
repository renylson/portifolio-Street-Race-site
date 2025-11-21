// Elementos
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminUsername = document.getElementById('adminUsername');
const inscricoesContainer = document.getElementById('inscricoesContainer');
const totalInscricoes = document.getElementById('totalInscricoes');
const passwordModal = document.getElementById('passwordModal');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
const changePasswordForm = document.getElementById('changePasswordForm');
const passwordError = document.getElementById('passwordError');

// Verificar autenticação ao carregar
checkAuth();

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'block';
            adminUsername.textContent = username;
            loadInscricoes();
        } else {
            showError(loginError, data.message);
        }
    } catch (error) {
        showError(loginError, 'Erro ao fazer login');
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        loginScreen.style.display = 'flex';
        adminPanel.style.display = 'none';
        loginForm.reset();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
});

// Verificar autenticação
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (data.authenticated) {
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'block';
            adminUsername.textContent = data.username;
            loadInscricoes();
        } else {
            loginScreen.style.display = 'flex';
            adminPanel.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        loginScreen.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
}

// Carregar inscrições
async function loadInscricoes() {
    try {
        const response = await fetch('/api/inscricoes');
        const inscricoes = await response.json();
        
        totalInscricoes.textContent = inscricoes.length;
        
        if (inscricoes.length === 0) {
            inscricoesContainer.innerHTML = `
                <div class="no-inscricoes">
                    <h3>Nenhuma inscrição recebida ainda</h3>
                    <p>As inscrições aparecerão aqui quando forem enviadas.</p>
                </div>
            `;
            return;
        }
        
        inscricoesContainer.innerHTML = inscricoes.map(inscricao => `
            <div class="inscricao-card" data-id="${inscricao.id}">
                <div class="inscricao-header">
                    <div class="inscricao-info">
                        <h3>${inscricao.nomeCompleto}</h3>
                        <div class="inscricao-meta">
                            Enviado em: ${formatDate(inscricao.dataCriacao)}
                        </div>
                    </div>
                    <div class="inscricao-actions">
                        <button class="btn-delete" onclick="deleteInscricao(${inscricao.id})">🗑️ Excluir</button>
                    </div>
                </div>
                <div class="inscricao-body">
                    <div>
                        <div class="field">
                            <div class="field-label">Passaporte</div>
                            <div class="field-value">${inscricao.passaporte}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Telefone</div>
                            <div class="field-value">${inscricao.telefone}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Discord</div>
                            <div class="field-value">${inscricao.discord}</div>
                        </div>
                    </div>
                    <div>
                        <div class="field">
                            <div class="field-label">Horários Disponíveis</div>
                            <div class="field-value">${inscricao.horarios}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Experiência como Mecânico</div>
                            <div class="field-value">${inscricao.experiencia}</div>
                        </div>
                        ${inscricao.temIndicacao === 'Sim' ? `
                        <div class="field">
                            <div class="field-label">Indicação</div>
                            <div class="field-value">${inscricao.indicacao}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="field">
                    <div class="field-label">3 Regras Importantes no RP</div>
                    <div class="field-value large">${inscricao.regrasRP}</div>
                </div>
                <div class="field">
                    <div class="field-label">Por que quer entrar na Street Race?</div>
                    <div class="field-value large">${inscricao.porqueEntrar}</div>
                </div>
                <div class="field">
                    <div class="field-label">Objetivos na Street Race</div>
                    <div class="field-value large">${inscricao.objetivos}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
        inscricoesContainer.innerHTML = '<p class="loading">Erro ao carregar inscrições</p>';
    }
}

// Deletar inscrição
async function deleteInscricao(id) {
    if (!confirm('Tem certeza que deseja excluir esta inscrição?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/inscricao/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadInscricoes();
        } else {
            alert('Erro ao excluir inscrição');
        }
    } catch (error) {
        console.error('Erro ao excluir inscrição:', error);
        alert('Erro ao excluir inscrição');
    }
}

// Alterar senha
changePasswordBtn.addEventListener('click', () => {
    passwordModal.style.display = 'flex';
    changePasswordForm.reset();
    passwordError.classList.remove('show');
});

cancelPasswordBtn.addEventListener('click', () => {
    passwordModal.style.display = 'none';
});

changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showError(passwordError, 'As senhas não coincidem');
        return;
    }
    
    if (newPassword.length < 6) {
        showError(passwordError, 'A senha deve ter no mínimo 6 caracteres');
        return;
    }
    
    try {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Senha alterada com sucesso!');
            passwordModal.style.display = 'none';
        } else {
            showError(passwordError, data.message);
        }
    } catch (error) {
        showError(passwordError, 'Erro ao alterar senha');
    }
});

// Utilitários
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}