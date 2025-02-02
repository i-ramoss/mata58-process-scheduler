import { initializeProcessPageTable, ensureProcessPagesInRAM, renderMemory } from "./memory.js";

// Estrutura de dados para armazenar os processos
const processes = [];

// Referências aos elementos HTML que interagem com os dados dos processos
const executionTimeInput = document.getElementById("executionTime");
const pagesInput = document.getElementById("pages");
const deadlineInput = document.getElementById("deadline");
const arrivalTimeInput = document.getElementById("arrivalTime");
const addProcessBtn = document.getElementById("addProcessBtn");

// Tabela onde os processos serão exibidos na interface
const processTableDiv = document.getElementById("processTable");

// Inputs adicionais para parâmetros de execução do escalonamento
const quantumInput = document.getElementById("quantum");
const overheadInput = document.getElementById("overhead");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const schedulingAlgorithmSelected = document.getElementById("schedulingAlgorithm");

// Botões de ação para interagir com o escalonador
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

// Div que exibe o gráfico de Gantt com a execução dos processos
const ganttChart = document.getElementById("ganttChart");

// Evento disparado ao clicar para adicionar um novo processo
addProcessBtn.addEventListener("click", () => {
    const id = processes.length + 1;

    // Cria um novo processo a partir dos dados fornecidos nos campos de input
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

// Atualiza o valor exibido da velocidade com base no input do usuário
speedRange.addEventListener("input", () => {
    speedValue.textContent = speedRange.value + " ms";
});

// Evento disparado ao clicar no botão "Iniciar Execução"
startBtn.addEventListener("click", () => {
    if (processes.length === 0) {
        alert("Adicione ao menos um processo!"); // Alerta se não houver processos
        return;
    }

    runScheduling(); // Inicia a execução dos processos
});

// Função para simular um atraso na execução de um processo (usada para a animação)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para renderizar a lista de processos na interface
function renderProcessTable() {
    let html =
        "<table border='1' cellpadding='5'><tr><th>ID</th><th>Chegada</th><th>Tempo de execução</th><th>Deadline</th><th>Páginas</th></tr>";

    // Cria a tabela de processos com os dados preenchidos
    processes.forEach(proc => {
        html += `<tr>
          <td>${proc.id}</td>
          <td>${proc.arrival}</td>
          <td>${proc.executionTime}</td>
          <td>${proc.deadline}</td>
          <td>${proc.pages}</td>
        </tr>`;
    });

    html += "</table>"; // Fecha a tabela
    processTableDiv.innerHTML = html; // Exibe a tabela no HTML
}

// Função para criar as linhas do gráfico de Gantt para cada processo
function createGanttRowsForProcesses(processList) {
    // Limpa o gráfico de Gantt antes de adicionar novos processos
    ganttChart.innerHTML = "";

    const processRows = {};

    processList.forEach(currentProcess => {
        // Cria um container para a linha de cada processo no gráfico
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("gantt-row");

        // Cria um label para identificar o processo ao lado da linha
        const label = document.createElement("div");
        label.classList.add("gantt-label");
        label.textContent = currentProcess.id + " : ";
        rowContainer.appendChild(label);

        // Cria um container para armazenar os blocos do gráfico de Gantt
        const blocksContainer = document.createElement("div");
        blocksContainer.classList.add("gantt-blocks-container");
        rowContainer.appendChild(blocksContainer);

        // Adiciona essa linha no gráfico de Gantt
        ganttChart.appendChild(rowContainer);

        // Armazena a referência dessa linha para atualizações futuras
        processRows[currentProcess.id] = blocksContainer;
    });

    return processRows;
}

// Função para criar um bloco no gráfico de Gantt
function createGanttBlock(type) {
    const block = document.createElement("div");
    block.classList.add("gantt-block");

    // Adiciona classes específicas para cada tipo de bloco (waiting, execution, etc)
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

    return block;
}

// Função que verifica se todos os processos foram executados
function allDone(listOfProcessToBeExecuted) {
    return listOfProcessToBeExecuted.every(process => process.remainingTime <= 0);
}

// Função para obter o próximo processo a ser executado usando FIFO
function getNextProcessFIFO(processList, currentTime) {
    // Filtra e ordena os processos pela ordem de chegada
    const sortedProcesses = processList
        .filter(p => p.arrival <= currentTime && p.remainingTime > 0)
        .sort((a, b) => a.arrival - b.arrival);

    return sortedProcesses.length > 0 ? sortedProcesses[0] : null; // Retorna o primeiro processo da lista
}

// Função para obter o próximo processo a ser executado usando o algoritmo SJF
function getNextProcessSJF(processList, currentTime) {
    // Filtra os processos que chegaram e ainda não terminaram
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Retorna null se não houver processos prontos

    // Retorna o processo com o menor tempo de execução
    return readyProcesses.reduce((shortest, process) =>
        process.executionTime < shortest.executionTime ? process : shortest
    );
}

// Função para obter o próximo processo a ser executado usando o algoritmo RR (Round Robin)
function getNextProcessRR(processList, currentTime, quantum, lastProcess) {
    // Filtra os processos prontos para execução
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Retorna null se não houver processos prontos

    // Encontra o índice do último processo executado
    const lastIndex = processList.findIndex(p => p.id === (lastProcess ? lastProcess.id : null));

    // Inicia a busca pelo próximo processo após o último executado
    let nextIndex = (lastIndex + 1) % processList.length;

    // Procura o próximo processo pronto para execução
    for (let i = 0; i < processList.length; i++) {
        const process = processList[nextIndex];
        if (process.arrival <= currentTime && process.remainingTime > 0) {
            return process; // Retorna o próximo processo pronto
        }
        nextIndex = (nextIndex + 1) % processList.length; // Avança para o próximo processo na lista
    }

    return null; // Retorna null se não houver processos para executar
}

// Função para obter o próximo processo usando o algoritmo EDF (Earliest Deadline First)
function getNextProcessEDF(processList, currentTime, quantum) {
    // Filtra os processos que já chegaram e ainda não foram concluídos
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Nenhum processo disponível no momento

// Determina qual algoritmo de escalonamento será usado
function handleNextProcess(schedulingAlgorithm, processList, currentTime, quantum, currentProcess) {
    switch (schedulingAlgorithm) {
        case "SJF":
            return getNextProcessSJF(processList, currentTime);
        case "FIFO":
            return getNextProcessFIFO(processList, currentTime);
        case "RR":
            return getNextProcessRR(processList, currentTime, quantum, currentProcess);
        case "EDF":
            return getNextProcessEDF(processList, currentTime, quantum, currentProcess);
        default:
            alert("Algoritmo não implementado");
    }
}

function drawOverheadBlockForPreemptedProcess(processList, preemptedProcess, processRows, currentTime, overheadTime) {
    console.log(`⏱ Desenhando overhead de ${preemptedProcess.id} no tempo ${currentTime}`);

    for (let i = 0; i < overheadTime; i++) {
        const overheadBlock = createGanttBlock("overhead");
        processRows[preemptedProcess.id].appendChild(overheadBlock);

        processList.forEach(process => {
            if (process.id !== preemptedProcess.id && process.remainingTime > 0) {
                if (process.arrival <= currentTime) {
                    const waitingBlock = createGanttBlock("waiting");
                    processRows[process.id].appendChild(waitingBlock);
                } else {
                    const noArrivedBlock = createGanttBlock("noArrived");
                    processRows[process.id].appendChild(noArrivedBlock);
                }
            }
        });
    }
}

function drawBlocksWhenCpuIsIdle(processList, processRows, currentTime) {
    processList.forEach(process => {
        if (process.remainingTime > 0) {
            if (process.arrival <= currentTime) {
                const waitingBlock = createGanttBlock("waiting");
                processRows[process.id].appendChild(waitingBlock);
            } else {
                const noArrivedBlock = createGanttBlock("noArrived");
                processRows[process.id].appendChild(noArrivedBlock);
            }
        }
    });
}

function drawWaitingOrNoArrivedBlocks(processList, currentProcess, processRows, currentTime) {
    processList.forEach(process => {
        if (process.id !== currentProcess.id && process.remainingTime > 0) {
            if (process.arrival <= currentTime) {
                const waitingBlock = createGanttBlock("waiting");
                processRows[process.id].appendChild(waitingBlock);
            } else {
                const noArrivedBlock = createGanttBlock("noArrived");
                processRows[process.id].appendChild(noArrivedBlock);
            }
        }
    });
}


        // Cria o bloco de execução para o processo atual
        const executionBlock = createGanttBlock("execution");

        // Verifica a previsão de término e se o deadline foi ultrapassado
        const willFinishTime = currentTime + 1;
        if (
            !(schedulingAlgorithm === "FIFO" || schedulingAlgorithm === "SJF") &&
            willFinishTime > currentProcess.individualDeadline
        ) {
            executionBlock.classList.add("deadline-exceeded");
        }

        // Adiciona o bloco de execução no gráfico de Gantt
        processRows[currentProcess.id].appendChild(executionBlock);

        // Atualiza o tempo e a quantidade restante do processo
        currentTime++;
        currentProcess.remainingTime--;

        // Marca o processo como concluído quando o tempo restante for zero
        if (currentProcess.remainingTime <= 0) {
            currentProcess.finishTime = currentTime;
        }

        // Aguarda antes de passar para o próximo ciclo
        await sleep(speedRange.value);

        lastProcess = currentProcess;
    }

    // Após a execução, calcula o turnaround de cada processo
    listOfProcessToBeExecuted.forEach(process => {
        process.turnaroundTime = process.finishTime - process.arrival;
    });

    // Calcula o turnaround médio
    const totalTurnaroundTime = listOfProcessToBeExecuted.reduce((sum, process) => {
        return sum + process.turnaroundTime;
    }, 0);

    const averageTurnaroundTime = totalTurnaroundTime / listOfProcessToBeExecuted.length;

    // Exibe o turnaround médio na interface
    document.getElementById("averageTurnaround").textContent = `Turnaround Médio: ${averageTurnaroundTime.toFixed(2)}`;
}

// Temporário (usado para processos já instanciados em código)
processes.forEach(initializeProcessPageTable);

// Renderiza a tabela vazia de processos
renderProcessTable();
