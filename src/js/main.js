import { initializeProcessPageTable, ensureProcessPagesInRAM, renderMemory } from "./memory.js";

// Estrutura de dados para armazenar os processos
const processes = [];

// Referências aos elementos do HTML
// Inputs dos dados do processo
const executionTimeInput = document.getElementById("executionTime");
const pagesInput = document.getElementById("pages");
const deadlineInput = document.getElementById("deadline");
const arrivalTimeInput = document.getElementById("arrivalTime");
const addProcessBtn = document.getElementById("addProcessBtn");

// Tabela de processos
const processTableDiv = document.getElementById("processTable");

// Inputs de quantum, sobrecarga, velocidade e algoritmo de escalonamento
const quantumInput = document.getElementById("quantum");
const overheadInput = document.getElementById("overhead");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const schedulingAlgorithmSelected = document.getElementById("schedulingAlgorithm");

// Botões de ação
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

// Grafico de Gantt
const ganttChart = document.getElementById("ganttChart");

// Adiciona processo à lista (sem apagar dados)
addProcessBtn.addEventListener("click", () => {
    const id = processes.length + 1;

    const newProcess = {
        id: "P" + id,
        executionTime: parseInt(executionTimeInput.value, 10),
        pages: parseInt(pagesInput.value, 10),
        deadline: parseInt(deadlineInput.value, 10),
        arrival: parseInt(arrivalTimeInput.value, 10),
        pageTable: [],
    };

    initializeProcessPageTable(newProcess);

    processes.push(newProcess);
    renderProcessTable();
    renderMemory();
});

// Atualiza valor exibido da velocidade
speedRange.addEventListener("input", () => {
    speedValue.textContent = speedRange.value + " ms";
});

// Ao clicar em Iniciar Execução
startBtn.addEventListener("click", () => {
    if (processes.length === 0) {
        alert("Adicione ao menos um processo!");
        return;
    }
    runScheduling();
});

// Simula o atraso de execução de um processo
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para renderizar a lista de processos criados
function renderProcessTable() {
    let html =
        "<table border='1' cellpadding='5'><tr><th>ID</th><th>Tempo de execução</th><th>Páginas</th><th>Deadline</th><th>Chegada</th></tr>";

    // TODO: criar objetos que possam ser editáveis depois de criados com valores default
    processes.forEach(proc => {
        html += `<tr>
          <td>${proc.id}</td>
          <td>${proc.executionTime}</td>
          <td>${proc.pages}</td>
          <td>${proc.deadline}</td>
          <td>${proc.arrival}</td>
        </tr>`;
    });

    html += "</table>"; // Fecha a tabela
    processTableDiv.innerHTML = html;
}

// Cria uma linha no gráfico para cada processo da lista
function createGanttRowsForProcesses(processList) {
    // Limpa as linhas existentes do gráfico
    ganttChart.innerHTML = "";

    const processRows = {};

    processList.forEach(currentProcess => {
        // Cria um container para a linha do processo
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("gantt-row");

        // Cria um label do lado esquerdo com o nome do processo
        const label = document.createElement("div");
        label.classList.add("gantt-label");
        label.textContent = currentProcess.id + " : ";
        rowContainer.appendChild(label);

        // Cria um container que vai armazenar os blocos
        const blocksContainer = document.createElement("div");
        blocksContainer.classList.add("gantt-blocks-container");
        rowContainer.appendChild(blocksContainer);

        // Adiciona essa linha ao gráfico
        ganttChart.appendChild(rowContainer);

        // Armazena referência para atualização dos status dos blocos
        processRows[currentProcess.id] = blocksContainer;
    });

    return processRows;
}

// Cria um bloco para as linhas dos processos no gráfico
function createGanttBlock(type, text, deadlineExceeded = false) {
    const block = document.createElement("div");
    block.classList.add("gantt-block");

    // Dependendo do tipo, adiciona estilização própria
    if (type === "waiting") {
        block.classList.add("waiting");
    } else if (type === "execution") {
        block.classList.add("execution");
    } else if (type === "overhead") {
        block.classList.add("overhead");
    } else if (type === "noArrived") {
        block.classList.add("no-arrived");
    }
    // TODO: adicionar else if para page fault

    // block.textContent = text || " ";

    // Em casos de sobrecarga, o bloco é marcado
    if (deadlineExceeded) {
        block.classList.add("deadline-exceeded");
    }

    return block;
}

// Checa se todos os processos já foram executados
function allDone(listOfProcessToBeExecuted) {
    return listOfProcessToBeExecuted.every(process => process.remainingTime <= 0);
}

