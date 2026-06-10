angular.module('OrchestratorApp', [])
  .controller('LoginCtrl', function ($scope, $timeout) {
    $scope.tipo = 'user';
    $scope.form = {};
    $scope.focus = {};
    $scope.carregando = false;
    $scope.erro = '';
    $scope.mostrarSenha = false;
    $scope.mostrarSecret = false;

    // Pré-preenche se lembrar-me estava marcado
    var lembrar = localStorage.getItem('rpa_lembrar');
    var savedSession = JSON.parse(localStorage.getItem('rpa_session') || 'null');
    if (lembrar === 'true' && savedSession) {
      $scope.form = savedSession;
      $scope.form.lembrar = true;
    }

    var DEMO_EMAIL = 'admin@rpa.com';
    var DEMO_SENHA = 'admin123';
    var DEMO_APIKEY = 'rpa_key_demo';
    var DEMO_SECRET = 'secret_demo';

    $scope.resetForm = function () {
      $scope.form = {};
      $scope.erro = '';
      $scope.mostrarSenha = false;
      $scope.mostrarSecret = false;
    };

    // Use mousedown + preventDefault to avoid blur before toggle fires
    $scope.toggleSenha = function ($event) {
      $event.preventDefault();
      $scope.mostrarSenha = !$scope.mostrarSenha;
      var el = document.getElementById('senha-input');
      el.type = $scope.mostrarSenha ? 'text' : 'password';
      el.focus();
    };

    $scope.toggleSecret = function ($event) {
      $event.preventDefault();
      $scope.mostrarSecret = !$scope.mostrarSecret;
      var el = document.getElementById('secret-input');
      el.type = $scope.mostrarSecret ? 'text' : 'password';
      el.focus();
    };

    $scope.entrar = function () {
      $scope.erro = '';

      if ($scope.carregando) return;
      var ok = false;
      if ($scope.tipo === 'user') {
        if (!$scope.form.email || !$scope.form.senha) return;
        ok = ($scope.form.email === DEMO_EMAIL && $scope.form.senha === DEMO_SENHA);
      } else {
        if (!$scope.form.apikey || !$scope.form.secret) return;
        ok = ($scope.form.apikey === DEMO_APIKEY && $scope.form.secret === DEMO_SECRET);
      }

      $scope.carregando = true;

      $timeout(function () {
        $scope.carregando = false;
        if (ok) {
          var sessionData = $scope.tipo === 'user'
            ? { email: $scope.form.email, senha: $scope.form.senha }
            : { apikey: $scope.form.apikey, secret: $scope.form.secret };
          localStorage.setItem('rpa_lembrar', $scope.form.lembrar ? 'true' : 'false');
          if ($scope.form.lembrar) {
            localStorage.setItem('rpa_session', JSON.stringify(sessionData));
          } else {
            localStorage.removeItem('rpa_session');
          }
          window.location.href = '../index.html';
        } else {
          $scope.erro = $scope.tipo === 'user'
            ? 'E-mail ou senha inválidos. Verifique suas credenciais.'
            : 'API Key ou Secret inválidos.';
        }
      }, 1400);
    };

    $scope.esqueceuSenha = function () {
      alert('Link de recuperação enviado para: ' + ($scope.form.email || 'seu e-mail'));
    };
  });
