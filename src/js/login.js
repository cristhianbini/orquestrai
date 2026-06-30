// B30_LOGOUT_JS_GUARD
(function(){try{if(new URLSearchParams(location.search||'').has('logout')){localStorage.removeItem('oq_token');sessionStorage.removeItem('oq_token');localStorage.removeItem('token');sessionStorage.removeItem('token');localStorage.removeItem('authToken');sessionStorage.removeItem('authToken');localStorage.removeItem('jwt');sessionStorage.removeItem('jwt');localStorage.removeItem('orq_jwt');sessionStorage.removeItem('orq_jwt');localStorage.removeItem('orquestrai_token');sessionStorage.removeItem('orquestrai_token');localStorage.removeItem('OQ_TOKEN');sessionStorage.removeItem('OQ_TOKEN');}}catch(e){}})();
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const submitBtn = document.getElementById('submitBtn');
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
  if (!email || !password) { errorMsg.textContent = 'Preencha todos os campos.'; errorMsg.classList.remove('hidden'); return; }
  if (password.length < 6) { errorMsg.textContent = 'Senha deve ter no minimo 6 caracteres.'; errorMsg.classList.remove('hidden'); return; }
  submitBtn.disabled = true;
  btnText.textContent = 'Entrando...';
  btnLoader.classList.remove('hidden');
  try {
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { errorMsg.textContent = data.error || 'Erro ao fazer login.'; errorMsg.classList.remove('hidden'); return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    successMsg.textContent = 'Login realizado! Redirecionando...';
    successMsg.classList.remove('hidden');
    showToast('Bem-vindo, ' + data.user.name + '!', 'success');
    setTimeout(() => { window.location.href = '/dashboard.html'; }, 1000);
  } catch (err) { errorMsg.textContent = 'Erro de conexao com o servidor.'; errorMsg.classList.remove('hidden'); }
  finally { submitBtn.disabled = false; btnText.textContent = 'Entrar'; btnLoader.classList.add('hidden'); }
}