// TODO: função para criar blocos de waiting ou noArrived (evitar repetição de código)

// Função principal de execução do escalonamento
async function runScheduling() {
    // Copia a lista de processos original para uma outra estrutura, para não perder os dados originais
    // Cria-se novos atributos que serão utilizados durante a execução
    let listOfProcessToBeExecuted = processes.map(currentProcess => ({
        ...currentProcess,
        remainingTime: currentProcess.executionTime,
        finishTime: 0,
        individualDeadline: currentProcess.arrival + currentProcess.deadline,
    }));

    // Criamos as linhas no gráfico para cada processo
    const processRows = createGanttRowsForProcesses(listOfProcessToBeExecuted);

    // Variáveis de controle em relação à sobrecarga, tempo atual e último processo executado
    const overheadTime = parseInt(overheadInput.value, 10) || 0;
    let currentTime = 0;
    let lastProcess = null;

    // Loop de execução da lista de processos
    while (!allDone(listOfProcessToBeExecuted)) {
        // currentProcess é o próximo processo que será executado, retornado pelo algoritmo de escalonamento
        // TODO: chamar algoritmo de escalonamento correto e retornar o processo que deve ser executado
        const currentProcess = null;

        if (currentProcess) {
            // TODO: atualizar currentTime com o retorno da função (adicionando ou não page faults)
            ensureProcessPagesInRAM(currentProcess, currentTime);
            // currentTime = ensureProcessPagesInRAM(currentProcess, currentTime);
        } else {
            console.log(`🔥 não tem processo para ser executado no tempo: ${currentTime}`);
            listOfProcessToBeExecuted.forEach(process => {
                if (process.remainingTime > 0) {
                    // Adiciona bloco de waiting na linha de todos os processos que chegaram e ainda não terminaram
                    if (process.arrival <= currentTime) {
                        const waitingBlock = createGanttBlock("waiting", "");
                        processRows[process.id].appendChild(waitingBlock);
                        // Adiciona bloco de noArrived na linha de todos os processos que não chegarm
                    } else {
                        const noArrivedBlock = createGanttBlock("noArrived", "");
                        processRows[process.id].appendChild(noArrivedBlock);
                    }
                }
            });

            // Incrementa o tempo atual e aguarda um tempo para visualização
            currentTime++;
            await sleep(speedRange.value);
            continue;
        }

        // Adiciona blocos de sobrecarga (se possível) quando houver mudança de processo
        if (lastProcess && lastProcess !== currentProcess && overheadTime > 0) {
            for (let i = 0; i < overheadTime; i++) {
                const overheadBlock = createGanttBlock("overhead", "");
                processRows[lastProcess.id].appendChild(overheadBlock);

                listOfProcessToBeExecuted.forEach(process => {
                    if (process.id !== lastProcess.id && process.remainingTime > 0) {
                        if (process.arrival <= currentTime) {
                            const waitingBlock = createGanttBlock("waiting", "");
                            processRows[process.id].appendChild(waitingBlock);
                        } else {
                            const noArrivedBlock = createGanttBlock("noArrived", "");
                            processRows[process.id].appendChild(noArrivedBlock);
                        }
                    }
                });

                currentTime++;
                await sleep(speedRange.value);
            }
        }

        // Adiciona o bloco correspondente a todos os outros processos pendentes ou que ainda não chegaram, e que não estão em execução
        listOfProcessToBeExecuted.forEach(process => {
            if (process.id !== currentProcess.id && process.remainingTime > 0) {
                if (process.arrival <= currentTime) {
                    const waitingBlock = createGanttBlock("waiting", "");
                    processRows[process.id].appendChild(waitingBlock);
                } else {
                    const noArrivedBlock = createGanttBlock("noArrived", "");
                    processRows[process.id].appendChild(noArrivedBlock);
                }
            }
        });

        const executionBlock = createGanttBlock("execution", currentProcess.id);

        // Previsao de termino do processo
        const willFinishTime = currentTime + 1;

        if (willFinishTime > currentProcess.individualDeadline) {
            executionBlock.classList.add("deadline-exceeded");
        }

        // Adiciona o bloco de execução na linha do processo
        processRows[currentProcess.id].appendChild(executionBlock);

        currentTime++;
        currentProcess.remainingTime--;

        if (currentProcess.remainingTime <= 0) {
            currentProcess.finishTime = currentTime;
        }

        await sleep(speedRange.value);

        lastProcess = currentProcess;
    }
}

// Temporário (usado para processos já instanciados em código)
processes.forEach(initializeProcessPageTable);

// Renderiza a tabela vazia de processos
renderProcessTable();
