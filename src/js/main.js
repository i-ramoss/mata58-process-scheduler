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

//Botão da legenda
const legendaBtn = document.getElementById("legenda_btn");
const legenda = document.querySelector(".legenda");

let blocksAdded = false; // Flag para controlar a adição/remoção

legendaBtn.addEventListener("click", () => {
    if (!blocksAdded) {
        // Criar os blocos
        const block1 = document.createElement("div");
        const block2 = document.createElement("div");
        const block3 = document.createElement("div");
        const block4 = document.createElement("div");

        block1.innerHTML = `<span style="margin-left: 30px;">Execução</span>`;
        block2.innerHTML = `<span style="margin-left: 30px;">Espera</span>`;
        block3.innerHTML = `<span style="margin-left: 30px;">Overhead</span>`;
        block4.innerHTML = `<span style="margin-left: 30px;">Ausente</span>`;

        // Adiciona classes
        block1.classList.add("gantt-block", "execution");
        block2.classList.add("gantt-block", "waiting");
        block3.classList.add("gantt-block", "overhead");
        block4.classList.add("gantt-block", "no-arrived");

        // Adiciona os blocos ao container
        legenda.appendChild(block1);
        legenda.appendChild(block2);
        legenda.appendChild(block3);
        legenda.appendChild(block4);

        blocksAdded = true; // Atualiza a flag
    } else {
        // Remove todos os blocos filhos ao clicar novamente
        legenda.innerHTML = "";
        blocksAdded = false;
    }
});
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

resetBtn.addEventListener("click", () => {
    if (processes.length === 0) {
        alert("Adicione ao menos um processo!"); // Alerta se não houver processos
        return;
    }
    // Limpa a lista de processos
    processes.length = 0;

    // Remove a tabela de processos da interface
    processTableDiv.innerHTML = "";

    // Limpa o gráfico de Gantt
    ganttChart.innerHTML = "";

    // Reseta o Turnaround Médio
    document.getElementById("averageTurnaround").textContent = "Turnaround Médio: -";

    const timeLabels = document.getElementById("timeLabels");
    if (timeLabels) timeLabels.remove();
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

    // Cria container para os contadores de tempo
    const timeLabelsContainer = document.createElement("div");
    timeLabelsContainer.id = "timeLabels";
    timeLabelsContainer.classList.add("gantt-time-labels");

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
        ganttChart.appendChild(timeLabelsContainer);

        // Armazena a referência dessa linha para atualizações futuras
        processRows[currentProcess.id] = blocksContainer;
    });

    return { processRows, timeLabelsContainer };
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
function getNextProcessSJF(processList, currentTime, currentProcess) {
    // Filtra os processos que chegaram e ainda não terminaram
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Retorna null se não houver processos prontos

    // Se já existe um processo em execução e ele ainda não terminou, retorna ele
    if (currentProcess && currentProcess.remainingTime > 0) {
        return currentProcess;
    }

    // Retorna o processo com o menor tempo de execução
    // Se houver empate, retorna o processo que chegou primeiro
    return readyProcesses.reduce((shortest, process) => {
        if (process.executionTime < shortest.executionTime) return process;
        else if (process.executionTime === shortest.executionTime)
            return process.arrival < shortest.arrival ? process : shortest;
        else return shortest;
    });
}

