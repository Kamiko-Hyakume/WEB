angular.module('OrchestratorApp', [])
  .controller('MainCtrl', function ($scope, $interval) {
    $scope.page = 'dashboard';
    $scope.modalOpen = false;

    var savedSession = JSON.parse(localStorage.getItem('rpa_session') || 'null');
    if (savedSession) {
      $scope.sessionUser = savedSession.email || savedSession.apikey || 'Admin Woelfer';
    }

    $scope.logout = function () {
      var lembrar = localStorage.getItem('rpa_lembrar');
      if (lembrar !== 'true') {
        localStorage.removeItem('rpa_session');
      }
      window.location.href = 'login.html';
    };

    $scope.terminalOpen = false;
    $scope.buscaEmpresa = '';
    $scope.buscaUsuario = '';
    $scope.paramEmpresa = '';
    $scope.paramRobo = '';
    $scope.paramValues = {};
    $scope.selectedRobo = null;
    $scope.filtroStatus = '';
    $scope.filtroEmpresa = '';
    $scope.filtroRobo = '';
    $scope.formAg = { dias: {}, cronExpr: '0 8 * * 1-5', hora: '08:00', repeticao: 'weekly', grupoClientes: '', periodoInicial: '', periodoFinal: '' };
    $scope.grupoClientesDisponiveis = [];
    $scope.formEmpresa = {};
    $scope.formRobo = {};
    $scope.formUser = { nivel: 'viewer' };
    $scope.logTarget = {};
    $scope.showSenha = false;
    $scope.showFrase = false;

    $scope.diasSemana = [
      { label: 'Seg', val: '1' }, { label: 'Ter', val: '2' }, { label: 'Qua', val: '3' },
      { label: 'Qui', val: '4' }, { label: 'Sex', val: '5' }, { label: 'Sáb', val: '6' }, { label: 'Dom', val: '0' }
    ];

    $scope.chartBars = [
      { h: 15, v: 8 }, { h: 10, v: 5 }, { h: 8, v: 4 }, { h: 12, v: 6 }, { h: 35, v: 18 }, { h: 55, v: 28 },
      { h: 75, v: 38 }, { h: 100, v: 52 }, { h: 88, v: 45 }, { h: 95, v: 49 }, { h: 82, v: 42 }, { h: 70, v: 36 },
      { h: 60, v: 31 }, { h: 75, v: 38 }, { h: 80, v: 41 }, { h: 72, v: 37 }, { h: 65, v: 33 }, { h: 55, v: 28 },
      { h: 45, v: 23 }, { h: 30, v: 15 }, { h: 20, v: 10 }, { h: 15, v: 8 }, { h: 10, v: 5 }, { h: 5, v: 3 }
    ];

    $scope.liveLogs = [
      { ts: '14:32:01', robot: 'Robô Fiscal', msg: 'NF emitida com sucesso — CNPJ 12.345.678/0001-90' },
      { ts: '14:31:55', robot: 'Robô Comercial', msg: 'Lead capturado — João Silva (joao@empresa.com)' },
      { ts: '14:31:48', robot: 'Robô Financeiro', msg: 'Conciliação bancária iniciada — Conta 0001-2' },
      { ts: '14:31:30', robot: 'Robô Fiscal', msg: 'Consultando SEFAZ — aguardando resposta...' },
      { ts: '14:31:12', robot: 'Robô RH', msg: 'Folha de pagamento processada — 47 funcionários' },
      { ts: '14:30:58', robot: 'Robô Logística', msg: 'Rastreamento atualizado — Pedido #78234' },
    ];

    $scope.falhas = [
      { robot: 'Robô Financeiro', empresa: 'Acme Corp', tempo: '14:28:03', msg: 'Timeout na conexão com ERP — port 5432' },
      { robot: 'Robô Fiscal', empresa: 'Beta Ltda', tempo: '13:55:17', msg: 'SEFAZ indisponível — código 503' },
      { robot: 'Robô Comercial', empresa: 'Gamma S/A', tempo: '12:40:09', msg: 'Credencial inválida — senha expirada' },
    ];

    $scope.empresas = [
      {
        id: 'e1', nome: 'Acme Corporation', cnpj: '12.345.678/0001-90',
        ie: '123.456.789.000', regimeTributario: 'Lucro Presumido', optante: 'Não',
        pisPasep: '123.45678.90-1', variacaoMonetaria: 'BRL — Real Brasileiro',
        numeroConta: '00012-3', senha: '', fraseSecreta: '',
        email: '', ativo: true, robosCount: 4, cadastro: '2025-01-15'
      },
      {
        id: 'e2', nome: 'Beta Tecnologia Ltda', cnpj: '98.765.432/0001-11',
        ie: '987.654.321.000', regimeTributario: 'Simples Nacional', optante: 'Sim',
        pisPasep: '987.65432.10-2', variacaoMonetaria: 'BRL — Real Brasileiro',
        numeroConta: '00078-9', senha: '', fraseSecreta: '',
        email: '', ativo: true, robosCount: 3, cadastro: '2025-03-22'
      },
      {
        id: 'e3', nome: 'Gamma Indústria S/A', cnpj: '45.678.901/0001-55',
        ie: '456.789.012.000', regimeTributario: 'Lucro Real', optante: 'Não',
        pisPasep: '', variacaoMonetaria: 'USD — Dólar Americano',
        numeroConta: '00056-7', senha: '', fraseSecreta: '',
        email: '', ativo: true, robosCount: 5, cadastro: '2025-02-08'
      },
      {
        id: 'e4', nome: 'Delta Serviços ME', cnpj: '11.222.333/0001-44',
        ie: '', regimeTributario: 'MEI', optante: 'Sim',
        pisPasep: '', variacaoMonetaria: 'BRL — Real Brasileiro',
        numeroConta: '00034-1', senha: '', fraseSecreta: '',
        email: '', ativo: false, robosCount: 1, cadastro: '2024-11-30'
      },
      {
        id: 'e5', nome: 'Epsilon Comércio Ltda', cnpj: '77.888.999/0001-22',
        ie: '778.889.990.000', regimeTributario: 'Simples Nacional', optante: 'Sim',
        pisPasep: '', variacaoMonetaria: 'BRL — Real Brasileiro',
        numeroConta: '00091-4', senha: '', fraseSecreta: '',
        email: '', ativo: true, robosCount: 2, cadastro: '2026-01-05'
      },
    ];

    $scope.robos = [
      {
        id: 'r1', nome: 'Robô Fiscal — Emitir NF', status: 'running', statusLabel: 'Ativo', execucoes: 1423, taxa: 97, iconBg: 'rgba(79,142,247,0.15)', iconColor: 'var(--accent)',
        schema: [{ nome: 'url_sefaz', tipo: 'texto', obrigatorio: true }, { nome: 'certificado_a1', tipo: 'password', obrigatorio: true }, { nome: 'cnpj_emitente', tipo: 'texto', obrigatorio: true }]
      },
      {
        id: 'r2', nome: 'Robô Comercial — Leads', status: 'running', statusLabel: 'Ativo', execucoes: 856, taxa: 94, iconBg: 'rgba(34,211,160,0.15)', iconColor: 'var(--green)',
        schema: [{ nome: 'url_crm', tipo: 'texto', obrigatorio: true }, { nome: 'api_key', tipo: 'password', obrigatorio: true }, { nome: 'pipeline_id', tipo: 'numero', obrigatorio: false }]
      },
      {
        id: 'r3', nome: 'Robô Financeiro — Conciliação', status: 'error', statusLabel: 'Erro', execucoes: 342, taxa: 78, iconBg: 'rgba(240,87,87,0.15)', iconColor: 'var(--red)',
        schema: [{ nome: 'host_db', tipo: 'texto', obrigatorio: true }, { nome: 'usuario_db', tipo: 'texto', obrigatorio: true }, { nome: 'senha_db', tipo: 'password', obrigatorio: true }, { nome: 'porta', tipo: 'numero', obrigatorio: false }]
      },
      {
        id: 'r4', nome: 'Robô RH — Folha Pagamento', status: 'success', statusLabel: 'OK', execucoes: 224, taxa: 99, iconBg: 'rgba(167,139,250,0.15)', iconColor: 'var(--purple)',
        schema: [{ nome: 'sistema_rh', tipo: 'select', obrigatorio: true, options: ['Totvs', 'Datasul', 'Senior'] }, { nome: 'login', tipo: 'texto', obrigatorio: true }, { nome: 'senha', tipo: 'password', obrigatorio: true }]
      },
      {
        id: 'r5', nome: 'Robô Logística — Rastreamento', status: 'running', statusLabel: 'Ativo', execucoes: 567, taxa: 91, iconBg: 'rgba(245,166,35,0.15)', iconColor: 'var(--amber)',
        schema: [{ nome: 'api_transportadora', tipo: 'texto', obrigatorio: true }, { nome: 'token', tipo: 'password', obrigatorio: true }]
      },
      {
        id: 'r6', nome: 'Robô Fiscal — SPED', status: 'pending', statusLabel: 'Aguardando', execucoes: 89, taxa: 85, iconBg: 'rgba(34,211,238,0.15)', iconColor: 'var(--cyan)',
        schema: [{ nome: 'url_sistema', tipo: 'texto', obrigatorio: true }, { nome: 'usuario', tipo: 'texto', obrigatorio: true }, { nome: 'senha_erp', tipo: 'password', obrigatorio: true }]
      },
    ];

    $scope.execucoes = [
      { id: '8821', robo: 'Robô Fiscal — Emitir NF', empresa: 'Acme Corp', inicio: '14:32:01', duracao: '00:01:23', status: 'success', statusLabel: 'Sucesso' },
      { id: '8820', robo: 'Robô Comercial — Leads', empresa: 'Beta Ltda', inicio: '14:30:15', duracao: '00:00:47', status: 'running', statusLabel: 'Processando' },
      { id: '8819', robo: 'Robô Financeiro', empresa: 'Acme Corp', inicio: '14:28:03', duracao: '00:05:11', status: 'error', statusLabel: 'Erro' },
      { id: '8818', robo: 'Robô RH — Folha', empresa: 'Gamma S/A', inicio: '14:20:00', duracao: '00:03:42', status: 'success', statusLabel: 'Sucesso' },
      { id: '8817', robo: 'Robô Logística', empresa: 'Delta ME', inicio: '14:15:30', duracao: '00:00:58', status: 'success', statusLabel: 'Sucesso' },
      { id: '8816', robo: 'Robô Fiscal — SPED', empresa: 'Epsilon Ltda', inicio: '13:55:17', duracao: '00:02:30', status: 'error', statusLabel: 'Erro' },
      { id: '8815', robo: 'Robô Comercial — Leads', empresa: 'Gamma S/A', inicio: '13:40:00', duracao: '00:01:12', status: 'success', statusLabel: 'Sucesso' },
      { id: '8814', robo: 'Robô Fiscal — Emitir NF', empresa: 'Beta Ltda', inicio: '12:30:00', duracao: '00:01:05', status: 'success', statusLabel: 'Sucesso' },
    ];

    $scope.terminalLogs = [];

    $scope.agendamentos = [
      {
        empresa: 'Acme Corp', robo: 'Robô Fiscal — Emitir NF',
        desc: 'Segunda a Sexta às 08:00',
        periodo: '01/06/2026 – 30/06/2026',
        proxima: '09/06 08:00',
        usuario: 'Gabriel Woelfer',
        lastStatus: 'success',
        ativo: true
      },
      {
        empresa: 'Beta Ltda', robo: 'Robô Comercial — Leads',
        desc: 'Todo dia às 06:00',
        periodo: '01/01/2026 – Indeterminado',
        proxima: '09/06 06:00',
        usuario: 'Gabriela Nascimento',
        lastStatus: 'success',
        ativo: true
      },
      {
        empresa: 'Gamma S/A', robo: 'Robô Financeiro',
        desc: 'Toda segunda às 09:00',
        periodo: '01/05/2026 – 31/07/2026',
        proxima: '15/06 09:00',
        usuario: 'Carlos Oliveira',
        lastStatus: 'error',
        ativo: false
      },
      {
        empresa: 'Acme Corp', robo: 'Robô RH — Folha',
        desc: '1º dia do mês às 07:00',
        periodo: '01/01/2026 – 31/12/2026',
        proxima: '01/07 07:00',
        usuario: 'Gabriel Woelfer',
        lastStatus: 'success',
        ativo: true
      },
      {
        empresa: 'Epsilon Ltda', robo: 'Robô Logística',
        desc: 'A cada 6 horas',
        periodo: '10/06/2026 – 10/07/2026',
        proxima: '09/06 18:00',
        usuario: 'Kamilly Birkner',
        lastStatus: null,
        ativo: true
      },
    ];

    $scope.gruposEmpresa = [
      { id: 'g1', roboId: 'r1', nome: 'Grupo Fiscal SP', empresaIds: ['e1', 'e2', 'e3'] },
      { id: 'g2', roboId: 'r2', nome: 'Grupo Comercial Sul', empresaIds: ['e2', 'e4'] }
    ];

    $scope.usuarios = [
      { nome: 'Gabriel Woelfer', email: 'dev.grsilva@gmail.com', nivel: 'admin', nivelLabel: 'Admin', ultimoLogin: '08/06 14:30', ativo: true, iniciais: 'GW', color1: '#4f8ef7', color2: '#a78bfa' },
      { nome: 'Gabriela Nascimento', email: 'gabriela@empresa.com', nivel: 'manager', nivelLabel: 'Manager', ultimoLogin: '08/06 11:15', ativo: true, iniciais: 'GN', color1: '#22d3a0', color2: '#22d3ee' },
      { nome: 'Kamilly Birkner', email: 'kamilly@empresa.com', nivel: 'viewer', nivelLabel: 'Viewer', ultimoLogin: '07/06 16:45', ativo: true, iniciais: 'KB', color1: '#f5a623', color2: '#f05757' },
      { nome: 'Carlos Oliveira', email: 'carlos.ops@empresa.com', nivel: 'manager', nivelLabel: 'Manager', ultimoLogin: '06/06 09:20', ativo: true, iniciais: 'CO', color1: '#a78bfa', color2: '#4f8ef7' },
      { nome: 'Ana Paula Ramos', email: 'ana.ramos@empresa.com', nivel: 'viewer', nivelLabel: 'Viewer', ultimoLogin: '01/06 08:00', ativo: false, iniciais: 'AP', color1: '#8b92a5', color2: '#545c6e' },
    ];

    $scope.permissoes = [
      { func: 'Dashboard & Monitor', admin: true, manager: true, viewer: true },
      { func: 'Cadastrar/Editar Empresas', admin: true, manager: false, viewer: false },
      { func: 'Visualizar Empresas', admin: true, manager: true, viewer: true },
      { func: 'Gerenciar Catálogo de Robôs', admin: true, manager: false, viewer: false },
      { func: 'Configurar Parâmetros', admin: true, manager: true, viewer: false },
      { func: 'Criar/Editar Agendamentos', admin: true, manager: true, viewer: false },
      { func: 'Executar Robô Manualmente', admin: true, manager: true, viewer: false },
      { func: 'Ver Histórico de Execuções', admin: true, manager: true, viewer: true },
      { func: 'Baixar Logs', admin: true, manager: true, viewer: false },
      { func: 'Gerenciar Usuários (RBAC)', admin: true, manager: false, viewer: false },
    ];

    var fakeLogs = [
      { ts: '14:28:01', level: 'info', msg: 'Iniciando execução — Robô Financeiro v2.1.0' },
      { ts: '14:28:02', level: 'info', msg: 'Conectando ao banco de dados — host:erp.acme.com:5432' },
      { ts: '14:28:04', level: 'info', msg: 'Autenticando com credenciais do cofre (AES-256)' },
      { ts: '14:28:06', level: 'warn', msg: 'Tempo de resposta elevado — 2800ms (threshold: 2000ms)' },
      { ts: '14:28:09', level: 'info', msg: 'Executando query de conciliação — período: 01/06-08/06' },
      { ts: '14:28:15', level: 'error', msg: 'FATAL: Connection timeout após 5000ms — retry 1/3' },
      { ts: '14:28:20', level: 'error', msg: 'FATAL: Connection timeout após 5000ms — retry 2/3' },
      { ts: '14:28:25', level: 'error', msg: 'FATAL: Connection timeout após 5000ms — retry 3/3' },
      { ts: '14:28:25', level: 'error', msg: 'Execução encerrada com FAILED — código de saída: 1' },
    ];

    $scope.abrirTerminal = function (ex) {
      $scope.selectedExec = ex;
      $scope.terminalLogs = fakeLogs;
      $scope.terminalOpen = true;
    };

    $scope.verLog = function (f) {
      $scope.logTarget = f;
      $scope.terminalLogs = fakeLogs;
      $scope.modalType = 'log';
      $scope.modalOpen = true;
    };

    $scope.filtrarExecucoes = function (ex) {
      if ($scope.filtroStatus && ex.status !== $scope.filtroStatus) return false;
      return true;
    };

    $scope.openModal = function (type) {
      $scope.modalType = type;
      $scope.modalOpen = true;
      $scope.editando = false;
      $scope.showSenha = false;
      $scope.showFrase = false;
      $scope.formEmpresa = {};
      $scope.formRobo = {};
      $scope.formUser = { nivel: 'viewer' };
      $scope.formAg = { dias: {}, hora: '08:00', repeticao: 'weekly', cronExpr: '0 8 * * 1-5', modoExecucao: 'individual' };
      $scope.formGrupo = { empresaIds: [] };
    };

    $scope.fecharModal = function (ev) {
      if (!ev || ev.target === ev.currentTarget) {
        $scope.modalOpen = false;
        $scope.showSenha = false;
        $scope.showFrase = false;
      }
    };

    $scope.editarEmpresa = function (e) {
      $scope.formEmpresa = angular.copy(e);
      $scope.editando = true;
      $scope.modalType = 'empresa';
      $scope.modalOpen = true;
      $scope.showSenha = false;
      $scope.showFrase = false;
    };

    $scope.editarAgendamento = function (a) {
      $scope.formAg = {
        empresa: '',
        robo: '',
        hora: '08:00',
        repeticao: 'weekly',
        dias: {},
        cronExpr: '0 8 * * 1-5'
      };
      $scope.editando = true;
      $scope.agendamentoEditando = a;
      $scope.modalType = 'agendamento';
      $scope.modalOpen = true;
    };

    $scope.salvarEmpresa = function () {
      if (!$scope.formEmpresa.nome) return;
      if ($scope.editando) {
        var idx = $scope.empresas.findIndex(function (e) { return e.id === $scope.formEmpresa.id; });
        if (idx >= 0) $scope.empresas[idx] = angular.copy($scope.formEmpresa);
      } else {
        $scope.empresas.push({
          id: 'e' + Date.now(),
          nome: $scope.formEmpresa.nome,
          cnpj: $scope.formEmpresa.cnpj || '—',
          ie: $scope.formEmpresa.ie || '',
          regimeTributario: $scope.formEmpresa.regimeTributario || '',
          optante: $scope.formEmpresa.optante || '',
          pisPasep: $scope.formEmpresa.pisPasep || '',
          variacaoMonetaria: $scope.formEmpresa.variacaoMonetaria || '',
          numeroConta: $scope.formEmpresa.numeroConta || '',
          senha: $scope.formEmpresa.senha || '',
          fraseSecreta: $scope.formEmpresa.fraseSecreta || '',
          email: $scope.formEmpresa.email || '',
          ativo: true,
          robosCount: 0,
          cadastro: new Date().toISOString().split('T')[0]
        });
      }
      $scope.modalOpen = false;
      $scope.showSenha = false;
      $scope.showFrase = false;
    };

    $scope.salvarRobo = function () {
      if (!$scope.formRobo.nome) return;
      $scope.robos.push({
        id: 'r' + Date.now(),
        nome: $scope.formRobo.nome,
        status: 'pending', statusLabel: 'Aguardando',
        execucoes: 0, taxa: 0,
        iconBg: 'rgba(139,146,165,0.15)', iconColor: 'var(--text2)',
        schema: []
      });
      $scope.modalOpen = false;
    };

    $scope.salvarUsuario = function () {
      if (!$scope.formUser.email) return;
      var parts = ($scope.formUser.nome || 'Novo Usuário').split(' ');
      $scope.usuarios.push({
        nome: $scope.formUser.nome || 'Novo Usuário',
        email: $scope.formUser.email,
        nivel: $scope.formUser.nivel,
        nivelLabel: { admin: 'Admin', manager: 'Manager', viewer: 'Viewer' }[$scope.formUser.nivel],
        ultimoLogin: '—',
        ativo: true,
        iniciais: (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase(),
        color1: '#4f8ef7', color2: '#a78bfa'
      });
      $scope.modalOpen = false;
    };

    $scope.getGrupoSelecionado = function () {
      return $scope.gruposEmpresa.find(function (g) { return g.id === $scope.formAg.grupoId; }) || { empresaIds: [] };
    };

    $scope.toggleEmpresaGrupo = function (id) {
      var idx = $scope.formGrupo.empresaIds.indexOf(id);
      if (idx > -1) $scope.formGrupo.empresaIds.splice(idx, 1);
      else $scope.formGrupo.empresaIds.push(id);
    };

    $scope.salvarGrupo = function () {
      if (!$scope.formGrupo.nome || !$scope.formGrupo.roboId) return;
      $scope.gruposEmpresa.push({
        id: 'g' + Date.now(),
        roboId: $scope.formGrupo.roboId,
        nome: $scope.formGrupo.nome,
        empresaIds: angular.copy($scope.formGrupo.empresaIds)
      });
      $scope.modalOpen = false;
    };

    $scope.excluirGrupo = function (g) {
      var idx = $scope.gruposEmpresa.indexOf(g);
      if (idx > -1) $scope.gruposEmpresa.splice(idx, 1);
    };

    $scope.removerEmpresaDoGrupo = function (g, eId) {
      var idx = g.empresaIds.indexOf(eId);
      if (idx > -1) g.empresaIds.splice(idx, 1);
    };

    $scope.adicionarEmpresaAoGrupo = function (g) {
      if (!g._novaEmpresa || g.empresaIds.indexOf(g._novaEmpresa) > -1) return;
      g.empresaIds.push(g._novaEmpresa);
      g._novaEmpresa = '';
    };

    $scope.salvarAgendamento = function () {
      if ($scope.formAg.modoExecucao === 'grupo') {
        var grupo = $scope.getGrupoSelecionado();
        var batchId = 'batch-' + Date.now();
        grupo.empresaIds.forEach(function (eId) {
          $scope.agendamentos.push({
            empresa: $scope.getEmpresaNome(eId),
            robo: $scope.getRoboNome($scope.formAg.robo),
            desc: '[Lote] ' + grupo.nome + ' — ' + $scope.formAg.hora,
            cron: $scope.formAg.cronExpr,
            proxima: '09/06 ' + $scope.formAg.hora,
            ativo: true,
            batchId: batchId,
            grupoNome: grupo.nome
          });
        });
      } else {
        $scope.agendamentos.push({
          empresa: $scope.getEmpresaNome($scope.formAg.empresa) || '—',
          robo: $scope.getRoboNome($scope.formAg.robo) || '—',
          desc: 'Personalizado ' + $scope.formAg.hora,
          cron: $scope.formAg.cronExpr,
          proxima: '09/06 ' + $scope.formAg.hora,
          ativo: true
        });
      }
      $scope.modalOpen = false;
    };

    $scope.executarAgora = function (a) {
      if (a.batchId) {
        var lote = $scope.agendamentos.filter(function (x) { return x.batchId === a.batchId; });
        lote.forEach(function (ag) {
          $scope.execucoes.unshift({
            id: String(9000 + Math.floor(Math.random() * 100)),
            robo: ag.robo, empresa: ag.empresa,
            inicio: new Date().toTimeString().slice(0, 8),
            duracao: '00:00:00', status: 'running', statusLabel: 'Processando',
            batchId: a.batchId
          });
        });
      } else {
        $scope.execucoes.unshift({
          id: String(9000 + Math.floor(Math.random() * 100)),
          robo: a.robo, empresa: a.empresa,
          inicio: new Date().toTimeString().slice(0, 8),
          duracao: '00:00:00', status: 'running', statusLabel: 'Processando'
        });
      }
      $scope.page = 'execucoes';
    };

    $scope.reexecutar = function (ex) {
      $scope.execucoes.unshift({
        id: String(parseInt(ex.id) + Math.floor(Math.random() * 10)),
        robo: ex.robo, empresa: ex.empresa,
        inicio: new Date().toTimeString().slice(0, 8),
        duracao: '00:00:00', status: 'running', statusLabel: 'Processando'
      });
    };

    $scope.selecionarRobo = function (r) {
      $scope.selectedRobo = ($scope.selectedRobo && $scope.selectedRobo.id === r.id) ? null : r;
    };

    $scope.addSchemaField = function (r) {
      r.schema.push({ nome: '', tipo: 'texto', obrigatorio: false });
    };

    $scope.removeSchemaField = function (r, idx) {
      r.schema.splice(idx, 1);
    };

    var gruposPorRobo = {
      'r1': [
        { id: 'g1', label: 'Grupo Fiscal SP — 12 empresas' },
        { id: 'g2', label: 'Grupo Fiscal RJ — 8 empresas' },
        { id: 'g3', label: 'Grupo Fiscal SUL — 15 empresas' },
      ],
      'r2': [
        { id: 'g4', label: 'Grupo Comercial Nacional — 30 empresas' },
        { id: 'g5', label: 'Grupo Comercial Regional — 11 empresas' },
      ],
      'r3': [
        { id: 'g6', label: 'Grupo Financeiro Matriz — 5 empresas' },
        { id: 'g7', label: 'Grupo Financeiro Filiais — 9 empresas' },
      ],
      'r4': [
        { id: 'g8', label: 'Grupo RH Operacional — 47 funcionários' },
        { id: 'g9', label: 'Grupo RH Diretoria — 12 funcionários' },
      ],
      'r5': [
        { id: 'g10', label: 'Grupo Logística CD São Paulo — 20 empresas' },
        { id: 'g11', label: 'Grupo Logística CD Sul — 14 empresas' },
      ],
      'r6': [
        { id: 'g12', label: 'Grupo SPED Contábil — 18 empresas' },
        { id: 'g13', label: 'Grupo SPED Fiscal — 22 empresas' },
      ],
    };

    $scope.loadGrupoClientes = function () {
      $scope.grupoClientesDisponiveis = gruposPorRobo[$scope.formAg.robo] || [];
      $scope.formAg.grupoClientes = '';
    };

    $scope.loadParamSchema = function () {
      if (!$scope.paramRobo) return;
      var r = $scope.robos.find(function (x) { return x.id === $scope.paramRobo; });
      $scope.paramSchema = r ? r.schema : [];
      $scope.paramValues = {};
    };

    $scope.getEmpresaNome = function (id) {
      var e = $scope.empresas.find(function (x) { return x.id === id; });
      return e ? e.nome : '';
    };

    $scope.getRoboNome = function (id) {
      var r = $scope.robos.find(function (x) { return x.id === id; });
      return r ? r.nome : '';
    };

    $scope.toggleDia = function (val) {
      $scope.formAg.dias[val] = !$scope.formAg.dias[val];
      var dias = Object.keys($scope.formAg.dias).filter(function (k) { return $scope.formAg.dias[k]; }).join(',');
      var h = ($scope.formAg.hora || '08:00').split(':');
      $scope.formAg.cronExpr = h[1] + ' ' + h[0] + ' * * ' + (dias || '*');
    };

    // Extrai apenas a sigla da moeda para exibição na tabela
    $scope.moedaSigla = function (str) {
      if (!str) return '—';
      return str.split(' ')[0];
    };

    var msgs = [
      ['Robô Fiscal', 'NF #00043521 emitida — OK'],
      ['Robô Comercial', 'Lead qualificado — score 87/100'],
      ['Robô Logística', 'Pedido #78241 atualizado — Em trânsito'],
      ['Robô RH', 'Ponto eletrônico sincronizado — 12 registros'],
      ['Robô Financeiro', 'Heartbeat recebido — tarefa em progresso'],
      ['Robô Fiscal', 'Consultando tabela ICMS — SP'],
    ];
    var msgIdx = 0;
    $interval(function () {
      var now = new Date();
      var ts = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2);
      var m = msgs[msgIdx % msgs.length];
      $scope.liveLogs.unshift({ ts: ts, robot: m[0], msg: m[1] });
      if ($scope.liveLogs.length > 8) $scope.liveLogs.pop();
      msgIdx++;
    }, 3000);
  });