"use strict";

function inicializarMenuMobile() {
	const menuMobile = document.querySelector(".menu-mobile");
	if (!menuMobile) return;

	const botaoMenu = menuMobile.querySelector(".menu-mobile-botao");
	const telaMobile = window.matchMedia("(max-width: 800px)");

	function ajustarMenu() {
		menuMobile.open = !telaMobile.matches;
	}

	ajustarMenu();
	telaMobile.addEventListener("change", ajustarMenu);

	menuMobile.querySelectorAll('a[href^="#"]').forEach((link) => {
		link.addEventListener("click", () => {
			const destino = document.querySelector(link.getAttribute("href"));

			if (telaMobile.matches) {
				menuMobile.removeAttribute("open");
				if (destino) {
					destino.setAttribute("tabindex", "-1");
					destino.focus({ preventScroll: true });
				}
			}
		});
	});

	document.addEventListener("click", (evento) => {
		if (telaMobile.matches && !menuMobile.contains(evento.target)) {
			menuMobile.removeAttribute("open");
		}
	});

	document.addEventListener("keydown", (evento) => {
		if (evento.key === "Escape" && telaMobile.matches && menuMobile.open) {
			menuMobile.removeAttribute("open");
			botaoMenu.focus();
		}
	});
}

function inicializarNavegacaoAtiva() {
	if (!("IntersectionObserver" in window)) return;

	const linksNavegacao = document.querySelectorAll('.menu-mobile a[href^="#"]');
	const secoes = [...new Set(
		[...linksNavegacao]
			.map((link) => document.querySelector(link.getAttribute("href")))
			.filter(Boolean),
	)];
	const secoesVisiveis = new Set();

	function destacarSecao(idSecao) {
		linksNavegacao.forEach((link) => {
			const linkAtivo = link.getAttribute("href") === `#${idSecao}`;

			if (linkAtivo) {
				link.setAttribute("aria-current", "location");
			} else {
				link.removeAttribute("aria-current");
			}
		});
	}

	const observadorSecoes = new IntersectionObserver((entradas) => {
		entradas.forEach((entrada) => {
			if (entrada.isIntersecting) {
				secoesVisiveis.add(entrada.target.id);
			} else {
				secoesVisiveis.delete(entrada.target.id);
			}
		});

		const secaoVisivel = secoes.find((secao) => secoesVisiveis.has(secao.id));
		destacarSecao(secaoVisivel?.id);
	}, { rootMargin: "-35% 0px -55%", threshold: 0 });

	secoes.forEach((secao) => observadorSecoes.observe(secao));
}

function inicializarVoltarAoTopo() {
	const voltarTopo = document.querySelector(".voltar-topo");
	if (!voltarTopo) return;

	function atualizarVisibilidade() {
		voltarTopo.classList.toggle(
			"voltar-topo--visivel",
			window.scrollY > window.innerHeight / 2,
		);
	}

	window.addEventListener("scroll", atualizarVisibilidade, { passive: true });
	window.addEventListener("resize", atualizarVisibilidade);
	voltarTopo.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
	atualizarVisibilidade();
}

function atualizarAnoRodape() {
	const anoRodape = document.querySelector("[data-ano]");
	if (anoRodape) anoRodape.textContent = new Date().getFullYear();
}

function inicializarProgresso() {
	const barraProgresso = document.querySelector("#progresso-leitura");
	if (!barraProgresso) return;

	function atualizarProgresso() {
		const alturaRolavel = document.documentElement.scrollHeight - window.innerHeight;
		const progresso = alturaRolavel > 0
			? Math.min(1, Math.max(0, window.scrollY / alturaRolavel))
			: 0;
		barraProgresso.style.transform = `scaleX(${progresso})`;
	}

	window.addEventListener("scroll", atualizarProgresso, { passive: true });
	window.addEventListener("resize", atualizarProgresso);
	window.addEventListener("load", atualizarProgresso);
	atualizarProgresso();

	if ("ResizeObserver" in window) {
		const observadorTamanho = new ResizeObserver(atualizarProgresso);
		observadorTamanho.observe(document.body);
	}
}

function inicializarContador() {
	const campoMensagem = document.querySelector("#mensagem");
	const contador = document.querySelector("#contador-mensagem");
	if (!campoMensagem || !contador) return;

	function atualizarContador() {
		contador.textContent =
			`${campoMensagem.value.length} / ${campoMensagem.maxLength} caracteres`;
	}

	campoMensagem.addEventListener("input", atualizarContador);
	atualizarContador();
}

function inicializarEnvioFormulario() {
	const form = document.querySelector("#form-contato");
	const btnEnviar = document.querySelector("#btn-enviar");
	const statusMsg = document.querySelector("#mensagem-status");

	if (!form || !btnEnviar || !statusMsg) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		btnEnviar.disabled = true;
		const textoOriginal = btnEnviar.textContent;
		btnEnviar.textContent = "Enviando...";
		statusMsg.textContent = "";
		statusMsg.className = "status-envio";

		const formData = new FormData(form);
		const dadosFormulario = Object.fromEntries(formData.entries());

		try {
			const response = await fetch("https://formsubmit.co/ajax/ryanmartinsbatista2006@gmail.com", {
				method: "POST",
				body: JSON.stringify(dadosFormulario),
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				}
			});
			const resultado = await response.json();

			if (response.ok && resultado.success) {
				statusMsg.textContent = "Sua mensagem foi enviada com sucesso! Entrarei em contato em breve.";
				statusMsg.classList.add("sucesso");
				form.reset();
				const campoMensagem = document.querySelector("#mensagem");
				if (campoMensagem) {
					campoMensagem.dispatchEvent(new Event('input'));
				}
			} else {
				throw new Error(resultado.message || "Erro na resposta do servidor");
			}
		} catch {
			statusMsg.textContent = "Não foi possível enviar agora. Tente novamente ou escreva para ryanmartinsbatista2006@gmail.com.";
			statusMsg.classList.add("erro");
		} finally {
			btnEnviar.disabled = false;
			btnEnviar.textContent = textoOriginal;
		}
	});
}

document.documentElement.classList.add("js");
inicializarMenuMobile();
inicializarNavegacaoAtiva();
inicializarVoltarAoTopo();
atualizarAnoRodape();
inicializarProgresso();
inicializarContador();
inicializarEnvioFormulario();