let alunos = JSON.parse(localStorage.getItem('gym_v_final')) || [];
let fotoBase64 = "";
let abaAtual = 'todos';

window.onload = () => {
    const hoje = new Date();
    document.getElementById('vencimento').value = hoje.getDate();
    document.getElementById('mes_referencia').selectedIndex = hoje.getMonth();
    renderizar();
};

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

    if(!nome) return alert("Digite o nome!");

    alunos.push({
        id: Date.now(),
        nome: nome,
        mes: mes,
        vencimento: parseInt(venc),
        pago: false,
        foto: fotoBase64 || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    });

    salvarEAtualizar();
    
    // Alerta de sucesso
    const toast = document.getElementById('confirmacao');
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);

    // Resetar campos
    document.getElementById('nome').value = '';
    document.getElementById('img-preview').style.display = 'none';
    document.getElementById('placeholder').style.display = 'block';
    fotoBase64 = "";
}

function darBaixa(id) {
    alunos = alunos.map(a => { if(a.id === id) a.pago = !a.pago; return a; });
    salvarEAtualizar();
}

function remover(id) {
    if(confirm("Excluir este aluno?")) {
        alunos = alunos.filter(a => a.id !== id);
        salvarEAtualizar();
    }
}

function salvarEAtualizar() {
    localStorage.setItem('gym_v_final', JSON.stringify(alunos));
    renderizar();
}

function renderizar() {
    const container = document.getElementById('listaAlunos');
    const busca = document.getElementById('inputBusca').value.toLowerCase();
    const dHoje = new Date().getDate();
    container.innerHTML = '';
    
    document.getElementById('stat-total').innerText = alunos.length;
    document.getElementById('stat-pagos').innerText = alunos.filter(a => a.pago).length;
    document.getElementById('stat-atrasados').innerText = alunos.filter(a => !a.pago && dHoje > a.vencimento).length;

    let lista = alunos.filter(a => a.nome.toLowerCase().includes(busca));
    if(abaAtual === 'pagos') lista = lista.filter(a => a.pago);
    if(abaAtual === 'atrasados') lista = lista.filter(a => !a.pago && dHoje > a.vencimento);

    lista.forEach(aluno => {
        const isAtrasado = !aluno.pago && dHoje > aluno.vencimento;
        const statusClasse = aluno.pago ? "pago" : (isAtrasado ? "atrasado" : "");

        const card = document.createElement('div');
        card.className = `aluno-item ${statusClasse}`;
        card.innerHTML = `
            <img src="${aluno.foto}" class="foto-aluno">
            <div class="info">
                <h4>${aluno.nome}</h4>
                <p>Venc.: Dia ${aluno.vencimento} | ${aluno.mes}</p>
            </div>
            <div class="acoes">
                <button class="btn-baixa ${aluno.pago ? 'pago-btn' : ''}" onclick="darBaixa(${aluno.id})">
                    ${aluno.pago ? 'Pago' : 'Baixa'}
                </button>
                <button class="btn-del" onclick="remover(${aluno.id})">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}