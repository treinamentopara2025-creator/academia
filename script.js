// ACESSO: admin / 1234
const LOGIN_DATA = { user: "Admin", pass: "1234" };

let alunos = JSON.parse(localStorage.getItem('gym_data_final')) || [];
let fotoBase64 = "";
let abaAtual = 'todos';

// Verifica login ao carregar
window.onload = () => {
    if (sessionStorage.getItem('acesso_gym') === 'true') mostrarApp();
    const hoje = new Date();
    document.getElementById('vencimento').value = hoje.getDate();
    document.getElementById('mes_referencia').selectedIndex = hoje.getMonth();
    renderizar();
};

function fazerLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if(u === LOGIN_DATA.user && p === LOGIN_DATA.pass) {
        sessionStorage.setItem('acesso_gym', 'true');
        mostrarApp();
    } else {
        document.getElementById('erro-login').style.display = 'block';
    }
}

function mostrarApp() {
    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('conteudo-app').style.display = 'block';
}

function logout() {
    sessionStorage.removeItem('acesso_gym');
    location.reload();
}

// Upload de Foto
document.getElementById('foto-input').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        fotoBase64 = reader.result;
        document.getElementById('img-preview').src = fotoBase64;
        document.getElementById('img-preview').style.display = 'block';
        document.getElementById('placeholder').style.display = 'none';
    }
    reader.readAsDataURL(e.target.files[0]);
});

function mudarAba(tipo) {
    abaAtual = tipo;
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tipo).classList.add('active');
    renderizar();
}

function adicionarAluno() {
    const nome = document.getElementById('nome').value;
    const mes = document.getElementById('mes_referencia').value;
    const venc = document.getElementById('vencimento').value;

    if(!nome || !venc) return alert("Preencha nome e dia de vencimento!");

    alunos.push({
        id: Date.now(),
        nome: nome,
        mes: mes,
        vencimento: parseInt(venc),
        pago: false,
        foto: fotoBase64 || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    });

    salvarEAtualizar();
    exibirAlerta();
    resetarFormulario();
}

function darBaixa(id) {
    alunos = alunos.map(a => { if(a.id === id) a.pago = !a.pago; return a; });
    salvarEAtualizar();
}

function salvarEAtualizar() {
    localStorage.setItem('gym_data_final', JSON.stringify(alunos));
    renderizar();
}

function exibirAlerta() {
    const toast = document.getElementById('confirmacao');
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
}

function resetarFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('img-preview').style.display = 'none';
    document.getElementById('placeholder').style.display = 'block';
    fotoBase64 = "";
}

function renderizar() {
    const container = document.getElementById('listaAlunos');
    const busca = document.getElementById('inputBusca').value.toLowerCase();
    const dHoje = new Date().getDate();
    container.innerHTML = '';
    
    // Atualizar Contadores
    document.getElementById('stat-total').innerText = alunos.length;
    document.getElementById('stat-pagos').innerText = alunos.filter(a => a.pago).length;
    document.getElementById('stat-atrasados').innerText = alunos.filter(a => !a.pago && dHoje > a.vencimento).length;

    let lista = alunos.filter(a => a.nome.toLowerCase().includes(busca));
    if(abaAtual === 'pagos') lista = lista.filter(a => a.pago);
    if(abaAtual === 'atrasados') lista = lista.filter(a => !a.pago && dHoje > a.vencimento);

    lista.forEach(aluno => {
        const isAtrasado = !aluno.pago && dHoje > aluno.vencimento;
        const card = document.createElement('div');
        card.className = `aluno-item ${aluno.pago ? 'pago' : (isAtrasado ? 'atrasado' : '')}`;
        card.innerHTML = `
            <img src="${aluno.foto}" class="foto-aluno">
            <div class="info">
                <h4>${aluno.nome}</h4>
                <p>Venc.: Dia ${aluno.vencimento} | ${aluno.mes}</p>
            </div>
            <button class="btn-baixa ${aluno.pago ? 'pago-btn' : ''}" onclick="darBaixa(${aluno.id})">
                ${aluno.pago ? 'Pago' : 'Baixa'}
            </button>
        `;
        container.appendChild(card);
    });
}