// Função para obter o próximo processo a ser executado usando o algoritmo RR (Round Robin)
function getNextProcessRR(processList, currentTime, lastProcess) {
    // Filtra os processos prontos para execução
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Retorna null se não houver processos prontos

    // Encontra o índice do último processo executado, se estiver definido.
    // Se não, começa do início da lista
    const lastIndex = lastProcess ? processList.findIndex(p => p.id === (lastProcess ? lastProcess.id : null)) : -1;

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
function getNextProcessEDF(processList, currentTime) {
    // Filtra os processos que já chegaram e ainda não foram concluídos
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Nenhum processo disponível no momento

    // Ordena os processos pela menor deadline absoluta
    readyProcesses.sort((a, b) => a.individualDeadline - b.individualDeadline);

    return readyProcesses[0]; // Retorna o processo com o menor deadline
}

// Determina qual algoritmo de escalonamento será usado
function handleNextProcess(schedulingAlgorithm, processList, currentTime, quantum, currentProcess, lastProcessRR) {
    switch (schedulingAlgorithm) {
        case "SJF":
            return getNextProcessSJF(processList, currentTime, currentProcess);
        case "FIFO":
            return getNextProcessFIFO(processList, currentTime);
        case "RR":
            // Se ainda estamos dentro do quantum do processo atual, continue executando-o
            if (currentProcess && currentProcess.remainingTime > 0 && currentProcess.quantumCounter < quantum) {
                return currentProcess;
            } else {
                // Caso contrário, selecione o próximo processo baseado no algoritmo RR
                return getNextProcessRR(processList, currentTime, lastProcessRR);
            }
        case "EDF":
            return getNextProcessEDF(processList, currentTime);
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

// Função principal que executa o escalonamento dos processos
async function runScheduling() {
    let listOfProcessToBeExecuted = processes.map(process => ({
        ...process,
        remainingTime: process.executionTime,
        finishTime: 0,
        individualDeadline: process.arrival + process.deadline,
        quantumCounter: 0,
    }));

    // Cria as linhas do gráfico para cada processo
    const { processRows, timeLabelsContainer } = createGanttRowsForProcesses(listOfProcessToBeExecuted);

    // Variáveis de controle do tempo e do último processo executado
    const overheadTime = parseInt(overheadInput.value, 10) || 1;
    const schedulingAlgorithm = schedulingAlgorithmSelected.value;
    const quantum = parseInt(quantumInput.value, 10) || 2;

    let currentTime = 0;
    let timeCounter = 0;
    let currentProcess = null;
    let lastProcessRR = null;

    // Loop que simula a execução do escalonamento dos processos
    while (!allDone(listOfProcessToBeExecuted)) {
        const newProcess = handleNextProcess(
            schedulingAlgorithm,
            listOfProcessToBeExecuted,
            currentTime,
            quantum,
            currentProcess,
            lastProcessRR
        );

        if (!newProcess) {
            drawBlocksWhenCpuIsIdle(listOfProcessToBeExecuted, processRows, currentTime);

            currentTime++;
            timeCounter++;
            await sleep(speedRange.value);
            continue;
        }

        // Verifica preempção por deadline:
        if (
            schedulingAlgorithm === "EDF" &&
            currentProcess &&
            currentProcess.id !== newProcess.id &&
            currentProcess.remainingTime > 0
        ) {
            console.log(`💡 Preempção por deadline: ${currentProcess.id} → ${newProcess.id} em t=${currentTime}`);

            // Desenha os blocos de overhead para o processo preemptado
            for (let i = 0; i < overheadTime; i++) {
                processRows[currentProcess.id].appendChild(createGanttBlock("overhead"));

                drawWaitingOrNoArrivedBlocks(listOfProcessToBeExecuted, currentProcess, processRows, currentTime);

                currentTime++;
                timeCounter++;
                await sleep(speedRange.value);
            }

            // Reseta o contador de quantum do processo preemptado
            currentProcess.quantumCounter = 0;
        }

        // Sempre que o tempo avançar, atualize os contadores
        const timeLabel = document.createElement("div");
        timeLabel.classList.add("time-label");
        timeLabel.textContent = timeCounter;
        timeLabelsContainer.appendChild(timeLabel);

        // Atualiza o processo em execução para o novo processo que foi escolhido
        currentProcess = newProcess;
        // Mantém a referência do último processo executado para o RR
        lastProcessRR = newProcess;

        // TODO: atualizar currentTime com o retorno da função (adicionando ou não page faults)
        ensureProcessPagesInRAM(listOfProcessToBeExecuted, currentProcess, currentTime);

        // Atualiza os blocos de waiting para os processos que não estão sendo executados
        drawWaitingOrNoArrivedBlocks(listOfProcessToBeExecuted, currentProcess, processRows, currentTime);

        // Cria o bloco de execução para o processo atual
        const executionBlock = createGanttBlock("execution");

        // Verifica a previsão de término e se o deadline foi ultrapassado
        const willFinishTime = currentTime + 1;
        if (
            (schedulingAlgorithm === "RR" || schedulingAlgorithm === "EDF") &&
            willFinishTime > currentProcess.individualDeadline
        ) {
            executionBlock.classList.add("deadline-exceeded");
        }

        // Adiciona o bloco de execução no gráfico de Gantt
        processRows[currentProcess.id].appendChild(executionBlock);

        // Atualiza o tempo e a quantidade restante do processo
        currentTime++;
        timeCounter++;
        currentProcess.remainingTime--;

        if (currentProcess.remainingTime <= 0) {
            currentProcess.finishTime = currentTime;
            currentProcess.quantumCounter = 0;
        }

        // Se preemptivo e o processo ainda não terminou, gerencia o contador de quantum APENAS APÓS A EXECUÇÃO
        else if (schedulingAlgorithm === "RR" || schedulingAlgorithm === "EDF") {
            currentProcess.quantumCounter++;

            if (currentProcess.quantumCounter >= quantum) {
                console.log(
                    `🚀 Preempção por quantum: ${currentProcess.id} → ${currentProcess.id} em t=${currentTime}`
                );

                for (let i = 0; i < overheadTime; i++) {
                    processRows[currentProcess.id].appendChild(createGanttBlock("overhead"));

                    drawWaitingOrNoArrivedBlocks(listOfProcessToBeExecuted, currentProcess, processRows, currentTime);

                    currentTime++;
                    timeCounter++;
                    await sleep(speedRange.value);
                }
                // Zera o contador e força a seleção de um novo processo na próxima iteração
                currentProcess.quantumCounter = 0;
                currentProcess = null;
            }
        }

        await sleep(speedRange.value);
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
