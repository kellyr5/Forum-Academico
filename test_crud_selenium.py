#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import random
import requests

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


# ================= CONFIG =================

BASE_URL = os.environ.get("BASE_URL", "http://localhost:5500/")
API_URL  = os.environ.get("API_URL", "http://localhost:3000")
ADMIN_EMAIL = "admin@unifei.edu.br"
ADMIN_SENHA = "Teste@123"


class TestCRUD:

    # ================= INIT =================

    def __init__(self):
        print("=" * 60)
        print("🚀 TESTE AUTOMATIZADO - MATRÍCULAS E MONITORIAS")
        print("=" * 60)

        options = Options()
        options.add_argument("--start-maximized")

        if os.environ.get("HEADLESS", "0") == "1":
            options.add_argument("--headless=new")

        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)

        self.wait = WebDriverWait(self.driver, 15)
        self.action = ActionChains(self.driver)

        # Velocidade padrão
        self.min_delay = 0.04
        self.max_delay = 0.09
        self.click_delay = 0.3

        # Edição lenta
        self.min_delay_edit = 0.12
        self.max_delay_edit = 0.22
        self.click_delay_edit = 1.0

        self.resultados = {"passou": 0, "falhou": 0, "testes": []}


    # ================= HELPERS =================

    def log(self, msg, tipo="info"):
        icons = {"info": "ℹ️", "ok": "✅", "erro": "❌"}
        print(f"{icons.get(tipo)} {msg}")

    def registrar(self, nome, passou, erro=""):
        self.resultados["testes"].append({
            "teste": nome,
            "status": "PASSOU" if passou else "FALHOU",
            "erro": erro
        })
        self.resultados["passou" if passou else "falhou"] += 1
        self.log(f"{nome}: {'PASSOU' if passou else 'FALHOU'}", "ok" if passou else "erro")

    def clicar(self, by, valor):
        el = self.wait.until(EC.element_to_be_clickable((by, valor)))
        el.click()
        time.sleep(self.click_delay)
        return el

    def esperar(self, by, valor):
        return self.wait.until(EC.visibility_of_element_located((by, valor)))

    def digitar(self, campo, texto, modo="normal"):
        campo.clear()

        if modo == "edit":
            minimo = self.min_delay_edit
            maximo = self.max_delay_edit
        else:
            minimo = self.min_delay
            maximo = self.max_delay

        for c in texto:
            campo.send_keys(c)
            time.sleep(random.uniform(minimo, maximo))

    def preencher(self, by, valor, texto, modo="normal"):
        campo = self.esperar(by, valor)
        self.digitar(campo, texto, modo)

    def selecionar(self, by, valor, indice):
        select = Select(self.esperar(by, valor))
        select.select_by_index(indice)
        time.sleep(self.click_delay)

    def navegar(self, pagina):
        self.clicar(By.CSS_SELECTOR, f"[data-page='{pagina}']")


    # ================= LOGIN =================

    def login(self):
        self.driver.get(f"{BASE_URL}login.html")
        self.preencher(By.ID, "email", ADMIN_EMAIL)
        self.preencher(By.ID, "senha", ADMIN_SENHA)
        self.clicar(By.CSS_SELECTOR, "button[type='submit']")
        time.sleep(2)


    # ================= MATRÍCULAS =================

    def matricula_create(self):
        self.log("Criar Matrícula")
        try:
            self.navegar("matriculas")
            self.clicar(By.ID, "btn-nova-matricula")

            self.selecionar(By.ID, "matricula-aluno", 1)
            self.selecionar(By.ID, "matricula-disciplina", 1)
            self.preencher(By.ID, "matricula-semestre", "2025.1")

            Select(self.driver.find_element(By.ID, "matricula-status")).select_by_value("Ativa")
            self.clicar(By.ID, "btn-salvar-matricula")

            self.registrar("Criar Matrícula", True)
        except Exception as e:
            self.registrar("Criar Matrícula", False, str(e))


    def matricula_read(self):
        self.log("Ler Matrículas")
        try:
            self.navegar("matriculas")
            linhas = self.driver.find_elements(By.CSS_SELECTOR, "#tabela-matriculas tbody tr")
            if not linhas:
                raise Exception("Nenhuma matrícula encontrada")
            self.registrar("Ler Matrículas", True)
        except Exception as e:
            self.registrar("Ler Matrículas", False, str(e))


    # ✅ AGORA EDITA PELA INTERFACE (NÃO VOLTA PARA DASHBOARD)
    def matricula_update(self):
        self.log("Editar status da Matrícula (UI)")

        try:
            self.navegar("matriculas")
            self.wait.until(EC.visibility_of_element_located((By.ID, "tabela-matriculas")))

            linha = self.driver.find_element(By.CSS_SELECTOR, "#tabela-matriculas tbody tr")
            linha.find_element(By.CLASS_NAME, "btn-edit").click()
            time.sleep(self.click_delay_edit)

            Select(self.driver.find_element(By.ID, "matricula-status")).select_by_value("Trancada")
            time.sleep(self.click_delay_edit)

            self.clicar(By.ID, "btn-salvar-matricula")
            time.sleep(self.click_delay_edit)

            self.registrar("Editar Matrícula", True)

        except Exception as e:
            self.registrar("Editar Matrícula", False, str(e))


    def matricula_delete(self):
        self.log("Excluir Matrícula")
        try:
            self.navegar("matriculas")
            linha = self.driver.find_element(By.CSS_SELECTOR, "#tabela-matriculas tbody tr")
            linha.find_element(By.CLASS_NAME, "btn-delete").click()
            time.sleep(1)
            self.driver.switch_to.alert.accept()
            self.registrar("Excluir Matrícula", True)
        except Exception as e:
            self.registrar("Excluir Matrícula", False, str(e))


    # ================= MONITORIAS =================

    def monitoria_create(self):
        self.log("Criar Monitoria")
        try:
            self.navegar("monitorias")
            self.clicar(By.ID, "btn-nova-monitoria")

            self.selecionar(By.ID, "monitoria-monitor", 1)
            self.selecionar(By.ID, "monitoria-disciplina", 1)
            self.preencher(By.ID, "monitoria-semestre", "2025.1")

            Select(self.driver.find_element(By.ID, "monitoria-ativa")).select_by_value("1")
            self.clicar(By.ID, "btn-salvar-monitoria")

            self.registrar("Criar Monitoria", True)
        except Exception as e:
            self.registrar("Criar Monitoria", False, str(e))


    def monitoria_read(self):
        self.log("Ler Monitorias")
        try:
            self.navegar("monitorias")
            linhas = self.driver.find_elements(By.CSS_SELECTOR, "#tabela-monitorias tbody tr")
            if not linhas:
                raise Exception("Nenhuma monitoria encontrada")
            self.registrar("Ler Monitorias", True)
        except Exception as e:
            self.registrar("Ler Monitorias", False, str(e))


    def monitoria_update(self):
        self.log("Editar ativa da Monitoria (UI)")

        try:
            self.navegar("monitorias")
            self.wait.until(EC.visibility_of_element_located((By.ID, "tabela-monitorias")))

            linha = self.driver.find_element(By.CSS_SELECTOR, "#tabela-monitorias tbody tr")
            linha.find_element(By.CLASS_NAME, "btn-edit").click()
            time.sleep(self.click_delay_edit)

            Select(self.driver.find_element(By.ID, "monitoria-ativa")).select_by_value("0")
            time.sleep(self.click_delay_edit)

            self.clicar(By.ID, "btn-salvar-monitoria")
            time.sleep(self.click_delay_edit)

            self.registrar("Editar Monitoria", True)

        except Exception as e:
            self.registrar("Editar Monitoria", False, str(e))


    def monitoria_delete(self):
        self.log("Excluir Monitoria")
        try:
            self.navegar("monitorias")
            linha = self.driver.find_element(By.CSS_SELECTOR, "#tabela-monitorias tbody tr")
            linha.find_element(By.CLASS_NAME, "btn-delete").click()
            time.sleep(1)
            self.driver.switch_to.alert.accept()
            self.registrar("Excluir Monitoria", True)
        except Exception as e:
            self.registrar("Excluir Monitoria", False, str(e))


    # ================= EXEC =================

    def executar(self):
        self.login()

        # MATRÍCULAS
        self.matricula_create()
        self.matricula_read()
        self.matricula_update()
        self.matricula_delete()

        # MONITORIAS
        self.monitoria_create()
        self.monitoria_read()
        self.monitoria_update()
        self.monitoria_delete()

        print("\n📊 RESULTADO FINAL:")
        for t in self.resultados["testes"]:
            print(t)

        time.sleep(5)
        self.driver.quit()


# ================= MAIN =================

if __name__ == "__main__":
    TestCRUD().executar()
