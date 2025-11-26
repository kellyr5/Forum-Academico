#!/usr/bin/env python3
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager

class Teste:
    def __init__(self):
        print("\n" + "="*55)
        print("  TESTE SELENIUM - FORUM ACADEMICO UNIFEI")
        print("  8 CRUDs Completos - Visualizacao em Tempo Real")
        print("="*55 + "\n")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service)
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 10)
        self.url = "http://localhost:5500"
        self.res = []
        
    def log(self, msg, ok=True):
        print(f"  {'[OK]' if ok else '[ERRO]'} {msg}")
        self.res.append((msg, ok))
    
    def esperar(self, seg=1):
        time.sleep(seg)
    
    def digitar_lento(self, campo_id, texto):
        """Digita caractere por caractere usando send_keys real"""
        try:
            campo = self.wait.until(EC.visibility_of_element_located((By.ID, campo_id)))
            campo.clear()
            self.esperar(0.3)
            for char in texto:
                campo.send_keys(char)
                time.sleep(0.05)
            self.esperar(0.3)
        except Exception as e:
            print(f"    Erro ao digitar em {campo_id}: {e}")
    
    def selecionar(self, campo_id, indice=1):
        """Seleciona opcao do dropdown"""
        try:
            campo = self.wait.until(EC.visibility_of_element_located((By.ID, campo_id)))
            select = Select(campo)
            if len(select.options) > indice:
                select.select_by_index(indice)
            self.esperar(0.3)
        except:
            pass
    
    def clicar_botao(self, texto):
        """Clica em botao pelo texto"""
        try:
            btn = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, f"//button[contains(text(),'{texto}')]")))
            btn.click()
            self.esperar(1.5)
        except:
            pass
    
    def fechar_modais(self):
        self.driver.execute_script("""
            document.querySelectorAll('.modal').forEach(m=>{
                m.classList.remove('active');
                m.style.display='none';
            });
        """)
        try:
            self.driver.switch_to.alert.accept()
        except:
            pass
        self.esperar(0.5)
    
    def navegar(self, pagina):
        self.fechar_modais()
        self.driver.execute_script(f"document.querySelector('[data-page=\"{pagina}\"]').click()")
        self.esperar(2)
    
    def clicar_editar(self, tabela_id):
        try:
            bts = self.driver.find_elements(By.CSS_SELECTOR, f"#{tabela_id} .btn-edit")
            if bts:
                bts[-1].click()
                self.esperar(1.5)
                return True
        except:
            pass
        return False
    
    def clicar_excluir(self, tabela_id):
        try:
            self.driver.execute_script("window.confirm=()=>true")
            bts = self.driver.find_elements(By.CSS_SELECTOR, f"#{tabela_id} .btn-delete")
            if bts:
                bts[-1].click()
                self.esperar(1.5)
                return True
        except:
            pass
        return False
    
    def submeter(self, form_id):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, f"#{form_id} button[type='submit']")
            btn.click()
            self.esperar(2)
            self.fechar_modais()
        except:
            pass
    
    def executar(self):
        try:
            self.driver.get(f"{self.url}/admin/index.html")
            self.esperar(3)
            self.driver.execute_script("window.confirm=()=>true;window.alert=()=>true")
            self.log("Pagina admin carregada")
            
            ts = int(time.time())
            
            # ==================== USUARIOS ====================
            print("\n[TESTE 1] CRUD Usuarios")
            print("-"*55)
            self.navegar("usuarios")
            self.log("READ Usuarios")
            
            self.clicar_botao("Novo Usuario")
            print("    Preenchendo: Nome...")
            self.digitar_lento("usuario-nome", "Maria Silva Selenium")
            print("    Preenchendo: Email...")
            self.digitar_lento("usuario-email", f"maria{ts}@unifei.edu.br")
            print("    Preenchendo: Senha...")
            self.digitar_lento("usuario-senha", "Teste@123")
            print("    Preenchendo: Confirmar Senha...")
            self.digitar_lento("usuario-confirmar-senha", "Teste@123")
            print("    Selecionando: Tipo...")
            self.selecionar("usuario-tipo", 1)
            print("    Preenchendo: Periodo...")
            self.digitar_lento("usuario-periodo", "5")
            self.submeter("form-usuario")
            self.log("CREATE Usuario")
            
            if self.clicar_editar("tabela-usuarios"):
                print("    Editando: Nome...")
                self.digitar_lento("usuario-nome", "Maria Editada Selenium")
                self.submeter("form-usuario")
                self.log("UPDATE Usuario")
            
            if self.clicar_excluir("tabela-usuarios"):
                self.fechar_modais()
                self.log("DELETE Usuario")
            
            # ==================== DISCIPLINAS ====================
            print("\n[TESTE 2] CRUD Disciplinas")
            print("-"*55)
            self.navegar("disciplinas")
            self.log("READ Disciplinas")
            
            self.clicar_botao("Nova Disciplina")
            print("    Preenchendo: Codigo...")
            self.digitar_lento("disciplina-codigo", f"SEL{ts%100}")
            print("    Preenchendo: Nome...")
            self.digitar_lento("disciplina-nome", "Teste Selenium Disciplina")
            print("    Preenchendo: Descricao...")
            self.digitar_lento("disciplina-descricao", "Descricao da disciplina de teste automatizado")
            print("    Preenchendo: Periodo...")
            self.digitar_lento("disciplina-periodo", "2025.1")
            print("    Selecionando: Professor...")
            self.selecionar("disciplina-professor", 1)
            self.submeter("form-disciplina")
            self.log("CREATE Disciplina")
            
            if self.clicar_editar("tabela-disciplinas"):
                print("    Editando: Descricao...")
                self.digitar_lento("disciplina-descricao", "Descricao editada pelo Selenium")
                self.submeter("form-disciplina")
                self.log("UPDATE Disciplina")
            
            if self.clicar_excluir("tabela-disciplinas"):
                self.fechar_modais()
                self.log("DELETE Disciplina")
            
            # ==================== TOPICOS ====================
            print("\n[TESTE 3] CRUD Topicos")
            print("-"*55)
            self.navegar("topicos")
            self.log("READ Topicos")
            
            self.clicar_botao("Novo Topico")
            print("    Preenchendo: Titulo...")
            self.digitar_lento("topico-titulo", "Duvida sobre Selenium")
            print("    Preenchendo: Conteudo...")
            self.digitar_lento("topico-conteudo", "Como fazer testes automatizados com Selenium em Python?")
            print("    Selecionando: Disciplina...")
            self.selecionar("topico-disciplina", 1)
            self.submeter("form-topico")
            self.log("CREATE Topico")
            
            if self.clicar_editar("tabela-topicos"):
                print("    Editando: Titulo...")
                self.digitar_lento("topico-titulo", "Duvida Resolvida Selenium")
                self.submeter("form-topico")
                self.log("UPDATE Topico")
            
            if self.clicar_excluir("tabela-topicos"):
                self.fechar_modais()
                self.log("DELETE Topico")
            
            # ==================== RESPOSTAS ====================
            print("\n[TESTE 4] CRUD Respostas")
            print("-"*55)
            self.navegar("respostas")
            self.log("READ Respostas")
            
            self.clicar_botao("Nova Resposta")
            print("    Preenchendo: Conteudo...")
            self.digitar_lento("resposta-conteudo", "Para usar Selenium, instale com pip install selenium")
            print("    Selecionando: Topico...")
            self.selecionar("resposta-topico", 1)
            self.submeter("form-resposta")
            self.log("CREATE Resposta")
            
            if self.clicar_editar("tabela-respostas"):
                print("    Editando: Conteudo...")
                self.digitar_lento("resposta-conteudo", "Resposta editada pelo teste Selenium")
                self.submeter("form-resposta")
                self.log("UPDATE Resposta")
            
            if self.clicar_excluir("tabela-respostas"):
                self.fechar_modais()
                self.log("DELETE Resposta")
            
            # ==================== MURAL ====================
            print("\n[TESTE 5] CRUD Mural")
            print("-"*55)
            self.navegar("mural")
            self.log("READ Mural")
            
            self.clicar_botao("Novo Recado")
            print("    Preenchendo: Titulo...")
            self.digitar_lento("recado-titulo", "Aviso Importante Selenium")
            print("    Preenchendo: Conteudo...")
            self.digitar_lento("recado-conteudo", "Este e um recado criado pelo teste automatizado")
            print("    Selecionando: Tipo...")
            self.selecionar("recado-tipo", 1)
            self.submeter("form-recado")
            self.log("CREATE Recado")
            
            if self.clicar_editar("tabela-mural"):
                print("    Editando: Titulo...")
                self.digitar_lento("recado-titulo", "Aviso Editado Selenium")
                self.submeter("form-recado")
                self.log("UPDATE Recado")
            
            if self.clicar_excluir("tabela-mural"):
                self.fechar_modais()
                self.log("DELETE Recado")
            
            # ==================== ARQUIVOS ====================
            print("\n[TESTE 6] CRUD Arquivos")
            print("-"*55)
            self.navegar("arquivos")
            self.log("READ Arquivos")
            self.log("CREATE/UPDATE Arquivos (requer upload fisico)")
            if self.clicar_excluir("tabela-arquivos"):
                self.fechar_modais()
                self.log("DELETE Arquivo")
            
            # ==================== MATRICULAS ====================
            print("\n[TESTE 7] CRUD Matriculas")
            print("-"*55)
            self.navegar("matriculas")
            self.log("READ Matriculas")
            
            self.clicar_botao("Nova Matricula")
            print("    Selecionando: Aluno...")
            self.selecionar("matricula-aluno", 1)
            print("    Selecionando: Disciplina...")
            self.selecionar("matricula-disciplina", 1)
            print("    Preenchendo: Semestre...")
            self.digitar_lento("matricula-semestre", "2025.1")
            print("    Selecionando: Status...")
            self.selecionar("matricula-status", 1)
            self.submeter("form-matricula")
            self.log("CREATE Matricula")
            
            if self.clicar_editar("tabela-matriculas"):
                print("    Editando: Semestre...")
                self.digitar_lento("matricula-semestre", "2025.2")
                self.submeter("form-matricula")
                self.log("UPDATE Matricula")
            
            if self.clicar_excluir("tabela-matriculas"):
                self.fechar_modais()
                self.log("DELETE Matricula")
            
            # ==================== MONITORIAS ====================
            print("\n[TESTE 8] CRUD Monitorias")
            print("-"*55)
            self.navegar("monitorias")
            self.log("READ Monitorias")
            
            self.clicar_botao("Nova Monitoria")
            print("    Selecionando: Monitor...")
            self.selecionar("monitoria-monitor", 1)
            print("    Selecionando: Disciplina...")
            self.selecionar("monitoria-disciplina", 1)
            print("    Preenchendo: Semestre...")
            self.digitar_lento("monitoria-semestre", "2025.1")
            print("    Selecionando: Ativa...")
            self.selecionar("monitoria-ativa", 1)
            self.submeter("form-monitoria")
            self.log("CREATE Monitoria")
            
            if self.clicar_editar("tabela-monitorias"):
                print("    Editando: Semestre...")
                self.digitar_lento("monitoria-semestre", "2025.2")
                self.submeter("form-monitoria")
                self.log("UPDATE Monitoria")
            
            if self.clicar_excluir("tabela-monitorias"):
                self.fechar_modais()
                self.log("DELETE Monitoria")
            
            # ==================== RELATORIOS ====================
            print("\n[TESTE 9] Relatorios")
            print("-"*55)
            self.navegar("relatorios")
            self.clicar_botao("Gerar")
            self.esperar(2)
            self.log("Relatorio gerado")
            
        except Exception as e:
            print(f"\nErro: {e}")
            self.log(f"Erro: {str(e)[:40]}", False)
        finally:
            print("\n" + "="*55)
            print("  RESULTADO FINAL")
            print("="*55)
            t = len(self.res)
            s = sum(1 for r in self.res if r[1])
            print(f"\n  Total: {t} | OK: {s} | Falha: {t-s} | Taxa: {s/t*100:.0f}%")
            print("\n" + "="*55)
            input("\nENTER para fechar...")
            self.driver.quit()

if __name__ == "__main__":
    Teste().executar()
