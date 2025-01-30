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
const schedulingSelect = document.getElementById("schedulingAlgorithm");

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
    };

    processes.push(newProcess);
    console.log("processes", processes);
    renderProcessTable();
});

// Atualiza valor exibido da velocidade
speedRange.addEventListener("input", () => {
    speedValue.textContent = speedRange.value + " ms";
});

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

// Renderiza a tabela vazia de processos
// TODO: da para já deixar no HTML e só preencher os valores com JS
renderProcessTable();

// TODO: Implementar a lógica do escalonador
