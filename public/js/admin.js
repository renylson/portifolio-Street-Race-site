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

checkAuth();

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

async function loadInscricoes() {
    try {
        const response = await fetch('/api/inscricoes');
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
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
            <div class="inscricao-card" data-id="${inscricao.id}" data-status="${inscricao.status || 'a_analisar'}">
                <div class="inscricao-header">
                    <div class="inscricao-info">
                        <h3>${inscricao.nomeCompleto}</h3>
                        <div class="inscricao-meta">
                            <span>Enviado em: ${formatDate(inscricao.dataCriacao)}</span>
                            <span class="status-badge status-${inscricao.status || 'a_analisar'}">${getStatusLabel(inscricao.status || 'a_analisar')}</span>
                        </div>
                    </div>
                    <div class="inscricao-actions">
                        <div class="status-actions">
                            <select class="status-select" onchange="updateStatus(${inscricao.id}, this.value)">
                                <option value="a_analisar" ${(inscricao.status || 'a_analisar') === 'a_analisar' ? 'selected' : ''}>A Analisar</option>
                                <option value="aprovado" ${inscricao.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
                                <option value="reprovado" ${inscricao.status === 'reprovado' ? 'selected' : ''}>Reprovado</option>
                            </select>
                        </div>
                        <button class="btn-delete" onclick="deleteInscricao(${inscricao.id})">
                            <i class="fas fa-trash"></i>
                            Excluir
                        </button>
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
                        <div class="field">
                            <div class="field-label">Ficha Limpa na Polícia</div>
                            <div class="field-value ficha-limpa-status">
                                ${inscricao.fichaLimpa === 'Sim' ? 
                                    '<span class="ficha-sim"><i class="fas fa-check-circle"></i> Sim</span>' : 
                                    '<span class="ficha-nao"><i class="fas fa-exclamation-triangle"></i> Não</span>'
                                }
                            </div>
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

document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            validatePasswordStrength(this.value);
            validatePasswordRequirements(this.value);
        });
    }

    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }
});

function validatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = '';

    if (password.length >= 6) strength++;
    if (password.match(/[a-zA-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    if (password.length >= 12) strength++;

    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    if (password.length === 0) {
        strengthLabel = 'Digite uma senha';
        strengthBar.style.width = '0%';
    } else if (strength <= 2) {
        strengthLabel = 'Senha fraca';
        strengthBar.classList.add('weak');
    } else if (strength <= 3) {
        strengthLabel = 'Senha média';
        strengthBar.classList.add('medium');
    } else {
        strengthLabel = 'Senha forte';
        strengthBar.classList.add('strong');
    }
    
    strengthText.textContent = strengthLabel;
}

function validatePasswordRequirements(password) {
    const requirements = [
        { id: 'req-length', test: password.length >= 6 },
        { id: 'req-letter', test: /[a-zA-Z]/.test(password) },
        { id: 'req-number', test: /[0-9]/.test(password) }
    ];
    
    requirements.forEach(req => {
        const element = document.getElementById(req.id);
        if (element) {
            if (req.test) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        }
    });
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword.length > 0) {
        if (newPassword === confirmPassword) {
            confirmInput.style.borderColor = '#00dd44';
        } else {
            confirmInput.style.borderColor = '#ff4444';
        }
    } else {
        confirmInput.style.borderColor = '';
    }
}

function getStatusLabel(status) {
    const labels = {
        'a_analisar': 'A Analisar',
        'aprovado': 'Aprovado',
        'reprovado': 'Reprovado'
    };
    return labels[status] || 'A Analisar';
}

async function updateStatus(id, novoStatus) {
    try {
        const response = await fetch(`/api/inscricao/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });
        
        if (response.ok) {
            const card = document.querySelector(`[data-id="${id}"]`);
            if (card) {
                card.setAttribute('data-status', novoStatus);
                const statusBadge = card.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = `status-badge status-${novoStatus}`;
                    statusBadge.textContent = getStatusLabel(novoStatus);
                }
            }
        } else {
            alert('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterInscricoes(filter);
        });
    });
});

function filterInscricoes(filter) {
    const cards = document.querySelectorAll('.inscricao-card');
    
    cards.forEach(card => {
        if (filter === 'todos') {
            card.style.display = 'block';
        } else {
            const cardStatus = card.getAttribute('data-status');
            if (cardStatus === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    updateFilterStats(filter);
}

function updateFilterStats(filter) {
    const cards = document.querySelectorAll('.inscricao-card');
    const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
    
    const totalElement = document.getElementById('totalInscricoes');
    if (totalElement) {
        totalElement.textContent = visibleCards.length;
    }
}

const createUserBtn = document.getElementById('createUserBtn');
const createUserModal = document.getElementById('createUserModal');
const cancelCreateUserBtn = document.getElementById('cancelCreateUserBtn');
const createUserForm = document.getElementById('createUserForm');
const createUserError = document.getElementById('createUserError');
const createUserSuccess = document.getElementById('createUserSuccess');

createUserBtn.addEventListener('click', () => {
    createUserModal.style.display = 'flex';
    createUserForm.reset();
    createUserError.classList.remove('show');
    createUserSuccess.classList.remove('show');
    
    document.getElementById('userStrengthBar').className = 'strength-fill';
    document.getElementById('userStrengthText').textContent = 'Digite uma senha';
});

cancelCreateUserBtn.addEventListener('click', () => {
    createUserModal.style.display = 'none';
});

const userPasswordInput = document.getElementById('userPassword');
if (userPasswordInput) {
    userPasswordInput.addEventListener('input', function() {
        validateUserPasswordStrength(this.value);
    });
}

const userConfirmPasswordInput = document.getElementById('userConfirmPassword');
if (userConfirmPasswordInput) {
    userConfirmPasswordInput.addEventListener('input', function() {
        validateUserPasswordMatch();
    });
}

createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('userPassword').value;
    const confirmPassword = document.getElementById('userConfirmPassword').value;
    const canManageUsers = document.getElementById('canManageUsers').checked;
    
    if (password !== confirmPassword) {
        showError(createUserError, 'As senhas não coincidem');
        return;
    }
    
    if (password.length < 6) {
        showError(createUserError, 'A senha deve ter no mínimo 6 caracteres');
        return;
    }
    
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        showError(createUserError, 'Nome de usuário inválido (mín. 3 caracteres, apenas letras, números e _)');
        return;
    }
    
    try {
        const response = await fetch('/api/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                permissions: {
                    canManageUsers
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(createUserSuccess, result.message);
            createUserForm.reset();
            document.getElementById('userStrengthBar').className = 'strength-fill';
            document.getElementById('userStrengthText').textContent = 'Digite uma senha';
            setTimeout(() => {
                createUserModal.style.display = 'none';
            }, 2000);
        } else {
            showError(createUserError, result.message);
        }
    } catch (error) {
        showError(createUserError, 'Erro ao criar usuário');
    }
});

function validateUserPasswordStrength(password) {
    const strengthBar = document.getElementById('userStrengthBar');
    const strengthText = document.getElementById('userStrengthText');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = '';
    if (password.length >= 6) strength++;
    if (password.match(/[a-zA-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    if (password.length >= 12) strength++;
    
    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    if (password.length === 0) {
        strengthLabel = 'Digite uma senha';
        strengthBar.style.width = '0%';
    } else if (strength <= 2) {
        strengthLabel = 'Senha fraca';
        strengthBar.classList.add('weak');
    } else if (strength <= 3) {
        strengthLabel = 'Senha média';
        strengthBar.classList.add('medium');
    } else {
        strengthLabel = 'Senha forte';
        strengthBar.classList.add('strong');
    }
    
    strengthText.textContent = strengthLabel;
}

function validateUserPasswordMatch() {
    const userPassword = document.getElementById('userPassword').value;
    const confirmUserPassword = document.getElementById('userConfirmPassword').value;
    const confirmInput = document.getElementById('userConfirmPassword');
    
    if (confirmUserPassword.length > 0) {
        if (userPassword === confirmUserPassword) {
            confirmInput.style.borderColor = '#00dd44';
        } else {
            confirmInput.style.borderColor = '#ff4444';
        }
    } else {
        confirmInput.style.borderColor = '';
    }
}

function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}