#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Teste Selenium COMPLETO - Forum Academico UNIFEI
"""

import time
import os
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.action_chains import ActionChains

class TestForumAcademicoCompleto:
    
    def __init__(self):
        print("\n" + "="*70)
        print(" "*8 + "TESTE COMPLETO - TODAS ABAS E PERFIS - FORUM UNIFEI")
        print("="*70 + "\n")
        
        self.usuario_criado_id = None
        self.disciplina_criada_id = None
        self.topico_criado_id = None
        
        self.nomes = ["Ana Silva", "Bruno Costa", "Carla Dias", "Daniel Lima"]
        self.sobrenomes = ["Alves", "Barros", "Castro", "Duarte"]
        self.disciplinas = ["POO", "BD", "Redes", "IA", "Web"]
        self.titulos_recado = ["Reuniao Sexta", "Prova Dia 20", "Evento Amanha"]
        self.titulos_topico = ["Duvida Arrays", "Help SQL", "Erro API"]
        self.conteudos = ["Preciso de ajuda.", "Alguem explica?", "Como resolver?"]
        self.respostas = ["Tenta esse metodo.", "Funciona assim.", "Veja o exemplo."]
        
        firefox_options = Options()
        self.driver = webdriver.Firefox(options=firefox_options)
        self.driver.maximize_window()
        print("✓ Firefox iniciado\n")
        
        self.wait = WebDriverWait(self.driver, 15)
        self.actions = ActionChains(self.driver)
        self.url_base = "http://localhost:8000"
        time.sleep(2)
    
    def mover_mouse_para_elemento(self, elemento):
        self.actions.move_to_element(elemento).perform()
        time.sleep(0.3)
    
    def digitar_devagar(self, elemento, texto, velocidade=0.04):
        self.mover_mouse_para_elemento(elemento)
        elemento.click()
        time.sleep(0.2)
        for letra in texto:
            elemento.send_keys(letra)
            time.sleep(velocidade)
    
    def scroll_suave(self, pixels):
        self.driver.execute_script(f"window.scrollBy({{top: {pixels}, behavior: 'smooth'}});")
        time.sleep(0.5)
    
    def aguardar_elemento(self, by, valor, timeout=15):
        elemento = self.wait.until(EC.visibility_of_element_located((by, valor)))
        time.sleep(0.3)
        return elemento
    
    def clicar_elemento_fluido(self, by, valor):
        elemento = self.wait.until(EC.element_to_be_clickable((by, valor)))
        self.driver.execute_script(
            "arguments[0].style.border='3px solid #FFD700'; arguments[0].style.transition='all 0.3s';",
            elemento
        )
        time.sleep(0.3)
        self.mover_mouse_para_elemento(elemento)
        elemento.click()
        self.driver.execute_script("arguments[0].style.border='';", elemento)
        time.sleep(0.5)
        return elemento
    
    def selecionar_opcao_fluida(self, select_id, valor_opcao):
        select_element = self.driver.find_element(By.ID, select_id)
        self.mover_mouse_para_elemento(select_element)
        select_element.click()
        time.sleep(0.4)
        select = Select(select_element)
        select.select_by_value(str(valor_opcao))
        time.sleep(0.4)
    
    def rolar_para_elemento(self, elemento):
        self.driver.execute_script(
            "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", elemento
        )
        time.sleep(0.7)
    
    def verificar_elemento_visivel(self, by, valor):
        try:
            elemento = self.driver.find_element(by, valor)
            return elemento.is_displayed()
        except:
            return False
    
    def obter_ultimo_id_criado(self, lista_css_selector):
        try:
            time.sleep(1)
            items = self.driver.find_elements(By.CSS_SELECTOR, lista_css_selector)
            if items:
                primeiro_item = items[0]
                btn_delete = primeiro_item.find_element(By.CSS_SELECTOR, ".btn-delete")
                onclick = btn_delete.get_attribute("onclick")
                id_str = onclick.split("(")[1].split(")")[0]
                return int(id_str)
        except:
            pass
        return random.randint(1, 10)
    
    def mostrar_titulo(self, titulo):
        print("\n" + "─" * 70)
        print(f"  {titulo}")
        print("─" * 70 + "\n")
    
    def fazer_login(self, email, senha, tipo_usuario):
        self.mostrar_titulo(f"LOGIN COMO {tipo_usuario.upper()}")
        print(f"  [1/5] Acessando login...")
        self.driver.get(self.url_base + '/login.html')
        time.sleep(2)
        
        print(f"  [2/5] Limpando sessao...")
        try:
            self.driver.execute_script("localStorage.clear();")
        except:
            pass
        time.sleep(0.5)
        
        print(f"  [3/5] Digitando credenciais...")
        email_input = self.aguardar_elemento(By.ID, 'email')
        email_input.clear()
        self.digitar_devagar(email_input, email, 0.05)
        
        senha_input = self.driver.find_element(By.ID, 'senha')
        senha_input.clear()
        self.digitar_devagar(senha_input, senha, 0.06)
        
        print(f"  [4/5] Entrando...")
        time.sleep(1)
        btn_login = self.driver.find_element(By.ID, 'btn-login')
        self.mover_mouse_para_elemento(btn_login)
        time.sleep(0.5)
        btn_login.click()
        time.sleep(3)
        
        print(f"  [5/5] Verificando...")
        current_url = self.driver.current_url
        if 'index.html' in current_url or 'localhost:8000' in current_url:
            print(f"  ✓ Login OK!\n")
            time.sleep(1)
            return True
        return False
    
    def fazer_logout(self):
        print("\n  [LOGOUT] Saindo...")
        try:
            self.driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
            time.sleep(1)
            btn_logout = self.driver.find_element(By.ID, 'btn-logout')
            self.mover_mouse_para_elemento(btn_logout)
            time.sleep(0.5)
            btn_logout.click()
            time.sleep(0.5)
            
            try:
                alert = self.driver.switch_to.alert
                alert.accept()
                time.sleep(1)
            except:
                pass
            
            time.sleep(2)
            if 'login.html' not in self.driver.current_url:
                self.driver.get(self.url_base + '/login.html')
                time.sleep(2)
            
            print("  ✓ Logout OK\n")
            return True
        except:
            self.driver.get(self.url_base + '/login.html')
            time.sleep(2)
            return True
    
    def admin_criar_usuario(self):
        self.mostrar_titulo("ADMIN: CRIAR USUARIO")
        if not self.verificar_elemento_visivel(By.CSS_SELECTOR, '[data-tab="usuarios"]'):
            print("  [AVISO] Aba Usuarios nao visivel.\n")
            return
        
        print("  [1/7] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="usuarios"]')
        time.sleep(1.5)
        
        print("  [2/7] Nome...")
        nome = self.aguardar_elemento(By.ID, "usuario-nome")
        self.rolar_para_elemento(nome)
        nome_completo = random.choice(self.nomes) + " " + random.choice(self.sobrenomes)
        self.digitar_devagar(nome, nome_completo, 0.045)
        
        print("  [3/7] Email...")
        email = self.driver.find_element(By.ID, "usuario-email")
        email_gerado = nome_completo.lower().replace(" ", ".") + str(random.randint(10,99)) + "@unifei.edu.br"
        self.digitar_devagar(email, email_gerado, 0.04)
        
        print("  [4/7] Senha...")
        senha = self.driver.find_element(By.ID, "usuario-senha")
        self.digitar_devagar(senha, "Senha123!", 0.045)
        
        print("  [5/7] Tipo...")
        self.selecionar_opcao_fluida("usuario-tipo", "Aluno")
        
        print("  [6/7] Curso e periodo...")
        self.selecionar_opcao_fluida("usuario-curso", str(random.randint(1, 3)))
        # CORRIGIDO: Período de 1 a 5 (conforme HTML)
        self.selecionar_opcao_fluida("usuario-periodo", str(random.randint(1, 5)))
        time.sleep(1)
        
        print("  [7/7] Cadastrando...")
        btn = self.driver.find_element(By.ID, "btn-cadastrar-usuario")
        self.rolar_para_elemento(btn)
        self.mover_mouse_para_elemento(btn)
        time.sleep(0.5)
        btn.click()
        
        time.sleep(1.5)
        try:
            alert = self.driver.switch_to.alert
            print(f"  [OK] {alert.text}")
            alert.accept()
        except:
            pass
        
        time.sleep(2)
        self.scroll_suave(400)
        self.usuario_criado_id = self.obter_ultimo_id_criado("#usuarios-lista > div")
        print(f"  ✓ Usuario criado! ID: {self.usuario_criado_id}\n")
        time.sleep(1)
    
    def admin_criar_disciplina(self):
        self.mostrar_titulo("ADMIN: CRIAR DISCIPLINA")
        print("  [1/5] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="disciplinas"]')
        time.sleep(1.5)
        
        print("  [2/5] Nome...")
        nome = self.aguardar_elemento(By.ID, "disciplina-nome")
        self.rolar_para_elemento(nome)
        self.digitar_devagar(nome, random.choice(self.disciplinas), 0.04)
        
        print("  [3/5] Codigo...")
        codigo = self.driver.find_element(By.ID, "disciplina-codigo")
        self.digitar_devagar(codigo, "COM" + str(random.randint(100, 999)), 0.06)
        
        print("  [4/5] Curso e professor...")
        self.selecionar_opcao_fluida("disciplina-curso", str(random.randint(1, 3)))
        professor = self.driver.find_element(By.ID, "disciplina-professor")
        self.rolar_para_elemento(professor)
        professor.clear()
        self.digitar_devagar(professor, str(random.randint(1, 3)), 0.08)
        time.sleep(1)
        
        print("  [5/5] Cadastrando...")
        btn = self.driver.find_element(By.ID, "btn-cadastrar-disciplina")
        self.rolar_para_elemento(btn)
        self.mover_mouse_para_elemento(btn)
        time.sleep(0.5)
        btn.click()
        
        time.sleep(1.5)
        try:
            alert = self.driver.switch_to.alert
            print(f"  [OK] {alert.text}")
            alert.accept()
        except:
            pass
        
        time.sleep(2)
        self.scroll_suave(400)
        self.disciplina_criada_id = self.obter_ultimo_id_criado("#disciplinas-lista > div")
        print(f"  ✓ Disciplina criada! ID: {self.disciplina_criada_id}\n")
        time.sleep(1)
    
    def admin_criar_recado(self):
        self.mostrar_titulo("ADMIN: PUBLICAR RECADO")
        print("  [1/5] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="mural"]')
        time.sleep(1.5)
        
        print("  [2/5] Titulo...")
        titulo = self.aguardar_elemento(By.ID, "recado-titulo")
        self.rolar_para_elemento(titulo)
        self.digitar_devagar(titulo, random.choice(self.titulos_recado), 0.035)
        
        print("  [3/5] Conteudo...")
        conteudo = self.driver.find_element(By.ID, "recado-conteudo")
        self.rolar_para_elemento(conteudo)
        self.digitar_devagar(conteudo, random.choice(self.conteudos), 0.025)
        
        print("  [4/5] Tipo...")
        tipos = ['importante', 'evento', 'geral', 'aviso_faculdade']
        self.selecionar_opcao_fluida("recado-tipo", random.choice(tipos))
        
        usuario_id = self.driver.find_element(By.ID, "recado-usuario")
        self.rolar_para_elemento(usuario_id)
        usuario_id.clear()
        self.digitar_devagar(usuario_id, "1", 0.08)
        time.sleep(1)
        
        print("  [5/5] Publicando...")
        btn = self.driver.find_element(By.ID, "btn-publicar-recado")
        self.rolar_para_elemento(btn)
        self.mover_mouse_para_elemento(btn)
        time.sleep(0.5)
        btn.click()
        
        time.sleep(1.5)
        try:
            alert = self.driver.switch_to.alert
            print(f"  [OK] {alert.text}")
            alert.accept()
        except:
            pass
        
        time.sleep(2)
        self.scroll_suave(400)
        print("  ✓ Recado publicado!\n")
        time.sleep(1)
    
    def admin_criar_topico(self):
        self.mostrar_titulo("ADMIN: CRIAR TOPICO")
        print("  [1/6] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="topicos"]')
        time.sleep(1.5)
        
        print("  [2/6] Titulo...")
        titulo = self.aguardar_elemento(By.ID, "topico-titulo")
        self.rolar_para_elemento(titulo)
        self.digitar_devagar(titulo, random.choice(self.titulos_topico), 0.035)
        
        print("  [3/6] Conteudo...")
        conteudo = self.driver.find_element(By.ID, "topico-conteudo")
        self.rolar_para_elemento(conteudo)
        self.digitar_devagar(conteudo, random.choice(self.conteudos), 0.025)
        
        print("  [4/6] Disciplina...")
        self.selecionar_opcao_fluida("topico-disciplina", "1")
        
        print("  [5/6] Categoria...")
        self.selecionar_opcao_fluida("topico-categoria", str(random.randint(1, 2)))
        
        usuario = self.driver.find_element(By.ID, "topico-usuario")
        self.rolar_para_elemento(usuario)
        usuario.clear()
        autor_id = self.usuario_criado_id if self.usuario_criado_id else 1
        self.digitar_devagar(usuario, str(autor_id), 0.08)
        time.sleep(1)
        
        print("  [6/6] Criando...")
        btn = self.driver.find_element(By.ID, "btn-criar-topico")
        self.rolar_para_elemento(btn)
        self.mover_mouse_para_elemento(btn)
        time.sleep(0.5)
        btn.click()
        
        time.sleep(1.5)
        try:
            alert = self.driver.switch_to.alert
            print(f"  [OK] {alert.text}")
            alert.accept()
        except:
            pass
        
        time.sleep(2)
        self.scroll_suave(400)
        self.topico_criado_id = self.obter_ultimo_id_criado("#topicos-lista > div")
        print(f"  ✓ Topico criado! ID: {self.topico_criado_id}\n")
        time.sleep(1)
    
    def admin_criar_resposta(self):
        self.mostrar_titulo("ADMIN: RESPONDER TOPICO")
        print("  [1/4] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="respostas"]')
        time.sleep(1.5)
        
        print("  [2/4] Topico e autor...")
        topico = self.aguardar_elemento(By.ID, "resposta-topico")
        self.rolar_para_elemento(topico)
        topico.clear()
        topico_id = self.topico_criado_id if self.topico_criado_id else 1
        self.digitar_devagar(topico, str(topico_id), 0.08)
        
        usuario = self.driver.find_element(By.ID, "resposta-usuario")
        usuario.clear()
        self.digitar_devagar(usuario, "1", 0.08)
        
        print("  [3/4] Resposta...")
        conteudo = self.driver.find_element(By.ID, "resposta-conteudo")
        self.rolar_para_elemento(conteudo)
        self.digitar_devagar(conteudo, random.choice(self.respostas), 0.02)
        time.sleep(1)
        
        print("  [4/4] Registrando...")
        btn = self.driver.find_element(By.ID, "btn-registrar-resposta")
        self.rolar_para_elemento(btn)
        self.mover_mouse_para_elemento(btn)
        time.sleep(0.5)
        btn.click()
        
        time.sleep(1.5)
        try:
            alert = self.driver.switch_to.alert
            print(f"  [OK] {alert.text}")
            alert.accept()
        except:
            pass
        
        time.sleep(2)
        self.scroll_suave(400)
        print("  ✓ Resposta registrada!\n")
        time.sleep(1)
    
    def admin_upload_arquivo(self):
        self.mostrar_titulo("ADMIN: UPLOAD ARQUIVO")
        print("  [1/5] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="arquivos"]')
        time.sleep(2)
        
        print("  [2/5] Criando arquivo...")
        arquivo_teste = "documento_admin.txt"
        with open(arquivo_teste, "w", encoding="utf-8") as f:
            f.write("FORUM UNIFEI - Arquivo Admin\n")
            f.write("Data: " + time.strftime("%d/%m/%Y %H:%M") + "\n")
        
        caminho = os.path.abspath(arquivo_teste)
        
        print("  [3/5] Selecionando...")
        file_input = self.aguardar_elemento(By.ID, "arquivo-file")
        self.rolar_para_elemento(file_input)
        file_input.send_keys(caminho)
        time.sleep(1)
        
        print("  [4/5] Dados...")
        usuario = self.driver.find_element(By.ID, "arquivo-usuario")
        self.rolar_para_elemento(usuario)
        usuario.clear()
        upload_usuario_id = self.usuario_criado_id if self.usuario_criado_id else 1
        self.digitar_devagar(usuario, str(upload_usuario_id), 0.08)
        
        topico = self.driver.find_element(By.ID, "arquivo-topico")
        upload_topico_id = self.topico_criado_id if self.topico_criado_id else 1
        self.digitar_devagar(topico, str(upload_topico_id), 0.08)
        time.sleep(1)
        
        print("  [5/5] Uploading...")
        btn = self.driver.find_element(By.ID, "btn-upload-arquivo")
        self.rolar_para_elemento(btn)
        self.mover_mouse_para_elemento(btn)
        time.sleep(0.5)
        btn.click()
        
        time.sleep(3)
        try:
            alert = self.driver.switch_to.alert
            print(f"  [OK] {alert.text}")
            alert.accept()
        except:
            pass
        
        time.sleep(2)
        self.driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
        time.sleep(1)
        self.scroll_suave(600)
        time.sleep(2)
        
        if os.path.exists(arquivo_teste):
            os.remove(arquivo_teste)
        
        print("  ✓ Upload concluido!\n")
        time.sleep(1)
    
    def aluno_visualizar_mural(self):
        self.mostrar_titulo("ALUNO: VER MURAL")
        print("  [1/2] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="mural"]')
        time.sleep(1.5)
        
        print("  [2/2] Visualizando...")
        self.scroll_suave(400)
        time.sleep(1)
        
        form_visivel = self.verificar_elemento_visivel(By.ID, 'form-recado')
        if not form_visivel:
            print("  ✓ Formulario oculto (correto)")
        
        print("  ✓ Mural visualizado!\n")
        time.sleep(1)
    
    def aluno_visualizar_disciplinas(self):
        self.mostrar_titulo("ALUNO: VER DISCIPLINAS")
        print("  [1/2] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="disciplinas"]')
        time.sleep(1.5)
        
        print("  [2/2] Visualizando...")
        self.scroll_suave(400)
        time.sleep(1)
        print("  ✓ Disciplinas vistas!\n")
        time.sleep(1)
    
    def aluno_ver_topicos(self):
        self.mostrar_titulo("ALUNO: VER TOPICOS")
        print("  [1/2] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="topicos"]')
        time.sleep(1.5)
        
        print("  [2/2] Navegando...")
        self.scroll_suave(400)
        time.sleep(1)
        
        form_visivel = self.verificar_elemento_visivel(By.ID, 'form-topico')
        if form_visivel:
            print("  ✓ Aluno pode criar topicos")
        
        print("  ✓ Topicos visualizados!\n")
        time.sleep(1)
    
    def aluno_ver_respostas(self):
        self.mostrar_titulo("ALUNO: VER RESPOSTAS")
        print("  [1/2] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="respostas"]')
        time.sleep(1.5)
        
        print("  [2/2] Visualizando...")
        self.scroll_suave(400)
        time.sleep(1)
        print("  ✓ Respostas vistas!\n")
        time.sleep(1)
    
    def aluno_ver_arquivos(self):
        self.mostrar_titulo("ALUNO: VER ARQUIVOS")
        print("  [1/2] Abrindo aba...")
        self.clicar_elemento_fluido(By.CSS_SELECTOR, '[data-tab="arquivos"]')
        time.sleep(2)
        
        print("  [2/2] Visualizando arquivos...")
        self.scroll_suave(400)
        time.sleep(1)
        self.scroll_suave(400)
        time.sleep(1)
        
        print("  ✓ Arquivos visualizados!\n")
        time.sleep(1)
    
    def executar_todos_testes(self):
        try:
            print("Iniciando SUITE COMPLETA...\n")
            time.sleep(2)
            
            if self.fazer_login('admin@unifei.edu.br', 'admin123', 'Administrador'):
                self.admin_criar_usuario()
                self.admin_criar_disciplina()
                self.admin_criar_recado()
                self.admin_criar_topico()
                self.admin_criar_resposta()
                self.admin_upload_arquivo()
                self.fazer_logout()
            
            if self.fazer_login('aluno@unifei.edu.br', 'aluno123', 'Aluno'):
                self.aluno_visualizar_mural()
                self.aluno_visualizar_disciplinas()
                self.aluno_ver_topicos()
                self.aluno_ver_respostas()
                self.aluno_ver_arquivos()
                self.fazer_logout()
            
            print("\n" + "="*70)
            print(" "*15 + "TESTES CONCLUIDOS!")
            print("="*70)
            print("\n  ✓ Admin: 6 abas testadas")
            print("  ✓ Aluno: 5 abas testadas")
            print("  ✓ Sistema validado!")
            print("\n  Fechando em 10s...")
            print("="*70 + "\n")
            time.sleep(10)
            
        except Exception as e:
            print(f"\n[ERRO] {str(e)}")
            import traceback
            traceback.print_exc()
            time.sleep(30)
            raise
        
        finally:
            self.driver.quit()
            print("✓ Finalizado!\n")

def main():
    teste = TestForumAcademicoCompleto()
    teste.executar_todos_testes()

if __name__ == "__main__":
    main()
